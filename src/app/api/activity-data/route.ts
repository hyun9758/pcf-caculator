import { NextResponse } from "next/server";
import {
  findActivityDataByProduct,
  createActivityData,
  deleteActivityData,
} from "@/lib/data/repository";
import { ACTIVITY_TYPE_TO_STAGE } from "@/lib/types";
import { matchEmissionFactor } from "@/lib/data/emission-factors";
import type { ActivityType } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "productId가 필요합니다" },
      { status: 400 }
    );
  }

  const data = await findActivityDataByProduct(productId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { productId, date, activityType, description, descriptionKo, quantity, unit } = body;

  if (!productId || !date || !activityType || !quantity) {
    return NextResponse.json(
      { error: "필수 필드가 누락되었습니다 (productId, date, activityType, quantity)" },
      { status: 400 }
    );
  }

  const ef = matchEmissionFactor(activityType, descriptionKo || description || "");
  if (!ef) {
    return NextResponse.json(
      { error: `배출계수를 찾을 수 없습니다: ${activityType} - ${descriptionKo}` },
      { status: 400 }
    );
  }

  const lifecycleStage = ACTIVITY_TYPE_TO_STAGE[activityType as ActivityType];

  const created = await createActivityData({
    productId,
    date,
    activityType,
    lifecycleStage,
    emissionFactorId: ef.id,
    description: description || ef.name,
    descriptionKo: descriptionKo || ef.nameKo,
    quantity: parseFloat(quantity),
    unit: unit || ef.unit,
  });

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "id가 필요합니다" },
      { status: 400 }
    );
  }

  await deleteActivityData(id);
  return NextResponse.json({ success: true });
}
