import { connection, NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json(
        {
          paidAccess: false,
          error: "Server configuration missing",
        },
        { status: 500 }
      );
    }

    const response = NextResponse.next();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json({
        paidAccess: false,
        authenticated: false,
      });
    }

    const adminSupabase = createSupabaseAdminClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { data, error } = await adminSupabase
      .from("paid_users")
      .select("paid_access")
      .eq("email", user.email.toLowerCase())
      .eq("paid_access", true)
      .maybeSingle();

    if (error) {
      console.error("Paid access lookup error", error);

      return NextResponse.json(
        {
          paidAccess: false,
          authenticated: true,
          error: "Paid access lookup failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paidAccess: Boolean(data?.paid_access),
      authenticated: true,
    });
  } catch (error) {
    console.error("Access status route error", error);

    return NextResponse.json(
      {
        paidAccess: false,
        error: "Access status check failed",
      },
      { status: 500 }
    );
  }
}