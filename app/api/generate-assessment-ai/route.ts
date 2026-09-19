import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { analyseUSAssessment } from "@/lib/assessment/usa/engine";
import {
  US_ASSESSMENT_VERSION,
  USAssessmentAnswers,
} from "@/lib/assessment/usa/schema";

const reportSchema = {
  type: "object",
  properties: {
    bottom_line: { type: "string" },
    home_energy_snapshot: { type: "string" },
    fuel_specific_findings: {
      type: "array",
      items: { type: "string" },
      maxItems: 6,
    },
    solar_battery_ev_findings: {
      type: "array",
      items: { type: "string" },
      maxItems: 4,
    },
    positive_findings: {
      type: "array",
      items: { type: "string" },
      maxItems: 5,
    },
    what_to_check_next: {
      type: "array",
      items: { type: "string" },
      maxItems: 5,
    },
    assumptions_and_limits: {
      type: "array",
      items: { type: "string" },
      maxItems: 6,
    },
  },
  required: [
    "bottom_line",
    "home_energy_snapshot",
    "fuel_specific_findings",
    "solar_battery_ev_findings",
    "positive_findings",
    "what_to_check_next",
    "assumptions_and_limits",
  ],
  additionalProperties: false,
};

type UploadedPhoto = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

async function checkPaidAccess(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("USA AI assessment access check missing Supabase env vars.");
    return false;
  }

  const adminSupabase = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await adminSupabase
    .from("paid_users")
    .select("paid_access")
    .eq("email", email.toLowerCase().trim())
    .eq("paid_access", true)
    .maybeSingle();

  if (error) {
    console.error("USA AI assessment paid access lookup error:", error);
    return false;
  }

  return Boolean(data?.paid_access);
}

function isUSAssessmentAnswers(value: unknown): value is USAssessmentAnswers {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<USAssessmentAnswers>;

  return (
    candidate.assessment_version === US_ASSESSMENT_VERSION &&
    Boolean(candidate.home) &&
    Boolean(candidate.hvac) &&
    Boolean(candidate.water_heating) &&
    Boolean(candidate.appliances) &&
    Boolean(candidate.outdoor) &&
    Boolean(candidate.solar_battery_ev) &&
    Boolean(candidate.bills_behaviour)
  );
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to generate an AI assessment." },
        { status: 401 }
      );
    }

    if (!(await checkPaidAccess(user.email))) {
      return NextResponse.json(
        { error: "Paid access is required to generate a Save Your EGO assessment." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const answers = body.answers;
    const photos = Array.isArray(body.photos)
      ? (body.photos as UploadedPhoto[]).slice(0, 5)
      : [];

    if (!isUSAssessmentAnswers(answers)) {
      return NextResponse.json(
        { error: "Missing or invalid USA assessment answers." },
        { status: 400 }
      );
    }

    const analysis = analyseUSAssessment(answers);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });

    const prompt = `
You are the explanatory writing layer for Save Your EGO USA.

Core product principle:
Investigate why energy is being wasted before recommending that the homeowner buy something.
Fix the $20 problem before the $20,000 solution.

You are NOT the calculation engine.
The application has already calculated, classified, ranked and suppressed recommendations.
You must explain the validated result without inventing new financial values or new upgrade recommendations.

Rules:
- Use US terminology, dollars, Fahrenheit and square feet where applicable.
- Do not invent energy prices, equipment prices, savings, payback, system sizes or incentives.
- Do not describe a bill, energy use, spending level or home as high/low/efficient/inefficient unless VALIDATED ANALYSIS explicitly contains a benchmark supporting that comparison. If no benchmark is supplied, describe the absolute value only.
- Do not override recommendation groups, confidence, costs or payback.
- Do not recommend an expensive upgrade that is not present in VALIDATED ANALYSIS.
- Equipment age is context only, never proof that replacement is needed.
- Do not recommend buying an energy monitor as a diagnostic step.
- Do not recommend rooftop solar for an apartment, condo/HOA case without private roof authority, or where the validated analysis suppressed it.
- If roof information is insufficient, do not invent a solar system size.
- Separate bill savings from comfort, resilience, reliability and maintenance benefits.
- Do not repeat the same advice across sections.
- If evidence is insufficient, say so.
- Photos can support evidence but cannot override the validated analysis or create a recommendation.
- Do not infer unreadable specifications or inefficiency from appearance alone.
- Keep the report concise and actionable.

Customer-facing recommendation groups in VALIDATED ANALYSIS:
- Do Now
- Low-Cost Fixes
- Investigate Next
- Consider Later

For "what_to_check_next", prefer the validated investigation items and simple household checks.
For positive findings, use the supplied positive findings and do not manufacture praise.
For assumptions and limits, use the supplied assumptions plus material missing-input limitations.
For solar/battery/EV, return an empty array when those topics are not materially relevant.

ASSESSMENT ANSWERS:
${JSON.stringify(answers, null, 2)}

VALIDATED ANALYSIS:
${JSON.stringify(analysis, null, 2)}
`;

    const content: Array<
      | { type: "input_text"; text: string }
      | { type: "input_image"; image_url: string; detail: "auto" }
    > = [{ type: "input_text", text: prompt }];

    if (photos.length > 0) {
      content.push({
        type: "input_text",
        text:
          "The following appliance photos are supporting evidence only. Do not create new recommendations from appearance alone.",
      });

      photos.forEach((photo, index) => {
        content.push({
          type: "input_text",
          text: `Photo ${index + 1}: ${photo.name || "Uploaded appliance photo"}`,
        });
        content.push({
          type: "input_image",
          image_url: photo.dataUrl,
          detail: "auto",
        });
      });
    }

    const response = await client.responses.create({
      model: process.env.AI_MODEL || "gpt-5.4-mini",
      input: [{ role: "user" as const, content }],
      text: {
        format: {
          type: "json_schema",
          name: "save_your_ego_usa_report_narrative",
          schema: reportSchema,
          strict: true,
        },
      },
    });

    return NextResponse.json({
      reportText: response.output_text,
      report: JSON.parse(response.output_text),
      analysis,
    });
  } catch (error) {
    console.error("Generate USA assessment AI error:", error);

    return NextResponse.json(
      { error: "Failed to generate USA assessment." },
      { status: 500 }
    );
  }
}
