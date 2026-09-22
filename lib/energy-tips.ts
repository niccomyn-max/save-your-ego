export type EnergyTip = {
  title: string;
  why: string;
  effort: "No cost" | "Low cost" | "Check first" | "When replacing";
};

export type EnergyTipCategory = {
  category: string;
  tips: EnergyTip[];
};

export const ENERGY_TIP_CATEGORIES: EnergyTipCategory[] = [
  {
    category: "Heating & Cooling",
    tips: [
      { title: "Use a heating or cooling schedule", why: "Match comfort settings to when people are actually home instead of conditioning empty rooms.", effort: "No cost" },
      { title: "Set back the thermostat when the home is empty", why: "A modest setback can reduce unnecessary heating or cooling hours.", effort: "No cost" },
      { title: "Avoid heating or cooling unused rooms more than necessary", why: "Conditioning spaces nobody is using can add avoidable runtime.", effort: "No cost" },
      { title: "Keep supply and return vents clear", why: "Furniture, rugs and curtains can restrict airflow and make the system work harder.", effort: "No cost" },
      { title: "Check or replace HVAC filters regularly", why: "A clogged filter can reduce airflow and increase system effort.", effort: "Low cost" },
      { title: "Use ceiling fans to improve comfort", why: "Air movement can make a room feel more comfortable without changing the thermostat as much.", effort: "No cost" },
      { title: "Turn ceiling fans off when the room is empty", why: "Fans cool people rather than empty rooms, so running them unnecessarily wastes electricity.", effort: "No cost" },
      { title: "Have heating and cooling equipment serviced as recommended", why: "Good maintenance can help equipment operate as intended and reveal control or airflow problems.", effort: "Check first" },
      { title: "Check thermostat placement", why: "Direct sun, drafts or nearby heat sources can make a thermostat misread the room.", effort: "Check first" },
      { title: "Compare efficiency when replacement is genuinely due", why: "When equipment reaches the end of its useful life, running-cost differences become worth comparing.", effort: "When replacing" },
    ],
  },
  {
    category: "Hot Water",
    tips: [
      { title: "Take slightly shorter showers", why: "Heating water is energy-intensive, so even small reductions in shower time can add up.", effort: "No cost" },
      { title: "Fix dripping hot-water taps", why: "A hot-water drip wastes both water and the energy used to heat it.", effort: "Low cost" },
      { title: "Use efficient showerheads where suitable", why: "Lower flow can reduce hot-water use while maintaining a comfortable shower.", effort: "Low cost" },
      { title: "Do not overheat stored hot water", why: "Keeping water hotter than necessary can increase standing heat losses.", effort: "Check first" },
      { title: "Insulate accessible hot-water pipes where appropriate", why: "Pipe insulation can reduce heat lost between the water heater and the tap.", effort: "Low cost" },
      { title: "Check whether hot-water recirculation runs longer than needed", why: "Continuous circulation can lose heat through pipework.", effort: "Check first" },
      { title: "Use timers or schedules for hot-water systems when appropriate", why: "Heating water when nobody needs it can create avoidable losses.", effort: "Check first" },
      { title: "Wash hands and lightly soiled items with cold water when suitable", why: "Not every task needs hot water.", effort: "No cost" },
      { title: "Repair hot-water leaks promptly", why: "A small leak can waste significant heated water over time.", effort: "Check first" },
      { title: "Choose an efficient water heater when replacement is due", why: "Water heating can be a major household load, so replacement efficiency matters.", effort: "When replacing" },
    ],
  },
  {
    category: "Kitchen & Refrigeration",
    tips: [
      { title: "Clean accessible refrigerator condenser coils or grilles", why: "Dust buildup can make some refrigerators work harder. Follow the manufacturer's cleaning guidance.", effort: "No cost" },
      { title: "Keep fridge and freezer door seals clean", why: "Dirty or damaged seals can let cold air escape.", effort: "No cost" },
      { title: "Check that fridge and freezer doors close fully", why: "Even a small gap can increase compressor runtime.", effort: "No cost" },
      { title: "Avoid setting the fridge colder than necessary", why: "Excessively cold settings can increase electricity use without improving food storage.", effort: "No cost" },
      { title: "Let hot food cool safely before refrigerating", why: "Putting very hot food straight into the fridge can temporarily increase cooling demand.", effort: "No cost" },
      { title: "Use the microwave or air fryer for small portions when practical", why: "Smaller cooking appliances can use less energy than heating a full-size oven for a small meal.", effort: "No cost" },
      { title: "Batch-cook when using the oven", why: "Cooking several items in one oven session makes better use of the heat.", effort: "No cost" },
      { title: "Use lids on pots and match pan size to the burner", why: "Keeping heat in the pan can reduce cooking time and wasted heat.", effort: "No cost" },
      { title: "Boil only the water you need in a kettle", why: "Heating excess water uses extra electricity.", effort: "No cost" },
      { title: "Compare annual energy use when replacing refrigeration", why: "Fridges and freezers run all year, so annual consumption matters more than a small purchase-price difference.", effort: "When replacing" },
    ],
  },
  {
    category: "Laundry & Dishwashing",
    tips: [
      { title: "Run washing machines with fuller loads", why: "A fuller sensible load gets more laundry cleaned per cycle.", effort: "No cost" },
      { title: "Use cooler wash temperatures when suitable", why: "Heating wash water can be a large part of the cycle's energy use.", effort: "No cost" },
      { title: "Use high-spin settings before tumble drying when fabrics allow", why: "Removing more water in the washer can shorten dryer time.", effort: "No cost" },
      { title: "Air-dry clothes when practical", why: "Avoiding the tumble dryer removes one of the larger household appliance loads.", effort: "No cost" },
      { title: "Clean the dryer lint filter after use", why: "Good airflow helps the dryer work as intended.", effort: "No cost" },
      { title: "Check the dryer vent if clothes need repeated cycles", why: "Restricted airflow can lengthen drying time and should be investigated.", effort: "Check first" },
      { title: "Run the dishwasher when reasonably full", why: "Fewer, fuller cycles usually use less energy than many partial loads.", effort: "No cost" },
      { title: "Use eco dishwasher cycles for normal loads", why: "Eco modes are designed to trade extra time for lower energy and water use.", effort: "No cost" },
      { title: "Use air-dry or no-heat drying where available", why: "Skipping heated drying can reduce dishwasher energy use.", effort: "No cost" },
      { title: "Compare efficient models when replacing laundry appliances", why: "Frequent-use appliances can create meaningful lifetime running costs.", effort: "When replacing" },
    ],
  },
  {
    category: "Lighting",
    tips: [
      { title: "Replace failed bulbs with efficient LEDs", why: "LEDs use much less electricity than older incandescent or halogen lighting.", effort: "When replacing" },
      { title: "Turn lights off in empty rooms", why: "Lighting an unused room provides no benefit.", effort: "No cost" },
      { title: "Use daylight before switching lights on", why: "Natural light is free when it is available.", effort: "No cost" },
      { title: "Use task lighting instead of lighting an entire room", why: "A small lamp may be enough for reading, cooking or desk work.", effort: "No cost" },
      { title: "Clean dusty light fittings and shades", why: "Cleaner fittings can improve useful light output without adding more lamps.", effort: "No cost" },
      { title: "Use motion sensors for rarely occupied spaces", why: "Sensors can stop lights being left on in garages, halls or storage areas.", effort: "Low cost" },
      { title: "Use timers for outdoor lighting", why: "Timers reduce unnecessary overnight runtime.", effort: "Low cost" },
      { title: "Check decorative lighting schedules", why: "Seasonal and decorative lights can run for many hours if left on automatically.", effort: "No cost" },
      { title: "Use fewer bulbs where a fitting is over-lit", why: "Some multi-bulb fixtures provide more light than the room needs.", effort: "No cost" },
      { title: "Choose efficient integrated fixtures when replacing them", why: "Long-life efficient fixtures can reduce both energy use and maintenance.", effort: "When replacing" },
    ],
  },
  {
    category: "Electronics & Standby",
    tips: [
      { title: "Turn TVs and game consoles fully off when not needed", why: "Long idle periods can add avoidable background electricity use.", effort: "No cost" },
      { title: "Use sleep settings on computers", why: "Automatic sleep reduces power use during breaks.", effort: "No cost" },
      { title: "Shut down desktop PCs overnight when practical", why: "A powerful computer left running can add substantial unnecessary hours.", effort: "No cost" },
      { title: "Switch off unused monitors", why: "Extra displays can draw power even when no one is using them.", effort: "No cost" },
      { title: "Unplug rarely used chargers and power supplies", why: "Some power adapters draw a small amount continuously.", effort: "No cost" },
      { title: "Use switchable power strips for entertainment equipment", why: "One switch can make it easier to shut down several standby loads together.", effort: "Low cost" },
      { title: "Review always-on smart-home devices", why: "Many small devices together can create a noticeable continuous load.", effort: "Check first" },
      { title: "Reduce unnecessary screen brightness", why: "Displays generally use less power at lower brightness settings.", effort: "No cost" },
      { title: "Turn off printers and office equipment outside working hours", why: "Office devices can spend most of their life idle.", effort: "No cost" },
      { title: "Check annual energy use when replacing large electronics", why: "Large TVs, gaming PCs and network equipment can vary significantly in power demand.", effort: "When replacing" },
    ],
  },
  {
    category: "Windows, Doors & Insulation",
    tips: [
      { title: "Check for obvious drafts around windows and doors", why: "Air leakage can make rooms less comfortable and increase heating or cooling demand.", effort: "No cost" },
      { title: "Replace worn door weatherstripping", why: "Simple seals can reduce obvious gaps around exterior doors.", effort: "Low cost" },
      { title: "Seal accessible gaps around service penetrations", why: "Small openings around pipes or cables can allow unwanted air leakage.", effort: "Low cost" },
      { title: "Close curtains or blinds on cold nights", why: "Window coverings can reduce the feeling of cold surfaces and drafts.", effort: "No cost" },
      { title: "Use sunny windows for free winter warmth", why: "Opening coverings on sunny winter days can add passive heat.", effort: "No cost" },
      { title: "Shade strong summer sun before it heats the room", why: "Exterior or interior shading can reduce unwanted solar heat gain.", effort: "No cost" },
      { title: "Check attic or loft access for obvious gaps", why: "Poorly sealed access hatches can be a source of air leakage.", effort: "Check first" },
      { title: "Check visible insulation before adding more", why: "Knowing what is already there helps avoid unnecessary or unsuitable work.", effort: "Check first" },
      { title: "Start with targeted sealing before full window replacement", why: "Simple repairs may solve comfort problems at a fraction of replacement cost.", effort: "Check first" },
      { title: "Consider insulation upgrades when major renovation is already planned", why: "Combining efficiency work with planned construction can reduce disruption and duplicated labor.", effort: "When replacing" },
    ],
  },
  {
    category: "Bills, Tariffs & Metering",
    tips: [
      { title: "Check which electricity plan you are actually on", why: "Households can stay on old plans long after better options become available.", effort: "No cost" },
      { title: "Compare competing electricity suppliers where your market allows", why: "A lower unit rate or standing charge can reduce bills without changing consumption.", effort: "No cost" },
      { title: "Review gas or fuel suppliers periodically", why: "Fuel pricing can vary between providers and contract periods.", effort: "No cost" },
      { title: "Check whether time-of-use pricing suits your routine", why: "Shifting flexible loads can matter when off-peak prices are lower.", effort: "Check first" },
      { title: "Move flexible loads away from expensive peak periods", why: "Dishwashing, laundry or EV charging may cost less at off-peak times on suitable tariffs.", effort: "No cost" },
      { title: "Read your meter regularly", why: "Regular readings make unusual changes easier to spot.", effort: "No cost" },
      { title: "Compare current use with the same season last year", why: "Seasonal comparisons are often more meaningful than comparing summer with winter.", effort: "No cost" },
      { title: "Check estimated bills against actual meter readings", why: "Estimated bills can hide incorrect assumptions about consumption.", effort: "No cost" },
      { title: "Look for sudden unexplained increases", why: "A sharp change can point to a new load, fault, tariff change or billing issue.", effort: "Check first" },
      { title: "Keep a simple record of major energy changes", why: "Noting a new EV, hot tub, heater or appliance helps explain later bill movements.", effort: "No cost" },
    ],
  },
  {
    category: "Outdoor, Pool, Spa & Garage",
    tips: [
      { title: "Keep a hot-tub or spa cover in good condition", why: "A well-fitting cover helps retain heat when the spa is not in use.", effort: "Check first" },
      { title: "Avoid keeping a spa hotter than needed", why: "Higher water temperature increases heat loss.", effort: "No cost" },
      { title: "Use spa filtration and heating schedules where appropriate", why: "Controls can reduce unnecessary runtime while maintaining water quality.", effort: "Check first" },
      { title: "Check pool-pump schedules", why: "Pumps can be large loads if they run longer than necessary.", effort: "Check first" },
      { title: "Use a pool cover where suitable", why: "Covers can reduce heat and water loss from the pool surface.", effort: "Low cost" },
      { title: "Use motion or timer controls for outdoor lights", why: "Outdoor lighting is easy to leave on for long periods.", effort: "Low cost" },
      { title: "Check whether garage refrigerators or freezers are still needed", why: "Secondary refrigeration can run all year for very little useful storage.", effort: "No cost" },
      { title: "Keep garage refrigerator coils and vents clear", why: "Poor airflow and dust can make refrigeration equipment work harder.", effort: "No cost" },
      { title: "Avoid routine use of portable heaters in garages or workshops", why: "Electric resistance heaters can create substantial costs when used for long periods.", effort: "Check first" },
      { title: "Choose efficient pumps and motors when replacement is due", why: "Pool, well and workshop motors can accumulate many operating hours.", effort: "When replacing" },
    ],
  },
  {
    category: "Everyday & Seasonal Habits",
    tips: [
      { title: "Dress for the season before changing the thermostat", why: "A small comfort adjustment can reduce the need for extra heating or cooling.", effort: "No cost" },
      { title: "Close exterior doors promptly in extreme weather", why: "Leaving doors open exchanges conditioned indoor air with outdoor air.", effort: "No cost" },
      { title: "Use rooms according to the season", why: "Choosing naturally warmer winter rooms or cooler summer rooms can reduce conditioning demand.", effort: "No cost" },
      { title: "Cook several items while the oven is already hot", why: "Using one heating cycle for multiple foods makes better use of the energy.", effort: "No cost" },
      { title: "Switch appliances off before long trips", why: "Unneeded devices do not need to remain powered while the home is empty.", effort: "No cost" },
      { title: "Use vacation or away modes where available", why: "Many thermostats, water heaters and smart devices can reduce energy use during absences.", effort: "No cost" },
      { title: "Do a seasonal energy walk-through twice a year", why: "A quick check can catch drafts, dirty filters, outdoor-light schedules and unused equipment.", effort: "No cost" },
      { title: "Review the biggest loads before worrying about tiny ones", why: "Heating, cooling, hot water, EVs, pools and major appliances usually matter more than very small devices.", effort: "No cost" },
      { title: "Use smart plugs to investigate uncertain loads", why: "Measuring a suspicious appliance can be more useful than guessing.", effort: "Low cost" },
      { title: "Replace equipment for a reason, not just because it is old", why: "Good maintenance, controls and usage changes can sometimes deliver value before a major purchase is needed.", effort: "Check first" },
    ],
  },
];

export const ENERGY_TIP_COUNT = ENERGY_TIP_CATEGORIES.reduce(
  (sum, category) => sum + category.tips.length,
  0
);
