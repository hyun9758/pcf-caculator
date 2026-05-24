import { NextResponse } from "next/server";
import { products } from "@/lib/data";
import { trendData } from "@/lib/data";
import { calculateAllPcf } from "@/lib/calculations";
import type { DashboardSummary } from "@/lib/types";
import type { GhgScope, LifecycleStage } from "@/lib/types";

export async function GET() {
  const allResults = calculateAllPcf(products, "cradle-to-gate");

  const totalCo2e = allResults.reduce((sum, r) => sum + r.totalCo2e, 0);
  const avgCo2ePerProduct = totalCo2e / allResults.length;

  // Scope 집계
  const scopes: GhgScope[] = ["scope1", "scope2", "scope3"];
  const scopeBreakdown = scopes.reduce(
    (acc, scope) => {
      acc[scope] = allResults.reduce((sum, r) => sum + r.byScope[scope], 0);
      return acc;
    },
    {} as Record<GhgScope, number>
  );

  // Lifecycle Stage 집계
  const stages: LifecycleStage[] = [
    "raw_material",
    "manufacturing",
    "transportation",
    "use",
    "end_of_life",
  ];
  const lifecycleBreakdown = stages.reduce(
    (acc, stage) => {
      acc[stage] = allResults.reduce(
        (sum, r) => sum + r.byLifecycleStage[stage],
        0
      );
      return acc;
    },
    {} as Record<LifecycleStage, number>
  );

  // Top / Lowest emitter
  const sorted = [...allResults].sort((a, b) => b.totalCo2e - a.totalCo2e);

  // 전분기 대비 변화율
  const latestQuarter = trendData[trendData.length - 1];
  const previousQuarter = trendData[trendData.length - 2];
  const quarterOverQuarterChange =
    ((latestQuarter.totalCo2e - previousQuarter.totalCo2e) /
      previousQuarter.totalCo2e) *
    100;

  const summary: DashboardSummary = {
    totalProducts: products.length,
    avgCo2ePerProduct,
    totalCo2e,
    scopeBreakdown,
    lifecycleBreakdown,
    topEmitter: {
      productName: sorted[0].productName,
      co2e: sorted[0].totalCo2e,
    },
    lowestEmitter: {
      productName: sorted[sorted.length - 1].productName,
      co2e: sorted[sorted.length - 1].totalCo2e,
    },
    quarterOverQuarterChange,
  };

  return NextResponse.json(summary);
}
