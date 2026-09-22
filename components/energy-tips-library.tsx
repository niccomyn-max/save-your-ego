import {
  ENERGY_TIP_CATEGORIES,
  ENERGY_TIP_COUNT,
} from "@/lib/energy-tips";

type SavingPotential = "Small" | "Moderate" | "High" | "Variable";

function savingPotentialForTip(
  category: string,
  title: string,
  effort: string
): SavingPotential {
  const text = title.toLowerCase();

  const highSignals = [
    "heating or cooling schedule",
    "set back the thermostat",
    "shorter showers",
    "efficient showerheads",
    "water heater",
    "air-dry clothes",
    "replace failed bulbs with efficient leds",
    "electricity plan",
    "competing electricity suppliers",
    "time-of-use",
    "expensive peak periods",
    "hot-tub or spa cover",
    "spa hotter",
    "pool-pump",
    "pool cover",
    "garage refrigerators",
    "portable heaters",
    "insulation upgrades",
  ];

  const smallSignals = [
    "unplug rarely used chargers",
    "switch off unused monitors",
    "screen brightness",
    "clean dusty light fittings",
    "use daylight",
    "read your meter",
    "keep a simple record",
    "close exterior doors promptly",
  ];

  if (highSignals.some((signal) => text.includes(signal))) return "High";
  if (smallSignals.some((signal) => text.includes(signal))) return "Small";

  if (
    effort === "When replacing" ||
    text.includes("serviced") ||
    text.includes("placement") ||
    text.includes("check visible insulation") ||
    text.includes("look for sudden") ||
    text.includes("compare repair")
  ) {
    return "Variable";
  }

  if (
    category === "Bills, Tariffs & Metering" ||
    category === "Heating & Cooling" ||
    category === "Hot Water" ||
    category === "Outdoor, Pool, Spa & Garage"
  ) {
    return "Moderate";
  }

  return "Moderate";
}

function savingPossibility(
  category: string,
  potential: SavingPotential
) {
  const categoryContext: Record<string, string> = {
    "Heating & Cooling":
      "Heating and cooling can run for many hours, so savings grow quickly when a change reduces unnecessary runtime.",
    "Hot Water":
      "The opportunity becomes larger in homes with more people, longer showers or frequent hot-water use.",
    "Kitchen & Refrigeration":
      "Refrigeration runs every day, so even modest efficiency improvements repeat all year.",
    "Laundry & Dishwashing":
      "The benefit is greater in households running many wash, dry or dishwasher cycles each week.",
    Lighting:
      "Lighting savings are greatest where older bulbs run for long hours or many rooms are lit at once.",
    "Electronics & Standby":
      "Individual devices are often small loads, but several always-on devices can add up over a full year.",
    "Windows, Doors & Insulation":
      "The benefit rises in very hot, very cold or drafty homes where heating and cooling demand is already high.",
    "Bills, Tariffs & Metering":
      "This can reduce the bill without reducing comfort; the value depends on local tariffs, suppliers and how much energy you use.",
    "Outdoor, Pool, Spa & Garage":
      "Pools, spas, pumps and secondary refrigeration can be large background loads, so operating changes can matter.",
    "Everyday & Seasonal Habits":
      "These changes are usually free, and their value comes from repeating them consistently through the year.",
  };

  const potentialContext: Record<SavingPotential, string> = {
    Small:
      "Usually a smaller individual saving, but worthwhile when the action is free and easy to repeat.",
    Moderate:
      "Can produce a noticeable recurring saving when the appliance, system or habit is used regularly.",
    High:
      "Can have a meaningful effect on bills when this is a major load or a frequent source of waste.",
    Variable:
      "The saving can range from small to significant depending on the existing equipment, usage pattern, climate or tariff.",
  };

  return `${potentialContext[potential]} ${categoryContext[category] ?? ""}`;
}

export function EnergyTipsLibrary() {
  return (
    <section className="mt-6 print:hidden">
      <details className="group rounded-[2rem] border border-[#dbe8f2] bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#17356f]">
              Extra home energy library
            </p>
            <h2 className="mt-1 text-2xl font-black text-black">
              {ENERGY_TIP_COUNT} Ways to Save Energy Around Your Home
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              This fixed library is separate from your personalised findings.
              Each idea shows why it helps, how much saving potential it may have,
              and how much effort it usually takes.
            </p>
          </div>

          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#17356f] text-xl font-black text-white transition group-open:rotate-180">
            ↓
          </span>
        </summary>

        <div className="border-t border-[#dbe8f2] p-4 sm:p-6">
          <div className="mb-5 rounded-2xl border border-[#ffe76a] bg-[#fff6bf] p-4 text-sm leading-6 text-slate-700">
            <strong className="text-black">About the saving potential:</strong>{" "}
            Small, Moderate and High are relative guides, not guaranteed percentages.
            Actual savings depend on your home, usage, climate, equipment and energy prices.
            Variable means the idea can be very worthwhile, but it should be checked against
            your own situation before spending money.
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {ENERGY_TIP_CATEGORIES.map((category) => (
              <details
                key={category.category}
                className="group/category rounded-2xl border border-[#dbe8f2] bg-[#f7fbff]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <h3 className="font-black text-[#17356f]">
                      {category.category}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {category.tips.length} practical ideas
                    </p>
                  </div>
                  <span className="text-lg font-black text-[#17356f] transition group-open/category:rotate-180">
                    ↓
                  </span>
                </summary>

                <div className="space-y-3 border-t border-[#dbe8f2] p-4">
                  {category.tips.map((tip, index) => {
                    const savingPotential = savingPotentialForTip(
                      category.category,
                      tip.title,
                      tip.effort
                    );

                    return (
                      <article
                        key={`${category.category}-${index}-${tip.title}`}
                        className="rounded-2xl border border-[#dbe8f2] bg-white p-4"
                      >
                        <h4 className="font-black leading-6 text-black">
                          {tip.title}
                        </h4>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#fff6bf] px-3 py-1 text-[11px] font-black text-[#6b5200]">
                            Effort: {tip.effort}
                          </span>
                          <span className="rounded-full bg-[#e9f6fe] px-3 py-1 text-[11px] font-black text-[#17356f]">
                            Saving potential: {savingPotential}
                          </span>
                        </div>

                        <div className="mt-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Why it helps
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            {tip.why}
                          </p>
                        </div>

                        <div className="mt-3 rounded-xl bg-[#f7fbff] p-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#17356f]/60">
                            Saving possibility
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {savingPossibility(category.category, savingPotential)}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
