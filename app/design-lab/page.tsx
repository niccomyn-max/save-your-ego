import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AssessmentEnergyTwinV2 from "@/components/assessment-energy-twin-v2";
import DashboardEnergyConsoleV2, { type EnergyHistoryPoint } from "@/components/dashboard-energy-console-v2";
import "../assessment/assessment-v2.css";
import "../dashboard/dashboard-v2.css";

const sampleHistory: EnergyHistoryPoint[] = [
  { id: "sample-1", date: "05 May 2026", electricityKwh: 3850, applianceKwh: 1820 },
  { id: "sample-2", date: "10 Jun 2026", electricityKwh: 3540, applianceKwh: 1780 },
  { id: "sample-3", date: "18 Jul 2026", electricityKwh: 3630, applianceKwh: 1690 },
  { id: "sample-4", date: "01 Sep 2026", electricityKwh: 3310, applianceKwh: 1640 },
  { id: "sample-5", date: "12 Oct 2026", electricityKwh: 3290, applianceKwh: 1530 },
];

export default function DesignLabPage() {
  // Temporary demonstration route is not served in the production environment.
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <main className="min-h-screen bg-[#F4F8FC] px-5 pb-16 pt-7 text-[#10213D] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-9 rounded-[24px] border border-[#D8E6F1] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Image src="/save-your-ego-logo.png" alt="Save Your EGO" width={170} height={64} className="h-auto w-36 sm:w-40" priority />
            <span className="rounded-full border border-[#FFD400] bg-[#FFF9DE] px-4 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-[#0B3274]">Preview only / Sample data</span>
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-[#10213D] sm:text-4xl">Energy intelligence — design lab</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Compare the two redesigned graphics without signing into a paid account. All readings on this page are labelled sample values.
            Your live assessment questions, reports, and stored customer data are not accessed here.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#assessment-graphic" className="rounded-full bg-[#0B3274] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#153F82]">Assessment graphic</a>
            <a href="#dashboard-graphic" className="rounded-full border border-[#D5E6F2] bg-[#F4F9FF] px-5 py-3 text-sm font-bold text-[#0B3274] transition hover:bg-[#E9F5FF]">Dashboard graphic</a>
          </div>
        </header>

        <section id="assessment-graphic" className="scroll-mt-8 overflow-hidden rounded-[26px] border border-[#D8E6F1] bg-white shadow-sm">
          <div className="border-b border-[#E3ECF3] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3D8FC4]">01 / Assessment</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Interactive home energy model</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Switch Building, Heating and Electricity to inspect the different animated system layers.</p>
          </div>
          <div className="grid gap-6 p-4 sm:p-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="rounded-[22px] bg-[#F5F9FE] p-6">
              <h3 className="text-xl font-black text-[#0B3274]">How it works</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Home details, insulation and usage inform your personalised assessment. The visual responds to those fields but does not pretend to measure live energy.</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-xl border border-[#DBEAF5] bg-white p-4 text-sm font-bold text-[#0B3274]">01 — Your home details</div>
                <div className="rounded-xl border border-[#DBEAF5] bg-white p-4 text-sm font-bold text-[#0B3274]">02 — Bills, heating and insulation</div>
                <div className="rounded-xl border border-[#DBEAF5] bg-white p-4 text-sm font-bold text-[#0B3274]">03 — Appliances, solar and insights</div>
              </div>
            </div>
            <AssessmentEnergyTwinV2 propertyType="Detached" heatingSystem="Heat pump" glazing="Double glazing" bedrooms={3} occupants={4} hasSolar={true} usesGas={false} usesOil={false} />
          </div>
        </section>

        <section id="dashboard-graphic" className="mt-8 scroll-mt-8 overflow-hidden rounded-[26px] border border-[#D8E6F1] bg-white shadow-sm">
          <div className="border-b border-[#E3ECF3] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3D8FC4]">02 / Dashboard</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Your energy insights console</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Switch Electricity and Appliances. The demo graph uses sample report history; the actual dashboard uses your saved estimates.</p>
          </div>
          <div className="grid gap-6 p-4 sm:p-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="rounded-[22px] bg-[#F5F9FE] p-6">
              <h3 className="text-xl font-black text-[#0B3274]">Your home energy plans</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">The live dashboard keeps your saved reports and navigation. Its new insight panel reads actual stored estimates rather than using illustrative figures.</p>
              <div className="mt-5 rounded-xl border border-[#DBEAF5] bg-white p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Design preview</p>
                <p className="mt-2 text-lg font-black text-[#0B3274]">Charts and reports, together.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Clear information, responsive motion and a more polished energy-tech presentation.</p>
              </div>
            </div>
            <DashboardEnergyConsoleV2 history={sampleHistory} reportCount={5} latestDate="12 Oct 2026" />
          </div>
        </section>

        <footer className="mt-7 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
          <p>These are visual previews only. Production is unchanged.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/assessment" className="font-black text-[#0B3274] underline underline-offset-4">Test real assessment</Link>
            <Link href="/dashboard" className="font-black text-[#0B3274] underline underline-offset-4">Test real dashboard</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
