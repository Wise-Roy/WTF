import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await isAdmin();
  return NextResponse.json({ success: true, data: { authorized: admin } });
}
