import {
  ENERGY_TIP_CATEGORIES,
  ENERGY_TIP_COUNT,
} from "@/lib/energy-tips";

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
              Open any category for practical ideas you can check around the home.
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
                  {category.tips.map((tip, index) => (
                    <article
                      key={`${category.category}-${index}-${tip.title}`}
                      className="rounded-2xl border border-[#dbe8f2] bg-white p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h4 className="max-w-2xl font-black leading-6 text-black">
                          {tip.title}
                        </h4>
                        <span className="rounded-full bg-[#fff6bf] px-3 py-1 text-[11px] font-black text-[#6b5200]">
                          {tip.effort}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {tip.why}
                      </p>
                    </article>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
