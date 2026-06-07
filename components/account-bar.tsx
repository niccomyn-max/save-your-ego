"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AccountBarProps = {
  email: string;
};

export function AccountBar({ email }: AccountBarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const cancelSubscriptionHref = `mailto:support@saveyourego.com?subject=Cancel%20my%20Save%20Your%20EGO%20subscription&body=Hi%20Save%20Your%20EGO%20team%2C%0A%0APlease%20cancel%20my%20subscription.%0A%0AAccount%20email%3A%20${encodeURIComponent(
    email
  )}%0A%0AI%20understand%20I%20need%20to%20request%20this%20before%20my%20next%20billing%20date.%0A%0AThanks`;

  async function handleSignOut() {
    setIsSigningOut(true);
    setMessage("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
      setIsSigningOut(false);
      return;
    }

    router.push("/auth/login");
    router.refresh();
  }

  async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (newPassword.length < 6) {
      setMessage("Please use a password with at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsUpdatingPassword(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);
    setMessage("Password updated successfully.");
  }

  return (
    <div className="fixed right-5 top-5 z-50 sm:right-8">
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center justify-center rounded-full border border-[#17356f] bg-white px-5 py-3 text-sm font-black text-[#17356f] shadow-lg shadow-[#17356f]/10 transition hover:bg-[#f5f8ff]">
          Settings
          <span className="ml-2 inline-block text-xs transition group-open:rotate-180">
            ▼
          </span>
        </summary>

        <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-[1.5rem] border border-[#dbe8f2] bg-white p-4 text-left shadow-2xl shadow-[#17356f]/20">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Account
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Signed in as
            <span className="mt-1 block break-all font-black text-[#17356f]">
              {email}
            </span>
          </p>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm((current) => !current);
                setMessage("");
              }}
              className="rounded-full border border-[#17356f] bg-white px-4 py-3 text-sm font-black text-[#17356f] transition hover:bg-[#f5f8ff]"
            >
              {showPasswordForm ? "Hide password form" : "Change password"}
            </button>

            {showPasswordForm && (
              <form
                onSubmit={handlePasswordUpdate}
                className="rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-4"
              >
                <label className="block text-xs font-black uppercase tracking-wide text-slate-500">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#dbe8f2] bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:border-[#17356f]"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />

                <label className="mt-3 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#dbe8f2] bg-white px-4 py-3 text-sm font-semibold text-black outline-none focus:border-[#17356f]"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="mt-4 w-full rounded-full bg-[#17356f] px-4 py-3 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingPassword ? "Updating..." : "Update password"}
                </button>
              </form>
            )}

            <a
              href={cancelSubscriptionHref}
              className="block rounded-full border border-[#17356f] bg-white px-4 py-3 text-center text-sm font-black text-[#17356f] transition hover:bg-[#f5f8ff]"
            >
              Cancel subscription request
            </a>

            <p className="rounded-2xl bg-[#fff6bf] p-3 text-xs font-semibold leading-5 text-slate-700">
              To cancel, email support@saveyourego.com before your next billing
              date. Cancellation requests will be dealt with within 24 hours.
            </p>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="rounded-full bg-[#17356f] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-2xl border border-[#dbe8f2] bg-[#f7fbff] p-3 text-sm font-semibold text-slate-700">
              {message}
            </p>
          )}
        </div>
      </details>
    </div>
  );
}