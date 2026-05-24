import { NextResponse } from "next/server";
import {
  findActivityDataByProduct,
  createActivityData,
  deleteActivityData,
} from "@/lib/data/repository";

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
  const { productId, lifecycleStage, emissionFactorId, description, descriptionKo, quantity, unit } = body;

  if (!productId || !lifecycleStage || !emissionFactorId || !quantity) {
    return NextResponse.json(
      { error: "필수 필드가 누락되었습니다" },
      { status: 400 }
    );
  }

  const created = await createActivityData({
    productId,
    lifecycleStage,
    emissionFactorId,
    description: description || "",
    descriptionKo: descriptionKo || "",
    quantity: parseFloat(quantity),
    unit: unit || "",
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
