"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout";
import {
  KpiCard,
  EmissionsByScope,
  TrendChart,
  TopEmitters,
  LifecycleBreakdown,
} from "@/components/dashboard";
import { useViewMode } from "@/contexts/ViewModeContext";
import { formatCo2eFull, formatPercent } from "@/lib/constants";
import { Factory, Leaf, TrendingDown, Package } from "lucide-react";
import type { DashboardSummary, TrendDataPoint } from "@/lib/types";

// 직접 import로 SSR 없이 클라이언트에서 계산
import { products } from "@/lib/data";
import { trendData } from "@/lib/data";
import { calculateAllPcf } from "@/lib/calculations";
import type { GhgScope, LifecycleStage } from "@/lib/types";

function computeSummary(): DashboardSummary {
  const allResults = calculateAllPcf(products, "cradle-to-gate");
  const totalCo2e = allResults.reduce((sum, r) => sum + r.totalCo2e, 0);
  const avgCo2ePerProduct = totalCo2e / allResults.length;

  const scopes: GhgScope[] = ["scope1", "scope2", "scope3"];
  const scopeBreakdown = scopes.reduce(
    (acc, scope) => {
      acc[scope] = allResults.reduce((sum, r) => sum + r.byScope[scope], 0);
      return acc;
    },
    {} as Record<GhgScope, number>
  );

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

  const sorted = [...allResults].sort((a, b) => b.totalCo2e - a.totalCo2e);
  const latestQ = trendData[trendData.length - 1];
  const prevQ = trendData[trendData.length - 2];
  const change =
    ((latestQ.totalCo2e - prevQ.totalCo2e) / prevQ.totalCo2e) * 100;

  return {
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
    quarterOverQuarterChange: change,
  };
}

export default function DashboardPage() {
  const { viewMode } = useViewMode();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);

  useEffect(() => {
    setSummary(computeSummary());
    setTrends(trendData);
  }, []);

  if (!summary) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const topEmitterData = calculateAllPcf(products, "cradle-to-gate").map(
    (r) => ({
      productName: r.productName,
      category:
        products.find((p) => p.id === r.productId)?.category || "steel",
      totalCo2e: r.totalCo2e,
    })
  );

  return (
    <div>
      <Header
        title="탄소 배출 대시보드"
        description="제품 탄소 발자국(PCF) 현황 및 추세 분석"
        showViewToggle
      />

      <div className="p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="총 탄소 배출량"
            value={formatCo2eFull(summary.totalCo2e)}
            change={summary.quarterOverQuarterChange}
            icon={Factory}
            iconColor="text-orange-500"
          />
          <KpiCard
            title="제품당 평균"
            value={formatCo2eFull(summary.avgCo2ePerProduct)}
            icon={Leaf}
            iconColor="text-green-500"
          />
          <KpiCard
            title="전분기 대비"
            value={formatPercent(summary.quarterOverQuarterChange)}
            icon={TrendingDown}
            iconColor="text-blue-500"
          />
          <KpiCard
            title="평가 제품 수"
            value={`${summary.totalProducts}개`}
            icon={Package}
            iconColor="text-purple-500"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EmissionsByScope data={summary.scopeBreakdown} />
          <TopEmitters data={topEmitterData} />
        </div>

        {/* Trend Chart */}
        <TrendChart data={trends} showByScope={viewMode === "practitioner"} />

        {/* Practitioner: Lifecycle Breakdown */}
        {viewMode === "practitioner" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LifecycleBreakdown data={summary.lifecycleBreakdown} />
            <div className="space-y-4">
              <div className="rounded-lg border bg-white p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Scope별 상세
                </h3>
                <div className="space-y-3">
                  {(["scope1", "scope2", "scope3"] as const).map((scope) => {
                    const value = summary.scopeBreakdown[scope];
                    const pct = (value / summary.totalCo2e) * 100;
                    const colors = {
                      scope1: "bg-orange-500",
                      scope2: "bg-blue-500",
                      scope3: "bg-green-500",
                    };
                    const labels = {
                      scope1: "Scope 1 (직접 배출)",
                      scope2: "Scope 2 (간접 배출)",
                      scope3: "Scope 3 (기타 간접)",
                    };
                    return (
                      <div key={scope}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{labels[scope]}</span>
                          <span className="font-medium">
                            {value.toFixed(1)} kgCO₂e ({pct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div
                            className={`h-2 rounded-full ${colors[scope]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-lg border bg-white p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  최대/최소 배출 제품
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-600">▲ 최대</span>
                    <span>
                      {summary.topEmitter.productName} (
                      {summary.topEmitter.co2e.toFixed(1)} kgCO₂e)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600">▼ 최소</span>
                    <span>
                      {summary.lowestEmitter.productName} (
                      {summary.lowestEmitter.co2e.toFixed(1)} kgCO₂e)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
