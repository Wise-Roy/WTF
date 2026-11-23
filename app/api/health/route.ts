import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(missing)";

  try {
    // Real table so the query reaches Postgres; keep-alive cron relies on this to stop Supabase idling.
    const { error } = await supabase.from("products").select("id").limit(1);
    const connected = !error;
    const latency = Date.now() - start;

    if (connected) {
      return NextResponse.json({
        status: "ok",
        supabase: "connected",
        supabase_url: url,
        latency_ms: latency,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        status: "error",
        supabase: "unreachable",
        supabase_url: url,
        error: error.message,
        code: error.code,
        latency_ms: latency,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        supabase: "unreachable",
        supabase_url: url,
        error: err instanceof Error ? err.message : "Unknown error",
        latency_ms: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
