import { NextResponse } from "next/server";
import { getProduct } from "@/lib/data";
import { getActivityDataByProduct } from "@/lib/data";
import { calculatePcf } from "@/lib/calculations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const product = getProduct(productId);

  if (!product) {
    return NextResponse.json(
      { error: "제품을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  const activityData = getActivityDataByProduct(productId);
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
