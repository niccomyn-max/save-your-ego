import {
  ENERGY_TIP_CATEGORIES,
  ENERGY_TIP_COUNT,
} from "@/lib/energy-tips";

type SavingPotential = "Small" | "Moderate" | "High" | "Variable";

function friendlyText(text: string) {
  return text
    .replaceAll("HVAC", "heating and cooling")
    .replaceAll("tariffs", "energy plans")
    .replaceAll("tariff", "energy plan")
    .replaceAll("standing charge", "fixed daily charge")
    .replaceAll("unit rate", "price per unit")
    .replaceAll("conditioning", "heating or cooling")
    .replaceAll("Conditioning", "Heating or cooling")
    .replaceAll("conditioned air", "heated or cooled air")
    .replaceAll("conditioned space", "rooms you heat or cool")
    .replaceAll("runtime", "running time")
    .replaceAll("consumption", "energy use")
    .replaceAll("refrigeration", "fridges and freezers")
    .replaceAll("service penetrations", "gaps around pipes and cables")
    .replaceAll("recirculation", "hot-water circulation")
    .replaceAll("passive heat", "free warmth from the sun")
    .replaceAll("solar heat gain", "heat from the sun")
    .replaceAll("integrated fixtures", "built-in light fittings")
    .replaceAll("resistance heaters", "electric heaters");
}

function friendlyCategory(category: string) {
  if (category === "Bills, Tariffs & Metering") return "Bills, Plans & Meter Checks";
  if (category === "Kitchen & Refrigeration") return "Kitchen, Fridge & Freezer";
  if (category === "Electronics & Standby") return "TVs, Computers & Standby";
  return category;
}

function friendlyEffort(effort: string) {
  if (effort === "No cost") return "Free fix";
  if (effort === "Check first") return "Check before you spend";
  if (effort === "When replacing") return "Only when replacing";
  return effort;
}

function friendlySavingPotential(potential: SavingPotential) {
  if (potential === "Moderate") return "Medium";
  if (potential === "High") return "Bigger";
  if (potential === "Variable") return "Depends on your home";
  return potential;
}

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

