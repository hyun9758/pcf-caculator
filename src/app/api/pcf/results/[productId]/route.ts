import { NextResponse } from "next/server";
import { getProduct } from "@/lib/data";
import { calculatePcf } from "@/lib/calculations";
import type { PcfBoundary } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const { searchParams } = new URL(request.url);
  const boundary = (searchParams.get("boundary") || "cradle-to-gate") as PcfBoundary;

  const product = getProduct(productId);
  if (!product) {
    return NextResponse.json(
      { error: "제품을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  const result = calculatePcf(product, boundary);
  return NextResponse.json(result);
}
