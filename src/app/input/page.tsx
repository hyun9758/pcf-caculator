"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { products, emissionFactors, getActivityDataByProduct } from "@/lib/data";
import { calculatePcf } from "@/lib/calculations";
import {
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_COLORS,
  formatCo2eFull,
} from "@/lib/constants";
import type { LifecycleStage, EmissionFactorCategory } from "@/lib/types";
import { Plus, FlaskConical, Zap, Truck } from "lucide-react";

export default function InputPage() {
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId)!,
    [selectedProductId]
  );

  const activityData = useMemo(
    () => getActivityDataByProduct(selectedProductId),
    [selectedProductId]
  );

  const pcfResult = useMemo(
    () => calculatePcf(selectedProduct, "cradle-to-gate"),
    [selectedProduct]
  );

  const getFactorsByCategory = (category: EmissionFactorCategory) =>
    emissionFactors.filter((ef) => ef.category === category);

  const getActivitiesByStage = (stages: LifecycleStage[]) =>
    activityData.filter((ad) => stages.includes(ad.lifecycleStage));

  return (
    <div>
      <Header
        title="데이터 입력"
        description="제품별 활동 데이터 관리 및 배출계수 조회"
      />

      <div className="p-8 space-y-6">
        {/* Product Selector + Live Preview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-gray-700">
                제품 선택:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="rounded-lg border bg-white px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <Tabs defaultValue="material">
              <TabsList className="mb-4">
                <TabsTrigger value="material" className="gap-2">
                  <FlaskConical className="h-4 w-4" />
                  원소재
                </TabsTrigger>
                <TabsTrigger value="energy" className="gap-2">
                  <Zap className="h-4 w-4" />
                  에너지
                </TabsTrigger>
                <TabsTrigger value="transport" className="gap-2">
                  <Truck className="h-4 w-4" />
                  운송
                </TabsTrigger>
              </TabsList>

              {/* 원소재 탭 */}
              <TabsContent value="material">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      원소재 투입 데이터
                    </CardTitle>
                    <button className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                      <Plus className="h-3 w-3" /> 항목 추가
                    </button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>단계</TableHead>
                          <TableHead>항목</TableHead>
                          <TableHead className="text-right">수량</TableHead>
                          <TableHead>단위</TableHead>
                          <TableHead>배출계수</TableHead>
                          <TableHead className="text-right">CO₂e</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getActivitiesByStage(["raw_material"]).map((ad) => {
                          const ef = emissionFactors.find(
                            (f) => f.id === ad.emissionFactorId
                          );
                          const co2e = ef
                            ? ad.quantity * ef.co2ePerUnit
                            : 0;
                          return (
                            <TableRow key={ad.id}>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  style={{
                                    borderColor:
                                      LIFECYCLE_COLORS[ad.lifecycleStage],
                                    color:
                                      LIFECYCLE_COLORS[ad.lifecycleStage],
                                  }}
                                  className="text-xs"
                                >
                                  {
                                    LIFECYCLE_STAGE_LABELS[ad.lifecycleStage]
                                      .ko
                                  }
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {ad.descriptionKo}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {ad.quantity.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {ad.unit}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {ef?.nameKo || "-"}
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium">
                                {co2e.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 에너지 탭 */}
              <TabsContent value="energy">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      에너지 소비 데이터
                    </CardTitle>
                    <button className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                      <Plus className="h-3 w-3" /> 항목 추가
                    </button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>단계</TableHead>
                          <TableHead>항목</TableHead>
                          <TableHead className="text-right">수량</TableHead>
                          <TableHead>단위</TableHead>
                          <TableHead>배출계수</TableHead>
                          <TableHead className="text-right">CO₂e</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getActivitiesByStage(["manufacturing", "use"]).map(
                          (ad) => {
                            const ef = emissionFactors.find(
                              (f) => f.id === ad.emissionFactorId
                            );
                            const co2e = ef
                              ? ad.quantity * ef.co2ePerUnit
                              : 0;
                            return (
                              <TableRow key={ad.id}>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    style={{
                                      borderColor:
                                        LIFECYCLE_COLORS[ad.lifecycleStage],
                                      color:
                                        LIFECYCLE_COLORS[ad.lifecycleStage],
                                    }}
                                    className="text-xs"
                                  >
                                    {
                                      LIFECYCLE_STAGE_LABELS[
                                        ad.lifecycleStage
                                      ].ko
                                    }
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {ad.descriptionKo}
                                </TableCell>
                                <TableCell className="text-right text-sm">
                                  {ad.quantity.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {ad.unit}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                  {ef?.nameKo || "-"}
                                </TableCell>
                                <TableCell className="text-right text-sm font-medium">
                                  {co2e.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>

                    {/* 배출계수 참조 */}
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        사용 가능한 배출계수
                      </h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {[
                          ...getFactorsByCategory("energy"),
                          ...getFactorsByCategory("fuel"),
                        ].map((ef) => (
                          <div
                            key={ef.id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                          >
                            <div>
                              <span className="font-medium">{ef.nameKo}</span>
                              <span className="ml-2 text-xs text-gray-400">
                                ({ef.source})
                              </span>
                            </div>
                            <span className="text-xs font-mono text-gray-600">
                              {ef.co2ePerUnit} kgCO₂e/{ef.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 운송 탭 */}
              <TabsContent value="transport">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">운송 데이터</CardTitle>
                    <button className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                      <Plus className="h-3 w-3" /> 항목 추가
                    </button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>항목</TableHead>
                          <TableHead className="text-right">
                            거리·중량
                          </TableHead>
                          <TableHead>단위</TableHead>
                          <TableHead>운송 모드</TableHead>
                          <TableHead className="text-right">CO₂e</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getActivitiesByStage(["transportation"]).map((ad) => {
                          const ef = emissionFactors.find(
                            (f) => f.id === ad.emissionFactorId
                          );
                          const co2e = ef
                            ? ad.quantity * ef.co2ePerUnit
                            : 0;
                          return (
                            <TableRow key={ad.id}>
                              <TableCell className="text-sm">
                                {ad.descriptionKo}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {ad.quantity.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {ad.unit}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {ef?.nameKo || "-"}
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium">
                                {co2e.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {/* 운송 배출계수 참조 */}
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        운송 배출계수
                      </h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {getFactorsByCategory("transport").map((ef) => (
                          <div
                            key={ef.id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                          >
                            <div>
                              <span className="font-medium">{ef.nameKo}</span>
                              <span className="ml-2 text-xs text-gray-400">
                                ({ef.source})
                              </span>
                            </div>
                            <span className="text-xs font-mono text-gray-600">
                              {ef.co2ePerUnit} kgCO₂e/{ef.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Live PCF Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="text-base">실시간 PCF 프리뷰</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCo2eFull(pcfResult.totalCo2e)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    / {selectedProduct.functionalUnit}
                  </p>
                </div>

                <div className="space-y-2">
                  {(
                    [
                      "raw_material",
                      "manufacturing",
                      "transportation",
                    ] as LifecycleStage[]
                  ).map((stage) => {
                    const value = pcfResult.byLifecycleStage[stage];
                    const pct =
                      pcfResult.totalCo2e > 0
                        ? (value / pcfResult.totalCo2e) * 100
                        : 0;
                    return (
                      <div key={stage}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">
                            {LIFECYCLE_STAGE_LABELS[stage].ko}
                          </span>
                          <span className="font-medium">
                            {value.toFixed(1)} kgCO₂e
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.max(pct, 1)}%`,
                              backgroundColor: LIFECYCLE_COLORS[stage],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-3 text-xs text-gray-400">
                  경계: Cradle-to-Gate
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
