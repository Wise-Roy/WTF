import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(missing)";

  try {
    // Simple query to verify Supabase connectivity
    const { error } = await supabase.from("_health_check_dummy").select("*").limit(1);

    // 42P01 = relation does not exist, PGRST205 = not in schema cache
    // Both mean the connection itself succeeded
    const connected = !error || error.code === "42P01" || error.code === "PGRST205";
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
