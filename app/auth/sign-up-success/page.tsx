import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Your account is ready
              </CardTitle>
              <CardDescription>
                You can now sign in to Save Your EGO
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully created your account. Please sign in
                using the same email address and password you just registered.
              </p>

              <Link
                href="/auth/login"
                className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Log in to Save Your EGO
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}