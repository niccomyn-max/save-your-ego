"use client";

import { useEffect, useState } from "react";
import { AccountBar } from "@/components/account-bar";
import { createClient } from "@/lib/supabase/client";

export function AccountSettings() {
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      setEmail(user?.email ?? null);
      setHasCheckedUser(true);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setHasCheckedUser(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!hasCheckedUser || !email) {
    return null;
  }

  return <AccountBar email={email} />;
}