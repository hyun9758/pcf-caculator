import { NextResponse } from "next/server";
import { products } from "@/lib/data";
import { calculatePcf } from "@/lib/calculations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");

  let result = [...products];

  // 카테고리 필터
  if (category) {
    result = result.filter((p) => p.category === category);
  }

  // PCF 결과 포함
  const withPcf = result.map((product) => {
    const pcfResult = calculatePcf(product, "cradle-to-gate");
    return {
      ...product,
      pcfSummary: {
        totalCo2e: pcfResult.totalCo2e,
        boundary: pcfResult.boundary,
        byScope: pcfResult.byScope,
      },
    };
  });

  // 정렬
  if (sort === "co2e_asc") {
    withPcf.sort((a, b) => a.pcfSummary.totalCo2e - b.pcfSummary.totalCo2e);
  } else if (sort === "co2e_desc") {
    withPcf.sort((a, b) => b.pcfSummary.totalCo2e - a.pcfSummary.totalCo2e);
  } else if (sort === "name") {
    withPcf.sort((a, b) => a.name.localeCompare(b.name));
  }

  return NextResponse.json(withPcf);
}
