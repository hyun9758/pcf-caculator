import { NextResponse } from "next/server";
import { findAllProducts } from "@/lib/data/repository";
import { calculatePcf } from "@/lib/calculations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");

  let result = await findAllProducts();

  if (category) {
    result = result.filter((p) => p.category === category);
  }

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

  if (sort === "co2e_asc") {
    withPcf.sort((a, b) => a.pcfSummary.totalCo2e - b.pcfSummary.totalCo2e);
  } else if (sort === "co2e_desc") {
    withPcf.sort((a, b) => b.pcfSummary.totalCo2e - a.pcfSummary.totalCo2e);
  } else if (sort === "name") {
    withPcf.sort((a, b) => a.name.localeCompare(b.name));
  }

  return NextResponse.json(withPcf);
}
