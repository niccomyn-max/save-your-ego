import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const reportSchema = {
  type: "object",
  properties: {
    top_energy_drains: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
    top_recommended_actions: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
    quick_wins: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
    bigger_upgrades: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 3,
    },
    extra_insights: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },
    bottom_line: {
      type: "string",
    },
  },
  required: [
    "top_energy_drains",
    "top_recommended_actions",
    "quick_wins",
    "bigger_upgrades",
    "extra_insights",
    "bottom_line",
  ],
  additionalProperties: false,
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be signed in to generate a report." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const assessmentId = body.assessmentId;

    if (!assessmentId) {
      return NextResponse.json(
        { error: "Missing assessment ID." },
        { status: 400 }
      );
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("id, user_id, answers, scores, created_at")
      .eq("id", assessmentId)
      .eq("user_id", user.id)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: "Assessment not found." },
        { status: 404 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey,
    });

    const prompt = `
You are a practical home energy advisor helping an ordinary homeowner.

Save Your EGO means Save Your Electricity, Gas and Oil.

Return a JSON object only.
Do not include markdown.
Do not include extra commentary.
Do not ask a question.
Do not invite the user to continue.

Prioritisation rules:
- Prioritise recommendations that match the actual inputs, not generic advice.
- If insulation and glazing are already good, do not push fabric upgrades unless clearly justified.
- If a heat pump is already present, do not treat heating replacement as a priority.
- Use the appliance estimates and bill anchor to judge what is most likely driving use.
- Focus on the most likely savings first.
- Keep every item short and practical.
- Do not repeat the same point across multiple sections.
- Respect existing strengths such as solar, battery or strong fabric performance where present.
- Consider electricity, heating fuel, hot water, cooking, EV charging, appliances and broader household energy use.

Safety and scope:
- Give practical home energy guidance only.
- Do not provide electrical, gas, structural, legal, grant, medical or financial advice as a final professional recommendation.
- Do not give step-by-step instructions for unsafe electrical, gas, heating or structural work.
- Recommend a qualified professional where safety, compliance, invasive retrofit work, grants or regulated works are involved.
- Do not guarantee exact savings, exact payback periods or exact energy reductions.
- Use words like likely, may, appears, indicative and should be checked where uncertainty exists.

Return:
- top_energy_drains: exactly 3 short items
- top_recommended_actions: exactly 3 short items
- quick_wins: exactly 3 short items
- bigger_upgrades: exactly 3 short items
- extra_insights: 3 to 5 short items
- bottom_line: exactly 1 sentence

Assessment answers:
${JSON.stringify(assessment.answers, null, 2)}

Calculated scores and analysis:
${JSON.stringify(assessment.scores, null, 2)}
`;

    const response = await client.responses.create({
      model: process.env.AI_MODEL || "gpt-5.4-mini",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "save_your_ego_report",
          schema: reportSchema,
          strict: true,
        },
      },
    });

    const reportText = response.output_text;

    const { data: savedReport, error: reportError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        assessment_id: assessment.id,
        report_text: reportText,
      })
      .select("id, report_text, created_at")
      .single();

    if (reportError) {
      return NextResponse.json(
        { error: reportError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      report: savedReport,
    });
  } catch (error) {
    console.error("Generate report error:", error);

    return NextResponse.json(
      { error: "Failed to generate report." },
      { status: 500 }
    );
  }
}