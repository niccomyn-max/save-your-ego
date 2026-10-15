import { notFound } from "next/navigation";
import { PrintReportButton } from "@/components/print-report-button";
import { ReportIntelligenceCover, ReportEnergyAnalysis } from "@/components/report-intelligence-cover";
import ReportProgressRoadmap, { type RoadmapAction } from "@/components/report-progress-roadmap";
import ReportTechnicalGraphic from "@/components/report-technical-graphic";
import "../report/report-intelligence.css";
import "../report/report-graphics.css";

const sampleActions: RoadmapAction[] = [
  { action: "Check whether your electricity plan still suits how you use energy", why_it_matters: "A better matched plan could reduce what you pay without changing appliances.", effort_level: "Easy", estimated_annual_saving_range: "Depends on current plan", suggested_next_step: "Compare recent bills and plans from available providers." },
  { action: "Find and reduce draughts around windows and doors", why_it_matters: "Small gaps can make heating and cooling work harder.", effort_level: "Easy to medium", estimated_cost_range: "Low cost", suggested_next_step: "Check for noticeable draughts before considering upgrades." },
  { action: "Review settings on your largest electricity users", why_it_matters: "Regular high-use appliances can have an outsized influence on bills.", effort_level: "Easy", suggested_next_step: "Check appliance settings and how long equipment runs." },
  { action: "Explore whether roof insulation could be improved", why_it_matters: "Insulation can help maintain comfort and reduce unwanted heat transfer.", effort_level: "Ask the Expert", estimated_cost_range: "Medium cost", suggested_next_step: "Confirm the present insulation and obtain an appropriate assessment." },
  { action: "Investigate whether solar is appropriate for your roof", why_it_matters: "Suitability depends on orientation, shading, roof area, electricity use and local rules.", effort_level: "Ask the Expert", estimated_cost_range: "Higher cost", suggested_next_step: "Ask a qualified expert to review roof details and your energy needs." },
];

export default function ReportDesignLabPage() {
  if (process.env.VERCEL_ENV !== "preview") notFound();

  return (
    <main className="ri-report-page report-page min-h-screen bg-[#F3F8FC] px-4 py-8 text-[#10213D] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <span className="rounded-full border border-[#E0D17D] bg-[#FFF7CA] px-4 py-3 text-xs font-black uppercase tracking-wide text-[#17356F]">
            Report design preview · Sample data only
          </span>
          <PrintReportButton />
        </div>
        <nav className="ri-report-nav print:hidden" aria-label="Report preview sections">
          <div className="ri-report-nav-inner">
            <span className="ri-report-nav-label">PREVIEW /</span>
            <a href="#report-overview">Overview</a>
            <a href="#report-energy">Energy analysis</a>
            <a href="#report-sample-bills">Your bills</a>
            <a href="#report-roadmap">Action roadmap</a>
            <a href="#report-sample-solar">Solar view</a>
          </div>
        </nav>

        <ReportIntelligenceCover
          assessmentDate="15 Oct 2026"
          propertyType="Detached home (sample)"
          fuels={["Electricity", "Gas"]}
          electricityKwh={3720}
          applianceKwh={1380}
          biggestLossArea="Roof insulation (sample)"
          fabricBand="Medium (sample)"
          priorities={sampleActions.slice(0,3).map((item)=>item.action||"")}
        />

        <ReportEnergyAnalysis
          electricityKwh={3720}
          applianceKwh={1380}
          biggestLossArea="Roof insulation (sample)"
          fabricBand="Medium (sample)"
        />

        <section id="report-sample-bills" className="report-section mt-6 rounded-3xl border border-[#DCEAF5] bg-white p-6 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[1fr_245px] lg:items-center">
            <div>
              <p className="ri-section-kicker">02 / HOUSEHOLD BILLS</p>
              <h2 className="text-2xl font-black text-[#17356F]">A clearer view of your bills</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">In the actual report, this section displays the energy prices and bills entered during the assessment. No financial figures have been assumed for this preview.</p>
            </div>
            <div className="ri-graphic-aside"><ReportTechnicalGraphic kind="bills" /></div>
          </div>
        </section>

        <section className="report-section mt-6 rounded-3xl border border-[#DCEAF5] bg-white p-6 shadow-sm">
          <p className="ri-section-kicker">03 / IMPROVEMENT OPTIONS</p>
          <h2 className="text-2xl font-black text-[#17356F]">Start small, then build up</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Recommendations remain grouped by cost and effort, with the full why, likely cost and estimated savings where available.</p>
          <div className="ri-upgrade-spectrum mt-5">
            <div className="ri-upgrade-tier"><span>01</span><div><strong>Low-cost quick wins</strong><small>Practical changes you can begin with.</small></div></div>
            <div className="ri-upgrade-tier"><span>02</span><div><strong>Medium-cost improvements</strong><small>Targeted investments to consider.</small></div></div>
            <div className="ri-upgrade-tier"><span>03</span><div><strong>Higher-cost upgrades</strong><small>Major changes that deserve expert advice.</small></div></div>
          </div>
        </section>

        <div className="mt-6">
          <ReportProgressRoadmap reportId="design-preview" actions={sampleActions} lowCostActions={[sampleActions[1],sampleActions[2]]} mediumCostActions={[sampleActions[3]]} higherCostActions={[sampleActions[4]]} />
        </div>

        <section id="report-sample-solar" className="report-section mt-6 rounded-3xl border border-[#DCEAF5] bg-white p-6 shadow-sm">
          <div className="grid items-center gap-5 lg:grid-cols-[1fr_260px]">
            <div>
              <p className="ri-section-kicker">05 / SYSTEMS</p>
              <h2 className="text-2xl font-black text-[#17356F]">Solar, heating and appliances</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">The actual report retains its personalised solar suitability reasoning, battery considerations, appliance findings and questions for experts.</p>
            </div>
            <div className="ri-graphic-aside"><ReportTechnicalGraphic kind="solar" /></div>
          </div>
        </section>

        <footer className="report-disclaimer mt-6 rounded-3xl border border-[#DCEAF5] bg-[#FFF8DF] p-5 text-xs leading-7 text-[#5D5135]">
          <strong className="text-sm">Demonstration data only.</strong>
          <p>These values and example actions are not a customer's assessment. The preview is restricted to non-production Vercel deployments. Savings and costs in real reports remain estimates, not guarantees.</p>
        </footer>
      </div>
    </main>
  );
}
