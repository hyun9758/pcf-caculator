import { NextResponse } from "next/server";
import { findAllEmissionFactors } from "@/lib/data/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const region = searchParams.get("region") || undefined;

  const result = await findAllEmissionFactors({ category, region });
  return NextResponse.json(result);
}
