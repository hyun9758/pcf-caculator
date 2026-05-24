import { NextResponse } from "next/server";
import { findProductById } from "@/lib/data/repository";
import { calculatePcf } from "@/lib/calculations";
import type { PcfBoundary } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, boundary = "cradle-to-gate" } = body as {
    productId: string;
    boundary?: PcfBoundary;
  };

  if (!productId) {
    return NextResponse.json(
      { error: "productId가 필요합니다" },
      { status: 400 }
    );
  }

  const product = await findProductById(productId);
  if (!product) {
    return NextResponse.json(
      { error: "제품을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  const result = calculatePcf(product, boundary);
  return NextResponse.json(result);
}
