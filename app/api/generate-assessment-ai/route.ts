import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

const actionSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
    },
    why_it_matters: {
      type: "string",
    },
    estimated_cost_range: {
      type: "string",
    },
    estimated_annual_saving_range: {
      type: "string",
    },
    effort_level: {
      type: "string",
    },
    likely_payback: {
      type: "string",
    },
    priority: {
      type: "string",
    },
    suggested_next_step: {
      type: "string",
    },
  },
  required: [
    "action",
    "why_it_matters",
    "estimated_cost_range",
    "estimated_annual_saving_range",
    "effort_level",
    "likely_payback",
    "priority",
    "suggested_next_step",
  ],
  additionalProperties: false,
};

const reportSchema = {
  type: "object",
  properties: {
    photo_summary: {
      type: "string",
    },

    bottom_line: {
      type: "string",
    },

    executive_summary: {
      type: "string",
    },

    estimated_annual_energy_cost_profile: {
      type: "string",
    },

    unusual_usage_warning: {
      type: "string",
    },

    top_5_priorities: {
      type: "array",
      items: { type: "string" },
      minItems: 5,
      maxItems: 5,
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
      maxItems: 4,
    },

    priority_action_plan: {
      type: "array",
      items: actionSchema,
      minItems: 4,
      maxItems: 5,
    },

    low_cost_quick_wins: {
      type: "array",
      items: actionSchema,
      minItems: 3,
      maxItems: 3,
    },

    medium_cost_improvements: {
      type: "array",
      items: actionSchema,
      minItems: 2,
      maxItems: 3,
    },

    higher_cost_upgrades: {
      type: "array",
      items: actionSchema,
      minItems: 2,
      maxItems: 3,
    },

    electricity_specific_advice: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },

    gas_specific_advice: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 4,
    },

    oil_specific_advice: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 4,
    },

    appliance_findings: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },

    behaviour_changes: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },

    contractor_questions: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },

    what_to_check_next: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },

    important_assumptions: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },
  },
  required: [
    "photo_summary",
    "bottom_line",
    "executive_summary",
    "estimated_annual_energy_cost_profile",
    "unusual_usage_warning",
    "top_5_priorities",
    "top_energy_drains",
    "top_recommended_actions",
    "quick_wins",
    "bigger_upgrades",
    "extra_insights",
    "priority_action_plan",
    "low_cost_quick_wins",
    "medium_cost_improvements",
    "higher_cost_upgrades",
    "electricity_specific_advice",
    "gas_specific_advice",
    "oil_specific_advice",
    "appliance_findings",
    "behaviour_changes",
    "contractor_questions",
    "what_to_check_next",
    "important_assumptions",
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

Main objective:
Create a useful, customer-facing home energy report that feels valuable enough to pay for. The report must explain likely issues, estimated costs, estimated savings, effort levels, payback guidance and practical next steps.

Important:
- The figures must be indicative ranges, not guarantees.
- Use the user's country, currency and energy context where available.
- If the country is US, use dollars.
- If the country is Ireland or EU, use euros.
- If the country is UK, use pounds.
- If currency is unclear, write the ranges in a currency-neutral way.
- Use ordinary homeowner language.
- Be specific to the answers and calculated scores.
- Do not repeat the same idea across multiple sections unless it genuinely belongs there.
- Do not make the report feel thin.
- Do not overstate certainty.

Usage warning rules:
- If estimated annual electricity use is above 12,000 kWh, unusual_usage_warning must clearly say this is unusually high and should be checked.
- If estimated annual electricity use is above 20,000 kWh, unusual_usage_warning must strongly flag this as very high and likely driven by EV charging, hot tub, electric heating, hot water, incorrect bill frequency, annual bill override, tariff assumptions or missing/incorrect inputs.
- If appliance estimate is above 8,000 kWh/year, unusual_usage_warning must flag this as a high appliance load and recommend checking major loads.
- If nothing appears unusual, unusual_usage_warning should say no major usage warning is triggered, while still noting that bill and appliance inputs are indicative.

Solar repetition rules:
- The app has a dedicated Solar PV suitability section outside this AI text.
- Do not repeat solar heavily across every section.
- Solar may appear in top priorities or action plans only if it is genuinely one of the strongest opportunities.
- Do not put solar in more than one of these detailed sections unless clearly justified: priority_action_plan, medium_cost_improvements, higher_cost_upgrades.
- If solar appears as a higher-cost upgrade, do not also make it a medium-cost improvement.
- Battery advice should only appear if the inputs make it useful, and it should be cautious.

Prioritisation rules:
- Prioritise recommendations that match the actual inputs, not generic advice.
- If insulation and glazing are already good, do not push fabric upgrades unless clearly justified.
- If a heat pump is already present, do not treat heating replacement as a priority.
- Use appliance estimates and bill anchor to judge what is most likely driving use.
- If appliance photos reveal useful details, use them only as supporting evidence.
- Do not invent exact model numbers, ratings, ages or faults if they are unclear from photos.
- Focus on the most likely savings first.
- Respect existing strengths such as solar, battery or strong fabric performance where present.
- Consider electricity, heating fuel, hot water, cooking, EV charging, appliances and broader household energy use.
- If gas is not used, gas_specific_advice should say that gas does not appear to be used and no gas-specific action is currently needed.
- If oil is not used, oil_specific_advice should say that oil does not appear to be used and no oil-specific action is currently needed.
- If gas or oil is used, include fuel-specific efficiency checks, control improvements and professional servicing guidance.

Cost and saving rules:
- Use broad, realistic ranges.
- Do not promise exact savings.
- Do not include made-up grant amounts.
- Do not recommend a specific contractor, brand or product.
- For low-cost actions, give ranges such as "$0-$100", "$20-$250" or "low/no cost" where suitable.
- For medium-cost actions, use ranges such as "$100-$1,000" where suitable.
- For larger upgrades, use broader ranges such as "$1,000-$8,000+" or "$8,000-$30,000+" where suitable.
- Payback should be phrased as indicative, such as "often within one heating season", "typically 1-3 years", "varies widely", or "usually longer-term comfort and efficiency value".
- If the saving depends heavily on usage, tariffs, climate or behaviour, say so.

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

Write the report in this structure:

1. photo_summary:
One short paragraph.

2. bottom_line:
Exactly one strong sentence explaining the biggest likely opportunity.

3. executive_summary:
One practical paragraph, 3 to 5 sentences, summarising the whole home energy picture.

4. estimated_annual_energy_cost_profile:
One paragraph explaining what the inputs suggest about annual energy use and cost pressure.

5. unusual_usage_warning:
One short paragraph. Flag very high or unusual usage where relevant. If no warning is triggered, say so.

6. top_5_priorities:
Exactly 5 short priorities in order of importance. These should be clear customer actions or checks.

7. top_energy_drains:
Exactly 3 short items. These should identify likely causes, not actions.

8. top_recommended_actions:
Exactly 3 short items. These should be action headlines only.

9. quick_wins:
Exactly 3 short items. These should be genuinely low/no cost and should not duplicate the top recommended actions word-for-word.

10. bigger_upgrades:
Exactly 3 short items. These should be larger or more involved improvements.

11. extra_insights:
3 to 4 short items that add context without repeating the same points.

12. priority_action_plan:
4 to 5 detailed actions. Each action must include:
- action
- why_it_matters
- estimated_cost_range
- estimated_annual_saving_range
- effort_level
- likely_payback
- priority
- suggested_next_step

13. low_cost_quick_wins:
Exactly 3 detailed low-cost action objects with the same fields.

14. medium_cost_improvements:
2 to 3 detailed medium-cost action objects with the same fields.

15. higher_cost_upgrades:
2 to 3 detailed higher-cost action objects with the same fields.

16. electricity_specific_advice:
3 to 5 specific items.

17. gas_specific_advice:
2 to 4 specific items.

18. oil_specific_advice:
2 to 4 specific items.

19. appliance_findings:
3 to 5 specific items based on selected appliances, usage and photos where available.

20. behaviour_changes:
3 to 5 specific behaviour changes.

21. contractor_questions:
3 to 5 questions the homeowner could ask a contractor or assessor.

22. what_to_check_next:
3 to 5 specific checks the homeowner can do next.

23. important_assumptions:
3 to 5 assumptions or caveats used in the analysis.

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
          text: `Photo ${index + 1}: ${
            photo.name || "Uploaded appliance photo"
          }`,
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
          name: "save_your_ego_detailed_report",
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