"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveBar } from "@nivo/bar";
import { products, emissionFactors } from "@/lib/data";
import { calculatePcf } from "@/lib/calculations";
import {
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_STAGE_ORDER,
  LIFECYCLE_COLORS,
  formatCo2eFull,
} from "@/lib/constants";
import type { LifecycleStage } from "@/lib/types";
import {
  Zap,
  TrendingDown,
  RotateCcw,
  Lightbulb,
  Leaf,
  Sun,
} from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: typeof Zap;
  color: string;
  // 배출계수 변경: emissionFactorId → 변경 비율 (0.5 = 50% 감소)
  factorChanges: Record<string, number>;
}

const scenarios: Scenario[] = [
  {
    id: "renewable-energy",
    name: "재생에너지 전환",
    description:
      "전력을 100% 재생에너지(태양광/풍력)로 전환. 전력 배출계수 90% 감소.",
    icon: Sun,
    color: "#f59e0b",
    factorChanges: {
      "ef-electricity-kr": 0.1,
      "ef-electricity-cn": 0.1,
    },
  },
  {
    id: "recycled-materials",
    name: "재생 원소재 확대",
    description:
      "원소재의 재활용 비율을 70%→100%로 확대. 원목 펄프 → 재생 펄프 전환.",
    icon: RotateCcw,
    color: "#22c55e",
    factorChanges: {
      "ef-virgin-pulp": 0.6, // 재생 펄프 수준으로 감소
      "ef-iron-ore": 0.5,
      "ef-pet-resin": 0.7,
    },
  },
  {
    id: "efficient-transport",
    name: "운송 최적화",
    description:
      "디젤 트럭 → 철도/해상 전환, 운송 거리 30% 단축.",
    icon: TrendingDown,
    color: "#3b82f6",
    factorChanges: {
      "ef-truck-diesel": 0.45, // 철도 수준
      "ef-ocean-freight": 0.8,
      "ef-air-freight": 0.3, // 해상으로 전환
    },
  },
  {
    id: "energy-efficiency",
    name: "에너지 효율 개선",
    description:
      "제조 공정 에너지 효율 30% 개선. 천연가스, 스팀 사용량 감소.",
    icon: Lightbulb,
    color: "#8b5cf6",
    factorChanges: {
      "ef-natural-gas": 0.7,
      "ef-steam": 0.7,
      "ef-diesel": 0.7,
    },
  },
];

