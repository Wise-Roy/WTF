import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: flagship } = await supabase
    .from("flagship_settings")
    .select("*")
    .limit(1)
    .single();

  if (!flagship?.product_id) {
    return NextResponse.json({ success: true, data: { flagship: null } });
  }

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", flagship.product_id)
    .single();

  if (!product) {
    return NextResponse.json({ success: true, data: { flagship: null } });
  }

  return NextResponse.json({
    success: true,
    data: {
      flagship: {
        title: flagship.custom_title || product.prod_name,
        description: flagship.custom_description || product.prod_description,
        image: flagship.selected_image,
        product_id: product.id,
        product_name: product.prod_name,
      },
    },
  });
}
