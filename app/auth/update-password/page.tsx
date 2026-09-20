import { AuthShell } from "@/components/auth-shell";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <AuthShell
      eyebrow="Account security"
      title="Choose a new password"
      description="Set a new password for your Save Your EGO account, then return to your dashboard."
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
