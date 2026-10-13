import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("hero_settings")
    .select("designer_photo_1, designer_photo_2, designer_photo_3")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      images: [
        data.designer_photo_1 || "",
        data.designer_photo_2 || "",
        data.designer_photo_3 || "",
      ],
    },
  });
}
