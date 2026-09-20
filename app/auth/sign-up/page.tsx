import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <AuthShell
      eyebrow="Create your account"
      title="Set up your Save Your EGO access"
      description="Create the account you’ll use for your USA home energy assessments and saved reports."
    >
      <SignUpForm />
    </AuthShell>
  );
}
