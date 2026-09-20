import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function Page() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your Save Your EGO password"
      description="Enter the email linked to your account and we’ll send a secure reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
