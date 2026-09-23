import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

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
    question_to_ask: {
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
    "question_to_ask",
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
      minItems: 14,
      maxItems: 14,
    },

    low_cost_quick_wins: {
      type: "array",
      items: actionSchema,
      minItems: 6,
      maxItems: 6,
    },

    medium_cost_improvements: {
      type: "array",
      items: actionSchema,
      minItems: 4,
      maxItems: 4,
    },

    higher_cost_upgrades: {
      type: "array",
      items: actionSchema,
      minItems: 4,
      maxItems: 4,
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

    general_energy_saving_tips: {
      type: "array",
      items: { type: "string" },
      minItems: 5,
      maxItems: 8,
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
    "general_energy_saving_tips",
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
    console.error("AI assessment paid access check missing Supabase env vars.");
    return false;
  }

  const adminSupabase = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error } = await adminSupabase
    .from("paid_users")
    .select("paid_access")
    .eq("email", email.toLowerCase().trim())
    .eq("paid_access", true)
    .maybeSingle();

  if (error) {
    console.error("AI assessment paid access lookup error:", error);
    return false;
  }

  return Boolean(data?.paid_access);
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

    const hasPaidAccess = await checkPaidAccess(user.email);

    if (!hasPaidAccess) {
      return NextResponse.json(
        {
          error:
            "Paid access is required to generate a Save Your EGO assessment.",
        },
        { status: 403 }
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

    const frequencyMultiplier: Record<string, number> = {
      Monthly: 12,
      "Bi-monthly": 6,
      Quarterly: 4,
      Annual: 1,
    };

    const currency =
      answers.country === "US"
        ? "$"
        : answers.country === "UK"
          ? "£"
          : answers.country === "Ireland" || answers.country === "Other EU"
            ? "€"
            : "";

    const formatMoney = (value: number) =>
      `${currency}${Math.round(value).toLocaleString("en-US")}`;

    const electricitySpend =
      Number(answers.annual_bill_override ?? 0) > 0
        ? Number(answers.annual_bill_override)
        : Number(answers.avg_electricity_bill ?? 0) *
          (frequencyMultiplier[String(answers.bill_frequency)] ?? 12);

    const gasSpend = answers.uses_gas
      ? Number(answers.annual_gas_spend ?? 0) > 0
        ? Number(answers.annual_gas_spend)
        : Number(answers.avg_gas_bill ?? 0) *
          (frequencyMultiplier[String(answers.gas_bill_frequency)] ?? 12)
      : 0;

    const oilSpend = answers.uses_oil
      ? Number(answers.annual_oil_spend ?? 0) > 0
        ? Number(answers.annual_oil_spend)
        : Number(answers.oil_litres_per_year ?? 0) *
          Number(answers.oil_price_per_litre ?? 0)
      : 0;

    const spendParts = [
      electricitySpend > 0 ? `${formatMoney(electricitySpend)} electricity` : "",
      gasSpend > 0 ? `${formatMoney(gasSpend)} gas` : "",
      oilSpend > 0 ? `${formatMoney(oilSpend)} oil` : "",
    ].filter(Boolean);

    const totalKnownSpend = electricitySpend + gasSpend + oilSpend;
    const estimatedBillKwh = Number(scores.estimatedBillKwh ?? 0);
    const applianceKwh = Number(scores.applianceKwh ?? 0);

    let deterministicCostProfile =
      spendParts.length > 0
        ? `Based on the figures entered, the estimated annual energy spend is about ${formatMoney(totalKnownSpend)} across ${spendParts.join(", ")}. These figures are indicative and depend on the bill periods, rates and fuel quantities entered.`
        : "There is not enough bill or fuel-spend information to estimate an annual energy cost yet.";

    if (
      estimatedBillKwh > 0 &&
      applianceKwh > 0 &&
      applianceKwh < estimatedBillKwh * 0.45
    ) {
      deterministicCostProfile += ` The electricity bill implies roughly ${Math.round(estimatedBillKwh).toLocaleString("en-US")} kWh/year, while the selected appliances account for roughly ${Math.round(applianceKwh).toLocaleString("en-US")} kWh/year, so there are likely additional household loads or assumptions worth checking.`;
    }

    let deterministicUsageWarning =
      "No major usage warning is triggered by the entered figures, although the bill and appliance estimates are still indicative.";

    if (estimatedBillKwh > 20000) {
      deterministicUsageWarning =
        `The electricity estimate is very high at roughly ${Math.round(estimatedBillKwh).toLocaleString("en-US")} kWh/year. Check bill frequency, tariff inputs and major loads such as electric heating, hot water, EV charging, hot tubs, pools or other equipment before treating this as normal household use.`;
    } else if (estimatedBillKwh > 12000) {
      deterministicUsageWarning =
        `The electricity estimate is unusually high at roughly ${Math.round(estimatedBillKwh).toLocaleString("en-US")} kWh/year. It is worth checking the bill inputs and looking for major or unlisted electrical loads.`;
    } else if (applianceKwh > 8000) {
      deterministicUsageWarning =
        `The selected appliances add up to a high estimated load of roughly ${Math.round(applianceKwh).toLocaleString("en-US")} kWh/year. Review the largest appliances and their usage first.`;
    } else if (
      estimatedBillKwh > 0 &&
      applianceKwh > 0 &&
      applianceKwh < estimatedBillKwh * 0.45
    ) {
      deterministicUsageWarning =
        "The bill-based electricity estimate is much higher than the selected appliance total. Check for unlisted major loads and confirm the bill frequency, rate and annual-spend inputs.";
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
- If the country is US, use dollars and US homeowner terminology. Treat floor area as square feet when describing it to the customer, heating-oil quantities as gallons, and temperatures as Fahrenheit where temperature values are mentioned.
- The stored assessment may contain metric base values for internal calculation. Do not expose litres or square metres in US customer-facing prose when an equivalent US unit is appropriate.
- If the country is Ireland or EU, use euros.
- If the country is UK, use pounds.
- If currency is unclear, write the ranges in a currency-neutral way.
- Use ordinary homeowner language.
- Do not use the building-industry word "fabric" in customer-facing text. Say insulation, windows, doors, roof, floor, drafts, heat loss, or how well the home holds heat instead.
- Write for someone with no energy-industry knowledge. Prefer short, natural words over technical terms.
- If a technical term is unavoidable, explain it immediately in plain English.
- Never use internal developer notes, implementation language or wording that sounds like instructions between the app builders.
- Be specific to the answers and calculated scores.
- Do not repeat the same idea across multiple sections unless it genuinely belongs there.
- Do not make the report feel thin.
- Do not overstate certainty.
- Separate personalised findings from broadly useful general guidance.
- If inputs are incomplete, unknown, zero or sparse, do not leave the report empty or repetitive. Give useful general household energy-saving guidance in general_energy_saving_tips while clearly presenting it as general guidance, not as a diagnosis of this specific home.
- General tips should be practical and broadly applicable: thermostat scheduling, heating/cooling filters and maintenance, hot-water habits, laundry and dishwasher efficiency, standby loads, lighting, draft checks, utility tariff/plan reviews and seasonal energy habits where relevant.
- Do not claim that a general tip is a confirmed problem in this home unless the entered answers support it.
- Proofread all customer-facing text before returning JSON. Correct spelling, obvious typos, awkward fragments and accidental characters.

Usage warning rules:
- If estimated annual electricity use is above 12,000 kWh, unusual_usage_warning must clearly say this is unusually high and should be checked.
- If estimated annual electricity use is above 20,000 kWh, unusual_usage_warning must strongly flag this as very high and likely driven by EV charging, hot tub, electric heating, hot water, incorrect bill frequency, annual bill override, tariff assumptions or missing/incorrect inputs.
- If appliance estimate is above 8,000 kWh/year, unusual_usage_warning must flag this as a high appliance load and recommend checking major loads.
- If nothing appears unusual, unusual_usage_warning should say no major usage warning is triggered, while still noting that bill and appliance inputs are indicative.

Solar repetition rules:
- The app has a dedicated Solar PV suitability section outside this AI text for applicable property types.
- If property_type is "Apartment", do not recommend rooftop solar PV, do not suggest a solar system size, and do not include solar in top priorities, action plans, quick wins, bigger upgrades, extra insights, contractor questions or what_to_check_next. Rooftop solar for an apartment is normally a building-level ownership and roof-access matter, not an individual-home recommendation.
- If the rule-based solar rating is "Needs more information", do not invent a system size or present solar as a purchase recommendation. At most, say that roof orientation, shading and usable roof area need to be confirmed first if solar is otherwise relevant.
- Do not override the rule-based solar suitability with guesses based only on country or electricity use.
- Do not repeat solar heavily across every section.
- Solar may appear in top priorities or action plans only if it is genuinely one of the strongest opportunities.
- Do not put solar in more than one of these detailed sections unless clearly justified: priority_action_plan, medium_cost_improvements, higher_cost_upgrades.
- If solar appears as a higher-cost upgrade, do not also make it a medium-cost improvement.
- Battery advice should only appear if the inputs make it useful, and it should be cautious.

Prioritisation rules:
- Prioritise recommendations that match the actual inputs, not generic advice.
- The ordering must be consistent throughout the report.
- The report contains 14 detailed actions in total: 6 low-cost quick wins, 4 medium-cost improvements and 4 higher-cost upgrades.
- priority_action_plan must contain those same 14 detailed actions, with no extra actions and none missing, reordered from the strongest opportunity to the least important opportunity for this specific home.
- Rank by likely real-world value for this household: expected saving, relevance to the entered answers, urgency, confidence, ease, comfort benefit and sensible payback. Do not automatically put cheap actions first and do not automatically put expensive actions last.
- Avoid duplicate actions across the 14. Each action should solve a distinct issue or opportunity.
- top_5_priorities must use the same first five actions, in the same order, as priority_action_plan.
- top_recommended_actions should reflect the leading priority_action_plan items rather than introducing a competing order.
- If insulation and glazing are already good, do not push insulation or heat-loss upgrades unless clearly justified.
- If a heat pump is already present, do not treat heating replacement as a priority.
- Use appliance estimates and bill anchor to judge what is most likely driving use.
- If home or equipment photos reveal useful details, use them only as supporting evidence.
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
- Do not invent or recalculate the household's total annual energy spend in narrative sections. The application calculates that total from the entered bill and fuel figures.
- If discussing cost components elsewhere, never state arithmetic that conflicts with the supplied figures.
- Do not include made-up grant amounts.
- Do not recommend a specific contractor, brand or product.
- For low-cost actions, give ranges such as "$0-$100", "$20-$250" or "low/no cost" where suitable.
- For medium-cost actions, use ranges such as "$100-$1,000" where suitable.
- For larger upgrades, use broader ranges such as "$1,000-$8,000+" or "$8,000-$30,000+" where suitable.
- Payback should be phrased as indicative, such as "often within one heating season", "typically 1-3 years", "varies widely", or "usually longer-term comfort and efficiency value".
- If the saving depends heavily on usage, tariffs, climate or behaviour, say so.

Photo analysis rules:
- If no useful home or equipment photos are provided, set photo_summary to "No home or equipment photos analysed."
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
Exactly 14 detailed actions, ordered from best opportunity to least important opportunity for this specific home. This must be the same 14 actions used across low_cost_quick_wins, medium_cost_improvements and higher_cost_upgrades, simply reordered into one overall priority list. Do not add a fifteenth action and do not leave any of the 14 out. Each action must include:
- action
- why_it_matters
- estimated_cost_range
- estimated_annual_saving_range
- effort_level
- likely_payback
- priority
- suggested_next_step
- question_to_ask

For question_to_ask, include one useful plain-English question to ask a contractor, installer, supplier or assessor when professional help is relevant. If the action does not need professional help, return an empty string. Do not create a separate contractor-question section for these same actions.

13. low_cost_quick_wins:
Exactly 6 detailed low-cost action objects with the same fields. These should be practical, simple actions and checks. Avoid six versions of the same idea.

14. medium_cost_improvements:
Exactly 4 detailed medium-cost action objects with the same fields.

15. higher_cost_upgrades:
Exactly 4 detailed higher-cost action objects with the same fields.

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
3 to 5 questions only for important professional checks that do not fit naturally into one of the detailed actions. Avoid repeating questions already included with an action.

22. what_to_check_next:
3 to 5 specific checks the homeowner can do next.

23. important_assumptions:
3 to 5 assumptions or caveats used in the analysis.

24. general_energy_saving_tips:
5 to 8 concise, useful household energy-saving tips. These must still be useful when the homeowner has provided very little information. Keep them clearly general unless the assessment answers support personalising one.

Assessment answers:
${JSON.stringify(answers, null, 2)}

Calculated scores and analysis:
${JSON.stringify(scores, null, 2)}
`;

    const content: Array<
  | { type: "input_text"; text: string }
  | {
      type: "input_image";
      image_url: string;
      detail: "auto";
    }
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
      detail: "auto",
    });
  });
}
    const response = await client.responses.create({
      model: process.env.AI_MODEL || "gpt-5.4-mini",
      input: [
        {
          role: "user" as const,
          content,
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

    const report = JSON.parse(response.output_text) as Record<string, unknown>;

    const priorityPlan = Array.isArray(report.priority_action_plan)
      ? (report.priority_action_plan as Array<Record<string, unknown>>)
      : [];

    const priorityHeadlines = priorityPlan
      .slice(0, 5)
      .map((item) => String(item.action ?? "").trim())
      .filter(Boolean);

    if (priorityHeadlines.length > 0) {
      report.top_5_priorities = priorityHeadlines;
      report.top_recommended_actions = priorityHeadlines.slice(0, 3);
    }

    // Financial totals and high-usage warnings are calculated from the entered
    // figures so the customer never receives contradictory arithmetic.
    report.estimated_annual_energy_cost_profile = deterministicCostProfile;
    report.unusual_usage_warning = deterministicUsageWarning;

    return NextResponse.json({
      reportText: JSON.stringify(report),
      report,
    });
  } catch (error) {
    console.error("Generate assessment AI error:", error);

    return NextResponse.json(
      { error: "Failed to generate AI assessment." },
      { status: 500 }
    );
  }
}