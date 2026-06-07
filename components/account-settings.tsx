import { AccountBar } from "@/components/account-bar";
import { createClient } from "@/lib/supabase/server";

export async function AccountSettings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  return <AccountBar email={user.email} />;
}