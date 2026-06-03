import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json({
        loggedIn: false,
        paid: false,
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase environment variables for access check");

      return NextResponse.json(
        {
          loggedIn: true,
          paid: false,
          error: "Server configuration error",
        },
        { status: 500 }
      );
    }

    const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    const email = user.email.trim().toLowerCase();

    const { data: paidUser, error: paidUserError } = await admin
      .from("paid_users")
      .select("paid_access")
      .eq("email", email)
      .maybeSingle();

    if (paidUserError) {
      console.error("Paid user lookup failed", paidUserError);

      return NextResponse.json(
        {
          loggedIn: true,
          paid: false,
          error: "Paid access lookup failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      loggedIn: true,
      email,
      paid: Boolean(paidUser?.paid_access),
    });
  } catch (error) {
    console.error("Access status error", error);

    return NextResponse.json(
      {
        loggedIn: false,
        paid: false,
        error: "Access status check failed",
      },
      { status: 500 }
    );
  }
}
