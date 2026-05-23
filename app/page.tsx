import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-6 py-12">
          <p>Loading Save Your EGO...</p>
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
    <main className="mx-auto max-w-5xl px-6 py-12">
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <Image
          src="/save-your-ego-logo.png"
          alt="Save Your EGO"
          width={340}
          height={130}
          priority
        />

        <h1 className="mt-8 text-4xl font-bold tracking-tight">
          Save Your Electricity, Gas and Oil.
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-gray-600">
          Save Your EGO is a practical home energy efficiency tool that helps
          households identify likely energy drains, reduce waste and understand
          where improvements may matter most.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-900">
            Electricity
          </span>
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-900">
            Gas
          </span>
          <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-900">
            Oil
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white"
              >
                Go to dashboard
              </Link>

              <Link
                href="/assessment"
                className="rounded-md border px-5 py-3 text-sm font-medium"
              >
                Start assessment
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white"
              >
                Log in
              </Link>

              <Link
                href="/auth/sign-up"
                className="rounded-md border px-5 py-3 text-sm font-medium"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold">Assess the home</h2>
          <p className="mt-2 text-sm text-gray-600">
            Capture home details, bills, heating, fabric performance and
            appliance usage.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold">Find likely waste</h2>
          <p className="mt-2 text-sm text-gray-600">
            Estimate appliance loads, fabric risk, running-cost risk and
            improvement potential.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <h2 className="font-bold">Generate an AI report</h2>
          <p className="mt-2 text-sm text-gray-600">
            Turn the saved assessment into a practical, personalised home energy
            action report.
          </p>
        </div>
      </section>
    </main>
  );
}