const SAVING_INSIGHTS: Record<string, string[]> = {
  "Heating & Cooling": [
    "The gain comes from avoiding hours of heating or cooling when nobody needs it. Homes with long empty periods can benefit most.",
    "Every degree of unnecessary heating or cooling has to be maintained for as long as the system runs. Setbacks matter most during workdays, nights or regular absences.",
    "The opportunity is in reducing the amount of conditioned space. This is most useful where spare rooms, guest rooms or rarely used areas are kept at full comfort settings.",
    "Better airflow can help the system reach the thermostat setting without fighting blocked vents. The saving is usually indirect, through shorter or more effective runtime.",
    "A badly clogged filter can make airflow poor and force equipment to work longer. The biggest improvement appears when the existing filter is overdue for attention.",
    "Fans may let you feel comfortable at a less aggressive thermostat setting. The energy benefit comes from using air movement instead of extra cooling.",
    "A fan left running in an empty room uses electricity without improving anyone's comfort. This is a small saving each time, but an easy one to capture.",
    "Servicing can uncover dirty components, poor controls or airflow problems that quietly increase runtime. Savings vary, but maintenance can prevent inefficient operation from becoming normal.",
    "A thermostat that is being heated by sun or cooled by a draft may call for the wrong amount of heating or cooling. Correct placement can improve control rather than simply lowering a setting.",
    "The financial benefit appears over years of operation. When replacement is already necessary, choosing a more efficient system can avoid locking in higher running costs for the next decade or more.",
  ],
  "Hot Water": [
    "Every minute removed from a hot shower cuts both water use and the energy needed to heat it. The effect is much larger in busy households with several showers each day.",
    "A dripping hot tap wastes already-heated water around the clock. Fixing it stops a continuous loss rather than relying on a change in daily habits.",
    "A good low-flow showerhead reduces the amount of hot water used each minute. The saving is strongest where showers are frequent or long.",
    "Stored water loses heat while it waits to be used. If the temperature is higher than necessary, those standing losses increase all day and night.",
    "Hot water cools as it travels through pipes. Insulating accessible runs keeps more of that heat in the water, especially where pipe runs are long or pass through cold areas.",
    "Recirculation makes hot water arrive quickly, but continuous pumping can also keep reheating pipework. A sensible schedule can cut that background loss.",
    "The saving comes from not reheating water for hours when the household does not need it. This can matter most in homes with predictable routines.",
    "Using cold water for small tasks avoids firing the water heater for jobs that do not need hot water at all.",
    "A leak is a double loss: water leaves the system and replacement water has to be heated again. The longer it runs unnoticed, the greater the waste.",
    "When a water heater genuinely needs replacing, efficiency differences can affect a major household load for many years. The value depends heavily on fuel type and hot-water demand.",
  ],
  "Kitchen & Refrigeration": [
    "Dust can restrict heat release on some refrigerators, making the compressor run longer. Cleaning is most worthwhile where coils or grilles are visibly dusty and accessible under the manufacturer's guidance.",
    "A seal that does not close cleanly lets warm air creep in and forces the fridge or freezer to remove that heat again. The saving is greatest where seals are dirty, loose or damaged.",
    "A door that is slightly ajar can keep the compressor cycling far more than normal. Correcting the closure removes that repeated cooling load immediately.",
    "Colder settings mean the compressor must maintain a bigger temperature difference. The benefit comes from avoiding unnecessary over-cooling while still keeping food safely stored.",
    "Very hot food adds a burst of heat that the fridge has to remove. The saving is modest, but the habit costs nothing and is easy to repeat.",
    "For small meals, heating a small cooking chamber can avoid warming a full-size oven. The difference is most noticeable when the oven would otherwise run for a short, single-item cook.",
    "Once an oven is hot, cooking several items makes better use of that same preheating and retained heat. The value grows in households that cook with the oven often.",
    "Lids reduce heat escaping from pots and the right burner size puts more heat into the pan instead of around it. That can shorten cooking time every time the hob is used.",
    "A kettle uses energy in direct proportion to the water it heats. Boiling one mug instead of a full kettle removes waste at the source.",
    "Fridges and freezers run 24 hours a day, so a lower annual kWh figure keeps paying back every day of the appliance's life. This matters most when replacing an old or very inefficient unit.",
  ],
  "Laundry & Dishwashing": [
    "The machine uses energy for every cycle whether it is half full or sensibly full. Fewer cycles for the same amount of laundry is where the saving appears.",
    "Much of a warm wash's energy goes into heating water. Cooler cycles reduce that part of the load while still working well for many everyday fabrics.",
    "A higher spin leaves less water in the clothes, so the dryer has less moisture to remove. The benefit is largest for households that tumble-dry frequently.",
    "Skipping the dryer removes the drying electricity almost entirely for that load. Even doing this for some loads can noticeably cut laundry energy.",
    "Lint restricts airflow and can lengthen drying time. Keeping the filter clear helps each cycle finish with less unnecessary runtime.",
    "If clothes need repeated drying cycles, poor venting can be wasting both time and energy. Fixing the cause can save much more than simply choosing a different dryer setting.",
    "A dishwasher uses water heating and pumping each time it runs. Fewer, fuller loads spread that energy across more dishes.",
    "Eco cycles normally use lower temperatures and more time to do the same job. The saving comes from trading extra minutes for less heated water and electricity.",
    "Heated drying adds another energy stage after the dishes are already clean. Air-dry can remove that final load completely where the machine allows it.",
    "Laundry appliances may run hundreds of cycles over their life. When replacement is due, lower energy and water use can accumulate into meaningful lifetime savings.",
  ],
  "Lighting": [
    "The biggest difference appears when an old incandescent or halogen bulb is replaced by an LED in a fitting used for many hours. The lower wattage saves energy every time the light is on.",
    "The saving is direct: an empty room needs no light. It is small per occasion but can add up in homes where lights are routinely left on.",
    "Using daylight replaces electric lighting with something free. The value depends on how many daytime hours you would otherwise have the lights on.",
    "A focused lamp can use far less power than lighting every fitting in a room. This works best for reading, desk work or other tasks needing light in one place.",
    "Cleaning does not reduce wattage, but it can improve light output enough that you avoid switching on extra lamps or choosing unnecessarily bright replacements.",
    "Sensors remove the human error of forgetting the switch. They are most useful in spaces people enter briefly, such as garages, halls, utility rooms and storage areas.",
    "Outdoor lights can quietly run for hours after everyone has gone inside. A timer clips those unnecessary hours automatically.",
    "Decorative lighting often runs on habit rather than need. Shortening the schedule captures savings without changing how the lights are enjoyed.",
    "If a multi-bulb fitting is brighter than the room needs, using fewer lamps reduces the load immediately. Only do this where the fitting remains safe and suitable.",
    "When a fitting needs replacement anyway, efficient integrated lighting can lower energy use for years while also reducing how often lamps need changing.",
  ],
  "Electronics & Standby": [
    "The saving comes from removing long idle periods. A TV or games console that is fully off for the 20-plus hours a day it is not used no longer draws background power during that time.",
    "Sleep mode cuts power automatically during breaks, so you do not have to remember. It matters most on computers that sit idle for long stretches of the working day.",
    "A high-powered desktop left on overnight can clock up thousands of unnecessary hours each year. Shutting it down removes those hours entirely.",
    "Monitors are easy to forget because they look inactive when the computer is idle. Switching unused displays off removes a small but continuous load.",
    "Modern chargers often use very little when idle, so the saving is usually small. It is still a simple way to eliminate needless background draw from older or less efficient adapters.",
    "A switchable strip makes several standby loads disappear with one action. The value comes from making the energy-saving behaviour easy enough to do every day.",
    "Smart speakers, hubs, cameras and network devices are designed to stay on. Reviewing which ones are genuinely needed can uncover a permanent 24/7 load.",
    "Display power generally rises with brightness. A comfortable lower setting saves a little energy every hour the screen is in use.",
    "Printers and office devices may spend far more time waiting than working. Turning them off outside working hours removes that long idle period.",
    "Large TVs, gaming PCs and networking hardware can vary widely in power demand. Comparing energy use at replacement time helps avoid buying a high-load device that will run for years.",
  ],
  "Windows, Doors & Insulation": [
    "Drafts represent heated or cooled air leaving the home and outdoor air coming in. Finding the worst gaps shows you where low-cost sealing may have the quickest effect.",
    "Weatherstripping tackles a specific leak path around exterior doors. The payoff is strongest where you can already feel air movement or see worn seals.",
    "Pipe and cable penetrations can create many small leakage points. Sealing accessible gaps reduces the constant exchange of conditioned air with outdoors.",
    "Curtains and blinds create an extra still-air layer near cold glass. They do not replace insulation, but they can reduce discomfort and slow heat loss during the coldest hours.",
    "Winter sun is free heat. Opening coverings when sunlight is useful can offset a little heating demand without changing the thermostat.",
    "Stopping strong sun before or as it enters the room reduces the heat the cooling system later has to remove. The effect is largest on exposed sunny windows.",
    "Attic hatches often interrupt an otherwise insulated ceiling. Sealing an obvious gap can stop a concentrated source of warm-air leakage.",
    "Checking first prevents spending money where insulation is already adequate. The saving comes from targeting the genuinely weak area instead of adding material blindly.",
    "A small repair can sometimes solve the draft or comfort problem that made full window replacement seem necessary. That can save both energy and a large capital expense.",
    "If walls, roofs or floors are already being opened for renovation, adding insulation at the same time can be far cheaper than returning later. The energy saving then continues for the life of the building.",
  ],
  "Bills, Tariffs & Metering": [
    "This is one of the few actions that can cut the bill without changing how much energy you use. The saving comes from paying less for every unit you were already going to consume.",
    "If another supplier offers a better unit rate or standing charge, the difference applies across the whole bill. High-use homes have the most to gain from a small rate improvement.",
    "Heating-fuel prices can move significantly between suppliers and contract periods. A periodic comparison can reduce cost without touching comfort or equipment.",
    "A time-of-use plan only helps if your routine matches the cheap periods. Checking the fit can reveal whether the tariff is saving money or quietly making expensive hours cost more.",
    "The energy use stays the same, but the price per unit changes. Moving EV charging, laundry or dishwashing to cheaper periods can therefore reduce cost without reducing the service you get.",
    "Meter readings do not save energy by themselves, but they expose changes early. Spotting a jump quickly can prevent months of unnoticed waste.",
    "Comparing winter with winter or summer with summer removes much of the weather distortion. That makes genuine efficiency improvements or new loads easier to see.",
    "An estimated bill can be wrong in either direction. Replacing estimates with real readings helps ensure you are making decisions from actual consumption rather than billing assumptions.",
    "A sudden increase is a clue. Finding the cause early can stop an appliance fault, new load or tariff mistake from inflating bills for the rest of the year.",
    "A simple record connects bill changes to real events such as adding an EV, hot tub or heater. That makes future saving decisions much more targeted.",
  ],
  "Outdoor, Pool, Spa & Garage": [
    "A spa loses heat continuously through the water surface. A good cover slows that loss every hour the tub is not being used, which can make this one of the stronger spa-saving actions.",
    "Hotter water loses heat faster to the surroundings. Even a modest temperature reduction can lower the amount of reheating needed between uses.",
    "The goal is to avoid pumps and heaters running simply because the default schedule says so. Tighter controls can reduce many unnecessary operating hours.",
    "Pool pumps are motors that can run for long periods every day. Trimming excessive runtime can therefore remove a sizeable block of electricity use.",
    "A pool cover reduces heat and evaporation from a very large water surface. Where pools are heated, that can cut the amount of energy needed to restore lost heat.",
    "Outdoor lights are often forgotten because nobody notices them once indoors. Motion or timer control removes those wasted overnight hours automatically.",
    "An extra fridge or freezer can consume electricity 365 days a year. If it is mostly empty or rarely needed, switching it off removes the entire annual load.",
    "Garage refrigeration often works in hotter, dustier conditions than the kitchen unit. Keeping airflow paths clean can reduce unnecessary compressor runtime.",
    "Portable resistance heaters turn electricity directly into heat and can be expensive when run for many hours. Reducing routine use can have a noticeable effect on winter electricity bills.",
    "Pumps and motors may run for hundreds or thousands of hours. When replacement is already due, a more efficient model can lower that recurring motor load for years.",
  ],
  "Everyday & Seasonal Habits": [
    "If a jumper, lighter clothing or a fan keeps you comfortable, you may avoid moving the thermostat as far. The saving comes from needing less heating or cooling for the same comfort.",
    "An open exterior door can dump conditioned air surprisingly quickly during extreme weather. Closing it promptly reduces the recovery work the system has to do afterward.",
    "Different rooms naturally behave differently through the seasons. Using the comfortable rooms more often can reduce how hard you need to heat or cool the rest of the home.",
    "Preheating is already paid for once. Filling the oven sensibly while it is hot gets more useful cooking from the same warm-up cycle.",
    "A home that is empty for days does not need every appliance running as if someone were there. Turning off suitable devices removes their background use for the whole trip.",
    "Away modes bundle several small savings into one setting. They are especially useful when heating, cooling or hot water would otherwise stay on a normal schedule during a long absence.",
    "A twice-yearly check catches small problems before they become year-round habits: dirty filters, bad timers, drafts and forgotten equipment can all be found in one pass.",
    "A 2,000-watt heater matters more than a tiny standby light. Focusing effort on the biggest loads first makes each minute spent on energy saving more productive.",
    "A plug-in meter turns suspicion into evidence. Finding one unexpectedly hungry appliance can be more valuable than changing ten things that were already efficient.",
    "The financial saving may come from avoiding the wrong purchase as much as from lower energy use. Comparing repair cost, running cost and replacement cost helps you spend where it will actually make a difference.",
  ],
};

