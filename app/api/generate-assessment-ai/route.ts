import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const reportSchema = {
  type: "object",
  properties: {
    photo_summary: {
      type: "string",
    },
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
    "photo_summary",
    "top_energy_drains",
    "top_recommended_actions",
    "quick_wins",
    "bigger_upgrades",
    "extra_insights",
    "bottom_line",
  ],
  additionalProperties: false,
};

type UploadedPhoto = {
  name: string;
  mimeType: string;
  dataUrl: string;
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
        { error: "You must be signed in to generate an AI assessment." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const answers = body.answers;
    const scores = body.scores;
    const photos = Array.isArray(body.photos)
      ? (body.photos as UploadedPhoto[]).slice(0, 5)
      : [];

    if (!answers || !scores) {
      return NextResponse.json(
        { error: "Missing assessment answers or scores." },
        { status: 400 }
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
- If appliance photos reveal visible useful details, use them as supporting evidence.
- Do not invent exact model numbers, ratings, ages or faults if they are unclear from photos.
- Focus on the most likely savings first.
- Keep every item short and practical.
- Do not repeat the same point across multiple sections.
- Respect existing strengths such as solar, battery or strong fabric performance where present.
- Consider electricity, heating fuel, hot water, cooking, EV charging, appliances and broader household energy use.

Photo analysis rules:
- If no useful appliance photos are provided, set photo_summary to "No appliance photos analysed."
- If photos are provided, briefly describe what they appear to show.
- Use cautious wording such as appears, may, likely or should be checked.
- Do not diagnose electrical, gas, mould, damp, wiring or safety issues from images as fact.
- Do not provide unsafe repair instructions.

Safety and scope:
- Give practical home energy guidance only.
- Do not provide electrical, gas, structural, legal, grant, medical or financial advice as a final professional recommendation.
- Do not give step-by-step instructions for unsafe electrical, gas, heating or structural work.
- Recommend a qualified professional where safety, compliance, invasive retrofit work, grants or regulated works are involved.
- Do not guarantee exact savings, exact payback periods or exact energy reductions.
- Use words like likely, may, appears, indicative and should be checked where uncertainty exists.

Return:
- photo_summary: one short paragraph
- top_energy_drains: exactly 3 short items
- top_recommended_actions: exactly 3 short items
- quick_wins: exactly 3 short items
- bigger_upgrades: exactly 3 short items
- extra_insights: 3 to 5 short items
- bottom_line: exactly 1 sentence

Assessment answers:
${JSON.stringify(answers, null, 2)}

Calculated scores and analysis:
${JSON.stringify(scores, null, 2)}
`;

    const content: Array<
      | { type: "input_text"; text: string }
      | { type: "input_image"; image_url: string }
    > = [
      {
        type: "input_text",
        text: prompt,
      },
    ];

    if (photos.length > 0) {
      content.push({
        type: "input_text",
        text: `The user uploaded ${photos.length} appliance photo(s). Analyse them only as supporting evidence.`,
      });

      photos.forEach((photo, index) => {
        content.push({
          type: "input_text",
          text: `Photo ${index + 1}: ${photo.name || "Uploaded appliance photo"}`,
        });

        content.push({
          type: "input_image",
          image_url: photo.dataUrl,
        });
      });
    }

    const response = await client.responses.create({
      model: process.env.AI_MODEL || "gpt-5.4-mini",
      input: [
        {
          role: "user" as const,
content: content as any,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "save_your_ego_pre_save_report",
          schema: reportSchema,
          strict: true,
        },
      },
    });

    return NextResponse.json({
      reportText: response.output_text,
      report: JSON.parse(response.output_text),
    });
  } catch (error) {
    console.error("Generate assessment AI error:", error);

    return NextResponse.json(
      { error: "Failed to generate AI assessment." },
      { status: 500 }
    );
  }
}