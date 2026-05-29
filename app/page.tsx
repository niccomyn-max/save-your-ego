import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7fbff] px-5 py-10">
          <p className="text-sm font-semibold text-slate-600">
            Loading Save Your EGO...
          </p>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7fbff] text-[#050505]">
      <section className="relative px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-[#ffd600]/30 blur-3xl" />
        <div className="absolute right-[-120px] top-10 h-80 w-80 rounded-full bg-[#59b9ec]/30 blur-3xl" />
        <div className="absolute bottom-[-160px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#17356f]/10 blur-3xl" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-md">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/save-your-ego-logo.png"
              alt="Save Your EGO"
              width={150}
              height={60}
              priority
              className="h-auto w-32 sm:w-40"
            />
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-[#17356f] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[#17356f]/20 transition hover:bg-black"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden rounded-full px-4 py-2 text-sm font-black text-[#17356f] transition hover:bg-[#e9f6fe] sm:inline-flex"
                >
                  Log in
                </Link>

                <Link
                  href="/auth/sign-up"
                  className="rounded-full bg-[#17356f] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[#17356f]/20 transition hover:bg-black"
                >
                  Start
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd600]/50 bg-white/80 px-4 py-2 text-sm font-black text-[#17356f] shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#ffd600]" />
              Electricity, Gas and Oil home energy AI
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-[#050505] sm:text-6xl lg:text-7xl">
              Find the energy drains hiding in your home.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Save Your EGO turns your home details, bills, appliances and
              optional appliance photos into a practical AI-powered energy
              assessment you can save as a PDF.
            </p>

            <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-[#17356f]">
              Covering Electricity, Gas and Oil
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <>
                  <Link
                    href="/assessment"
                    className="rounded-2xl bg-[#17356f] px-6 py-4 text-center text-base font-black text-white shadow-xl shadow-[#17356f]/25 transition hover:-translate-y-0.5 hover:bg-black"
                  >
                    Start new assessment
                  </Link>

                  <Link
                    href="/dashboard"
                    className="rounded-2xl border border-[#dbe8f2] bg-white/80 px-6 py-4 text-center text-base font-black text-[#17356f] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-[#e9f6fe]"
                  >
                    View dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/sign-up"
                    className="rounded-2xl bg-[#17356f] px-6 py-4 text-center text-base font-black text-white shadow-xl shadow-[#17356f]/25 transition hover:-translate-y-0.5 hover:bg-black"
                  >
                    Create account
                  </Link>

                  <Link
                    href="/auth/login"
                    className="rounded-2xl border border-[#dbe8f2] bg-white/80 px-6 py-4 text-center text-base font-black text-[#17356f] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-[#e9f6fe]"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/80 bg-white/85 p-4 shadow-2xl shadow-[#17356f]/10 backdrop-blur-xl sm:p-6">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-[#17356f] via-[#0d4f78] to-[#050505] p-5 text-white sm:p-6">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#ffd600]">
                  Your report
                </p>

                <h2 className="mt-4 text-3xl font-black">
                  AI Energy Assessment
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/80">
                  Practical insights across Electricity, Gas and Oil, with
                  optional appliance photo analysis and a PDF-ready report.
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                    <p className="text-xs font-black uppercase text-white/60">
                      Likely energy drains
                    </p>
                    <p className="mt-1 text-lg font-black">
                      Heating pattern, appliances, hot water
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-[#ffd600] p-4 text-black">
                      <p className="text-xs font-black">Electricity</p>
                      <p className="mt-3 text-lg font-black leading-tight">
                        Usage review
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#59b9ec] p-4 text-[#17356f]">
                      <p className="text-xs font-black">Gas</p>
                      <p className="mt-3 text-lg font-black leading-tight">
                        Usage review
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 text-black">
                      <p className="text-xs font-black">Oil</p>
                      <p className="mt-3 text-lg font-black leading-tight">
                        Usage review
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 text-black">
                    <p className="text-xs font-black uppercase text-slate-500">
                      Output
                    </p>
                    <p className="mt-1 text-lg font-black">
                      PDF-ready home energy report
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 rounded-2xl border border-white bg-white px-5 py-4 shadow-xl sm:-left-6">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Built for
              </p>
              <p className="text-lg font-black text-[#17356f]">Real homes</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-3xl font-black text-[#ffd600]">01</p>
            <h3 className="mt-3 font-black text-slate-950">
              Enter home data
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Capture property details, bills, fuel use, fabric, heating and
              solar suitability.
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-3xl font-black text-[#59b9ec]">02</p>
            <h3 className="mt-3 font-black text-slate-950">
              Add appliance detail
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select common appliances, add anything unusual and upload optional
              appliance photos.
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-3xl font-black text-[#17356f]">03</p>
            <h3 className="mt-3 font-black text-slate-950">
              Generate AI insight
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Get usage checks, likely drains, top priorities, costs, savings
              and payback guidance.
            </p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-3xl font-black text-black">04</p>
            <h3 className="mt-3 font-black text-slate-950">
              Save the report
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep the result on your dashboard and export a polished PDF-ready
              report.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}