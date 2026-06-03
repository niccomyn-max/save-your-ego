import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


function findEmail(value: unknown): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    return looksLikeEmail ? trimmed : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findEmail(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    const preferredKeys = [
      "email",
      "customer_email",
      "contact_email",
      "buyer_email",
      "billing_email",
    ];

    for (const key of preferredKeys) {
      const found = findEmail(record[key]);
      if (found) return found;
    }

    for (const item of Object.values(record)) {
      const found = findEmail(item);
      if (found) return found;
    }
  }

  return null;
}

function findFirstString(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  for (const value of Object.values(payload)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const found = findFirstString(value as Record<string, unknown>, keys);
      if (found) return found;
    }
  }

  return null;
}

function findFirstNumber(payload: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = payload[key];

    if (typeof value === "number") return value;

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.]/g, ""));
      if (!Number.isNaN(parsed)) return parsed;
    }
  }

  for (const value of Object.values(payload)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const found = findFirstNumber(value as Record<string, unknown>, keys);
      if (found !== null) return found;
    }
  }

  return null;
}

function isAuthorised(request: NextRequest): boolean {
  const expectedSecret = process.env.CLICKFUNNELS_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("Missing CLICKFUNNELS_WEBHOOK_SECRET environment variable");
    return false;
  }

  const headerSecret =
    request.headers.get("x-clickfunnels-webhook-secret") ||
    request.headers.get("x-webhook-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const querySecret = request.nextUrl.searchParams.get("secret");

  return headerSecret === expectedSecret || querySecret === expectedSecret;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorised(request)) {
      return NextResponse.json(
        { error: "Unauthorised webhook request" },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const payload = (await request.json()) as Record<string, unknown>;

    const email = findEmail(payload);

    if (!email) {
      console.error("No customer email found in ClickFunnels payload", payload);
      return NextResponse.json(
        { error: "No customer email found" },
        { status: 400 }
      );
    }

    const orderId =
      findFirstString(payload, ["order_id", "orderId", "id", "order_number"]) ||
      null;

    const productName =
      findFirstString(payload, [
        "product_name",
        "productName",
        "product",
        "name",
        "offer_name",
      ]) || "Save Your EGO Home Energy Report";

    const currency =
      findFirstString(payload, ["currency", "currency_code"]) || "USD";

    const amount =
      findFirstNumber(payload, [
        "amount",
        "total",
        "total_amount",
        "price",
        "order_total",
      ]) || null;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });

    const { error } = await supabase.from("paid_users").upsert(
      {
        email,
        paid_access: true,
        source: "clickfunnels",
        order_id: orderId,
        product_name: productName,
        amount,
        currency,
        raw_payload: payload,
        paid_at: new Date().toISOString(),
      },
      {
        onConflict: "email",
      }
    );

    if (error) {
      console.error("Supabase paid_users upsert error", error);
      return NextResponse.json(
        { error: "Failed to save paid user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email,
      paid_access: true,
    });
  } catch (error) {
    console.error("ClickFunnels webhook error", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ClickFunnels webhook endpoint is live",
  });
}