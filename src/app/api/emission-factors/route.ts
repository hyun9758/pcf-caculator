import { NextResponse } from "next/server";
import { emissionFactors } from "@/lib/data";
import type { EmissionFactorCategory } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as EmissionFactorCategory | null;
  const region = searchParams.get("region");

  let result = [...emissionFactors];

  if (category) {
    result = result.filter((ef) => ef.category === category);
  }

  if (region) {
    result = result.filter((ef) => ef.region === region);
  }

  return NextResponse.json(result);
}
