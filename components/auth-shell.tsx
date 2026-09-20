import Image from "next/image";
import Link from "next/link";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="ego-page min-h-svh px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-[#dbe8f2] bg-white shadow-2xl shadow-[#17356f]/10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#17356f] via-[#0d4f78] to-black p-7 text-white sm:p-10 lg:p-12">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#59b9ec]/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#ffd600]/15 blur-3xl" />

          <div className="relative flex h-full flex-col">
            <Link href="/" className="inline-flex w-fit rounded-2xl bg-white p-4 shadow-lg">
              <Image
                src="/save-your-ego-logo.png"
                alt="Save Your EGO"
                width={270}
                height={105}
                priority
                className="h-auto w-52 sm:w-60"
              />
            </Link>

            <div className="my-auto py-10">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ffd600]">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/75">
                {description}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-wide text-white/55">
                    Climate
                  </p>
                  <p className="mt-1 font-black">ZIP-aware</p>
                </div>
                <div className="rounded-2xl bg-[#ffd600] p-4 text-black">
                  <p className="text-xs font-black uppercase tracking-wide opacity-60">
                    Priorities
                  </p>
                  <p className="mt-1 font-black">$0 first</p>
                </div>
                <div className="rounded-2xl bg-[#59b9ec] p-4 text-[#17356f]">
                  <p className="text-xs font-black uppercase tracking-wide opacity-60">
                    Report
                  </p>
                  <p className="mt-1 font-black">AI-assisted</p>
                </div>
              </div>
            </div>

            <p className="text-xs leading-5 text-white/45">
              Save Your EGO USA · Find the waste before you buy the upgrade.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#f7fbff] p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}