export default function SimulationPage() {
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [activeScenarios, setActiveScenarios] = useState<string[]>([]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId)!,
    [selectedProductId]
  );

  // 기준 PCF
  const baselinePcf = useMemo(
    () => calculatePcf(selectedProduct, "cradle-to-gate"),
    [selectedProduct]
  );

  // 시나리오 적용 PCF 계산
  const simulatedPcf = useMemo(() => {
    if (activeScenarios.length === 0) return baselinePcf;

    // 활성 시나리오의 모든 배출계수 변경사항 병합
    const mergedChanges: Record<string, number> = {};
    activeScenarios.forEach((scenarioId) => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      if (scenario) {
        Object.entries(scenario.factorChanges).forEach(([efId, ratio]) => {
          // 여러 시나리오의 변경이 겹치면 곱함 (누적 감축)
          mergedChanges[efId] = (mergedChanges[efId] || 1) * ratio;
        });
      }
    });

    // line items에 변경 적용
    const simulatedLineItems = baselinePcf.lineItems.map((item) => {
      const efId = emissionFactors.find(
        (ef) => ef.nameKo === item.emissionFactorName
      )?.id;
      const ratio = efId && mergedChanges[efId] ? mergedChanges[efId] : 1;
      return {
        ...item,
        co2e: item.co2e * ratio,
        emissionFactorValue: item.emissionFactorValue * ratio,
      };
    });

    const totalCo2e = simulatedLineItems.reduce((sum, li) => sum + li.co2e, 0);

    const byLifecycleStage = LIFECYCLE_STAGE_ORDER.reduce(
      (acc, stage) => {
        acc[stage] = simulatedLineItems
          .filter((li) => li.lifecycleStage === stage)
          .reduce((sum, li) => sum + li.co2e, 0);
        return acc;
      },
      {} as Record<LifecycleStage, number>
    );

    return {
      ...baselinePcf,
      totalCo2e,
      byLifecycleStage,
      lineItems: simulatedLineItems,
    };
  }, [baselinePcf, activeScenarios]);

  const reduction = baselinePcf.totalCo2e - simulatedPcf.totalCo2e;
  const reductionPct =
    baselinePcf.totalCo2e > 0
      ? (reduction / baselinePcf.totalCo2e) * 100
      : 0;

  const toggleScenario = (id: string) => {
    setActiveScenarios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // 비교 바 차트 데이터
  const comparisonData = LIFECYCLE_STAGE_ORDER
    .filter((stage) => stage !== "use" && stage !== "end_of_life")
    .map((stage) => ({
      stage: LIFECYCLE_STAGE_LABELS[stage].ko,
      현재: Math.round(baselinePcf.byLifecycleStage[stage] * 100) / 100,
      시뮬레이션:
        Math.round(simulatedPcf.byLifecycleStage[stage] * 100) / 100,
    }));

  return (
    <div>
      <Header
        title="감축 시뮬레이션"
        description="배출 감축 시나리오를 적용하고 PCF 변화를 확인합니다"
      />

      <div className="p-8 space-y-6">
        {/* Product Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            대상 제품:
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setActiveScenarios([]);
            }}
            className="rounded-lg border bg-white px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Scenario Cards + Result */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Scenario Selection */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">
              감축 시나리오 선택 (복수 선택 가능)
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {scenarios.map((scenario) => {
                const isActive = activeScenarios.includes(scenario.id);
                const Icon = scenario.icon;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => toggleScenario(scenario.id)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      isActive
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="rounded-lg p-2"
                        style={{
                          backgroundColor: scenario.color + "20",
                        }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: scenario.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {scenario.name}
                          </h3>
                          {isActive && (
                            <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                              적용중
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {scenario.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-1">
            <Card
              className={`sticky top-8 ${
                activeScenarios.length > 0
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  시뮬레이션 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 현재 vs 시뮬레이션 */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">현재 PCF</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCo2eFull(baselinePcf.totalCo2e)}
                    </p>
                  </div>
                  <div className="border-t" />
                  <div>
                    <p className="text-xs text-gray-500">시뮬레이션 PCF</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCo2eFull(simulatedPcf.totalCo2e)}
                    </p>
                  </div>
                </div>

                {/* 감축량 */}
                {activeScenarios.length > 0 && (
                  <div className="rounded-lg bg-green-100 p-4 text-center">
                    <p className="text-xs text-green-700 font-medium">
                      예상 감축량
                    </p>
                    <p className="text-2xl font-bold text-green-800 mt-1">
                      -{reductionPct.toFixed(1)}%
                    </p>
                    <p className="text-sm text-green-600 mt-0.5">
                      {formatCo2eFull(reduction)} 감소
                    </p>
                  </div>
                )}

                {activeScenarios.length === 0 && (
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-400">
                      시나리오를 선택하면
                      <br />
                      감축 효과를 확인할 수 있습니다
                    </p>
                  </div>
                )}

                {/* 적용 시나리오 목록 */}
                {activeScenarios.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 mb-2">적용 시나리오</p>
                    <div className="space-y-1">
                      {activeScenarios.map((id) => {
                        const s = scenarios.find((sc) => sc.id === id);
                        return s ? (
                          <div
                            key={id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: s.color }}
                            />
                            <span className="text-gray-700">{s.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comparison Chart */}
        {activeScenarios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                전과정 단계별 비교 (현재 vs 시뮬레이션)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveBar
                  data={comparisonData}
                  keys={["현재", "시뮬레이션"]}
                  indexBy="stage"
                  groupMode="grouped"
                  margin={{ top: 20, right: 130, bottom: 50, left: 80 }}
                  padding={0.3}
                  colors={["#94a3b8", "#22c55e"]}
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
                      itemWidth: 100,
                      itemHeight: 20,
                      symbolSize: 12,
                    },
                  ]}
                  tooltip={({ id, value, indexValue }) => (
                    <div className="rounded-lg bg-white px-3 py-2 shadow-lg border text-sm">
                      <strong>{String(id)}</strong>
                      <br />
                      {String(indexValue)}: {Number(value).toLocaleString()}{" "}
                      kgCO₂e
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detail Table */}
        {activeScenarios.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">항목별 변화 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left text-gray-500">단계</th>
                      <th className="py-2 text-left text-gray-500">항목</th>
                      <th className="py-2 text-right text-gray-500">
                        현재 CO₂e
                      </th>
                      <th className="py-2 text-right text-gray-500">
                        시뮬레이션
                      </th>
                      <th className="py-2 text-right text-gray-500">변화</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baselinePcf.lineItems.map((baseline, i) => {
                      const simulated = simulatedPcf.lineItems[i];
                      const diff = simulated.co2e - baseline.co2e;
                      const diffPct =
                        baseline.co2e !== 0
                          ? (diff / baseline.co2e) * 100
                          : 0;
                      const hasChange = Math.abs(diff) > 0.01;
                      return (
                        <tr
                          key={baseline.activityDataId}
                          className={`border-b ${hasChange ? "bg-green-50/50" : ""}`}
                        >
                          <td className="py-2">
                            <Badge
                              variant="outline"
                              style={{
                                borderColor:
                                  LIFECYCLE_COLORS[
                                    baseline.lifecycleStage as LifecycleStage
                                  ],
                                color:
                                  LIFECYCLE_COLORS[
                                    baseline.lifecycleStage as LifecycleStage
                                  ],
                              }}
                              className="text-xs"
                            >
                              {
                                LIFECYCLE_STAGE_LABELS[
                                  baseline.lifecycleStage as LifecycleStage
                                ].ko
                              }
                            </Badge>
                          </td>
                          <td className="py-2">{baseline.descriptionKo}</td>
                          <td className="py-2 text-right text-gray-600">
                            {baseline.co2e.toFixed(2)}
                          </td>
                          <td className="py-2 text-right font-medium">
                            {simulated.co2e.toFixed(2)}
                          </td>
                          <td
                            className={`py-2 text-right font-medium ${
                              diff < -0.01
                                ? "text-green-600"
                                : diff > 0.01
                                  ? "text-red-600"
                                  : "text-gray-400"
                            }`}
                          >
                            {hasChange
                              ? `${diff > 0 ? "+" : ""}${diff.toFixed(2)} (${diffPct.toFixed(0)}%)`
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