function savingInsightForTip(
  category: string,
  index: number,
  potential: SavingPotential
) {
  return (
    SAVING_INSIGHTS[category]?.[index] ??
    (potential === "High"
      ? "This can be a meaningful saving when the item is a major or frequently used load."
      : potential === "Variable"
        ? "The value depends on the existing equipment, usage pattern and local energy costs."
        : "This is usually a smaller recurring saving, but it can still be worthwhile when the change is easy to maintain.")
  );
}


export function EnergyTipsLibrary() {
  return (
    <section className="mt-6 print:hidden">
      <details className="group rounded-[2rem] border border-[#dbe8f2] bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 sm:px-8">
          <div>
            <h2 className="text-2xl font-black text-black">
              {ENERGY_TIP_COUNT} Simple Ways to Save Energy Around Your Home
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Small changes add up. Start with free fixes first. Pick the ideas that fit your home.
            </p>
          </div>

          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#17356f] text-xl font-black text-white transition group-open:rotate-180">
            ↓
          </span>
        </summary>

        <div className="border-t border-[#dbe8f2] p-4 sm:p-6">
          <div className="grid gap-3 lg:grid-cols-2">
            {ENERGY_TIP_CATEGORIES.map((category) => (
              <details
                key={friendlyCategory(category.category)}
                className="group/category rounded-2xl border border-[#dbe8f2] bg-[#f7fbff]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <h3 className="font-black text-[#17356f]">
                      {friendlyCategory(category.category)}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {category.tips.length} ideas
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
                        key={`${friendlyCategory(category.category)}-${index}-${friendlyText(tip.title)}`}
                        className="rounded-2xl border border-[#dbe8f2] bg-white p-4"
                      >
                        <h4 className="font-black leading-6 text-black">
                          {friendlyText(tip.title)}
                        </h4>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#fff6bf] px-3 py-1 text-[11px] font-black text-[#6b5200]">
                            What it takes: {friendlyEffort(tip.effort)}
                          </span>
                          <span className="rounded-full bg-[#e9f6fe] px-3 py-1 text-[11px] font-black text-[#17356f]">
                            Could save: {friendlySavingPotential(savingPotential)}
                          </span>
                        </div>

                        <div className="mt-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                            Why
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            {friendlyText(tip.why)}
                          </p>
                        </div>

                        <div className="mt-3 rounded-xl bg-[#f7fbff] p-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#17356f]/60">
                            How this may help your bill
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {friendlyText(
                              savingInsightForTip(
                                category.category,
                                index,
                                savingPotential
                              )
                            )}
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
