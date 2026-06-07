"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AccountBar() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!cancelled) {
        setEmail(user?.email ?? null);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-[#dbe8f2] bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-700">
          Signed in as{" "}
          <span className="font-black text-[#17356f]">{email}</span>
        </p>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-full border border-[#17356f] px-4 py-2 text-sm font-black text-[#17356f] transition hover:bg-[#17356f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
}