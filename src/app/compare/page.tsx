"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveBar } from "@nivo/bar";
import { products } from "@/lib/data";
import { calculatePcf } from "@/lib/calculations";
import {
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_STAGE_ORDER,
  LIFECYCLE_COLORS,
  SCOPE_COLORS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  formatCo2eFull,
} from "@/lib/constants";
import type { ProductCategory, GhgScope, LifecycleStage } from "@/lib/types";
import { GitCompareArrows } from "lucide-react";

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    products[0].id,
    products[1].id,
  ]);

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const selectedProducts = useMemo(
    () =>
      selectedIds
        .map((id) => {
          const product = products.find((p) => p.id === id);
          if (!product) return null;
          const pcf = calculatePcf(product, "cradle-to-gate");
          return { product, pcf };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [selectedIds]
  );

  // Bar chart data: 제품별 lifecycle stage 비교
  const barData = LIFECYCLE_STAGE_ORDER
    .filter((stage) => stage !== "use" && stage !== "end_of_life")
    .map((stage) => {
      const row: Record<string, string | number> = {
        stage: LIFECYCLE_STAGE_LABELS[stage].ko,
      };
      selectedProducts.forEach(({ product, pcf }) => {
        const shortName =
          product.name.length > 10
            ? product.name.substring(0, 10) + "…"
            : product.name;
        row[shortName] = Math.round(pcf.byLifecycleStage[stage] * 100) / 100;
      });
      return row;
    });

  const barKeys = selectedProducts.map(({ product }) =>
    product.name.length > 10
      ? product.name.substring(0, 10) + "…"
      : product.name
  );

  const barColors = ["#8b5cf6", "#f97316", "#3b82f6", "#22c55e"];

  return (
    <div>
      <Header
        title="제품 비교"
        description="최대 4개 제품의 탄소 발자국을 비교 분석"
      />

      <div className="p-8 space-y-6">
        {/* Product Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5" />
              비교할 제품 선택 (최대 4개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {products.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span>{product.name}</span>
                    <Badge
                      variant="secondary"
                      className="ml-2 text-xs"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[product.category as ProductCategory] + "20",
                        color:
                          CATEGORY_COLORS[product.category as ProductCategory],
                      }}
                    >
                      {CATEGORY_LABELS[product.category as ProductCategory]?.ko}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedProducts.length >= 2 ? (
          <>
            {/* Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  전과정 단계별 비교 (Cradle-to-Gate)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveBar
                    data={barData}
                    keys={barKeys}
                    indexBy="stage"
                    groupMode="grouped"
                    margin={{ top: 20, right: 130, bottom: 50, left: 80 }}
                    padding={0.3}
                    colors={barColors.slice(0, selectedProducts.length)}
                    borderRadius={4}
                    axisBottom={{
                      tickRotation: 0,
                      legend: "전과정 단계",
                      legendPosition: "middle",
                      legendOffset: 40,
                    }}
                    axisLeft={{
                      legend: "kgCO₂e",
                      legendPosition: "middle",
                      legendOffset: -60,
                    }}
                    labelSkipWidth={20}
                    labelTextColor="#ffffff"
                    legends={[
                      {
                        dataFrom: "keys",
                        anchor: "bottom-right",
                        direction: "column",
                        translateX: 120,
                        itemWidth: 110,
                        itemHeight: 20,
                        symbolSize: 12,
                      },
                    ]}
                    tooltip={({ id, value, indexValue }) => (
                      <div className="rounded-lg bg-white px-3 py-2 shadow-lg border text-sm">
                        <strong>{String(id)}</strong>
                        <br />
                        {String(indexValue)}: {Number(value).toLocaleString()} kgCO₂e
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">상세 비교 테이블</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left font-medium text-gray-500">
                          항목
                        </th>
                        {selectedProducts.map(({ product }) => (
                          <th
                            key={product.id}
                            className="py-3 text-right font-medium text-gray-900"
                          >
                            {product.name.length > 15
                              ? product.name.substring(0, 15) + "…"
                              : product.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Total */}
                      <tr className="border-b bg-gray-50 font-semibold">
                        <td className="py-2.5">총 PCF</td>
                        {selectedProducts.map(({ product, pcf }) => (
                          <td key={product.id} className="py-2.5 text-right">
                            {formatCo2eFull(pcf.totalCo2e)}
                          </td>
                        ))}
                      </tr>
                      {/* Scope breakdown */}
                      {(["scope1", "scope2", "scope3"] as GhgScope[]).map(
                        (scope) => (
                          <tr key={scope} className="border-b">
                            <td className="py-2 flex items-center gap-2">
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: SCOPE_COLORS[scope],
                                }}
                              />
                              {scope === "scope1"
                                ? "Scope 1 (직접)"
                                : scope === "scope2"
                                  ? "Scope 2 (전력)"
                                  : "Scope 3 (기타)"}
                            </td>
                            {selectedProducts.map(({ product, pcf }) => {
                              const value = pcf.byScope[scope];
                              const pct =
                                pcf.totalCo2e > 0
                                  ? (value / pcf.totalCo2e) * 100
                                  : 0;
                              return (
                                <td
                                  key={product.id}
                                  className="py-2 text-right"
                                >
                                  {value.toFixed(1)}{" "}
                                  <span className="text-gray-400">
                                    ({pct.toFixed(0)}%)
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        )
                      )}
                      {/* Lifecycle stages */}
                      {LIFECYCLE_STAGE_ORDER.filter(
                        (s) => s !== "use" && s !== "end_of_life"
                      ).map((stage) => (
                        <tr key={stage} className="border-b">
                          <td className="py-2 flex items-center gap-2">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: LIFECYCLE_COLORS[stage as LifecycleStage],
                              }}
                            />
                            {LIFECYCLE_STAGE_LABELS[stage as LifecycleStage].ko}
                          </td>
                          {selectedProducts.map(({ product, pcf }) => {
                            const value =
                              pcf.byLifecycleStage[stage as LifecycleStage];
                            // 최대값 강조
                            const maxValue = Math.max(
                              ...selectedProducts.map(
                                (sp) =>
                                  sp.pcf.byLifecycleStage[
                                    stage as LifecycleStage
                                  ]
                              )
                            );
                            const isMax = value === maxValue && value > 0;
                            return (
                              <td
                                key={product.id}
                                className={`py-2 text-right ${
                                  isMax
                                    ? "text-red-600 font-medium"
                                    : ""
                                }`}
                              >
                                {value.toFixed(1)} kgCO₂e
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {/* Functional unit */}
                      <tr className="border-b">
                        <td className="py-2 text-gray-500">기능 단위</td>
                        {selectedProducts.map(({ product }) => (
                          <td
                            key={product.id}
                            className="py-2 text-right text-gray-500"
                          >
                            {product.functionalUnit}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <GitCompareArrows className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                비교하려면 2개 이상의 제품을 선택하세요.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
