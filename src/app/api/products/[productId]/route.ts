import { NextResponse } from "next/server";
import { findProductById, findActivityDataByProduct } from "@/lib/data/repository";
import { calculatePcf } from "@/lib/calculations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const product = await findProductById(productId);

  if (!product) {
    return NextResponse.json(
      { error: "제품을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  const activityData = await findActivityDataByProduct(productId);
  const pcfResult = calculatePcf(product, "cradle-to-gate");
  const pcfResultGrave = calculatePcf(product, "cradle-to-grave");

  return NextResponse.json({
    product,
    activityData,
    pcf: {
      cradleToGate: pcfResult,
      cradleToGrave: pcfResultGrave,
    },
  });
}
