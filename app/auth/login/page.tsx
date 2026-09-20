import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <AuthShell
      eyebrow="Customer access"
      title="Welcome back to Save Your EGO"
      description="Sign in to open your USA home energy dashboard, start a new assessment, and view your saved reports."
    >
      <LoginForm />
    </AuthShell>
  );
}
