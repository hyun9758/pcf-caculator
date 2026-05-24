"use client";

import { useState, useMemo, useCallback } from "react";
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
import { products, emissionFactors } from "@/lib/data";
import { calculatePcf } from "@/lib/calculations";
import {
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_COLORS,
  formatCo2eFull,
} from "@/lib/constants";
import type { LifecycleStage, EmissionFactorCategory, ActivityData } from "@/lib/types";
import { Plus, FlaskConical, Zap, Truck, Trash2, X, Check } from "lucide-react";

export default function InputPage() {
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormTab, setAddFormTab] = useState<string>("material");

  // 로컬 활동 데이터 상태 (CRUD)
  const [localActivityData, setLocalActivityData] = useState<ActivityData[]>(
    () => {
      // 초기 데이터 로드
      const { activityData } = require("@/lib/data/activity-data");
      return [...activityData];
    }
  );

  // 새 항목 폼 상태
  const [newItem, setNewItem] = useState({
    emissionFactorId: "",
    quantity: "",
    description: "",
    descriptionKo: "",
    lifecycleStage: "raw_material" as LifecycleStage,
  });

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId)!,
    [selectedProductId]
  );

  const productActivityData = useMemo(
    () => localActivityData.filter((ad) => ad.productId === selectedProductId),
    [localActivityData, selectedProductId]
  );

  // PCF 계산 (로컬 데이터 기반)
  const pcfResult = useMemo(() => {
    return calculatePcf(selectedProduct, "cradle-to-gate");
  }, [selectedProduct]);

  const getFactorsByCategory = (category: EmissionFactorCategory) =>
    emissionFactors.filter((ef) => ef.category === category);

  const getActivitiesByStages = (stages: LifecycleStage[]) =>
    productActivityData.filter((ad) => stages.includes(ad.lifecycleStage));

  // CRUD 함수들
  const handleAdd = useCallback(() => {
    if (!newItem.emissionFactorId || !newItem.quantity) return;

    const ef = emissionFactors.find((f) => f.id === newItem.emissionFactorId);
    if (!ef) return;

    const newActivity: ActivityData = {
      id: `ad-new-${Date.now()}`,
      productId: selectedProductId,
      lifecycleStage: newItem.lifecycleStage,
      emissionFactorId: newItem.emissionFactorId,
      description: newItem.description || ef.name,
      descriptionKo: newItem.descriptionKo || ef.nameKo,
      quantity: parseFloat(newItem.quantity),
      unit: ef.unit,
    };

    setLocalActivityData((prev) => [...prev, newActivity]);
    setNewItem({
      emissionFactorId: "",
      quantity: "",
      description: "",
      descriptionKo: "",
      lifecycleStage: "raw_material",
    });
    setShowAddForm(false);
  }, [newItem, selectedProductId]);

  const handleDelete = useCallback((id: string) => {
    setLocalActivityData((prev) => prev.filter((ad) => ad.id !== id));
  }, []);

  // 탭별 stage 매핑
  const tabStageMap: Record<string, LifecycleStage[]> = {
    material: ["raw_material"],
    energy: ["manufacturing", "use"],
    transport: ["transportation"],
  };

  const tabEfCategories: Record<string, EmissionFactorCategory[]> = {
    material: ["material"],
    energy: ["energy", "fuel"],
    transport: ["transport"],
  };

  const tabDefaultStage: Record<string, LifecycleStage> = {
    material: "raw_material",
    energy: "manufacturing",
    transport: "transportation",
  };

  // 활동 데이터 테이블 렌더
  const renderActivityTable = (stages: LifecycleStage[]) => {
    const items = getActivitiesByStages(stages);
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>단계</TableHead>
            <TableHead>항목</TableHead>
            <TableHead className="text-right">수량</TableHead>
            <TableHead>단위</TableHead>
            <TableHead>배출계수</TableHead>
            <TableHead className="text-right">CO₂e</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((ad) => {
            const ef = emissionFactors.find(
              (f) => f.id === ad.emissionFactorId
            );
            const co2e = ef ? ad.quantity * ef.co2ePerUnit : 0;
            const isCustom = ad.id.startsWith("ad-new-");
            return (
              <TableRow
                key={ad.id}
                className={isCustom ? "bg-green-50" : ""}
              >
                <TableCell>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: LIFECYCLE_COLORS[ad.lifecycleStage],
                      color: LIFECYCLE_COLORS[ad.lifecycleStage],
                    }}
                    className="text-xs"
                  >
                    {LIFECYCLE_STAGE_LABELS[ad.lifecycleStage].ko}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {ad.descriptionKo}
                  {isCustom && (
                    <Badge className="ml-2 text-[10px] bg-green-100 text-green-700 border-0">
                      신규
                    </Badge>
                  )}
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
                <TableCell
                  className={`text-right text-sm font-medium ${
                    co2e < 0 ? "text-green-600" : ""
                  }`}
                >
                  {co2e.toFixed(2)}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                등록된 데이터가 없습니다. 항목을 추가해주세요.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  // 추가 폼
  const renderAddForm = (tab: string) => {
    if (!showAddForm || addFormTab !== tab) return null;

    const categories = tabEfCategories[tab] || ["material"];
    const availableFactors = categories.flatMap(getFactorsByCategory);

    return (
      <div className="mt-4 rounded-lg border-2 border-dashed border-green-300 bg-green-50/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-green-800">새 항목 추가</h4>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              배출계수 선택
            </label>
            <select
              value={newItem.emissionFactorId}
              onChange={(e) =>
                setNewItem((prev) => ({
                  ...prev,
                  emissionFactorId: e.target.value,
                }))
              }
              className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">선택하세요</option>
              {availableFactors.map((ef) => (
                <option key={ef.id} value={ef.id}>
                  {ef.nameKo} ({ef.co2ePerUnit} kgCO₂e/{ef.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              수량
            </label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, quantity: e.target.value }))
              }
              placeholder="예: 100"
              className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              설명 (한국어)
            </label>
            <input
              type="text"
              value={newItem.descriptionKo}
              onChange={(e) =>
                setNewItem((prev) => ({
                  ...prev,
                  descriptionKo: e.target.value,
                }))
              }
              placeholder="예: 추가 원소재 투입"
              className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              disabled={!newItem.emissionFactorId || !newItem.quantity}
              className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" /> 추가
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 총 CO2e 계산 (로컬 데이터 기반)
  const localTotalCo2e = useMemo(() => {
    return productActivityData.reduce((sum, ad) => {
      const ef = emissionFactors.find((f) => f.id === ad.emissionFactorId);
      return sum + (ef ? ad.quantity * ef.co2ePerUnit : 0);
    }, 0);
  }, [productActivityData]);

  const stageBreakdown = useMemo(() => {
    const stages: LifecycleStage[] = [
      "raw_material",
      "manufacturing",
      "transportation",
      "use",
      "end_of_life",
    ];
    return stages.reduce(
      (acc, stage) => {
        acc[stage] = productActivityData
          .filter((ad) => ad.lifecycleStage === stage)
          .reduce((sum, ad) => {
            const ef = emissionFactors.find(
              (f) => f.id === ad.emissionFactorId
            );
            return sum + (ef ? ad.quantity * ef.co2ePerUnit : 0);
          }, 0);
        return acc;
      },
      {} as Record<LifecycleStage, number>
    );
  }, [productActivityData]);

  return (
    <div>
      <Header
        title="데이터 입력"
        description="제품별 활동 데이터 추가·수정·삭제 및 배출계수 조회"
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
              <span className="text-xs text-gray-400">
                {productActivityData.length}개 항목
              </span>
            </div>

            <Tabs
              defaultValue="material"
              onValueChange={(v) => setAddFormTab(v)}
            >
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
                    <button
                      onClick={() => {
                        setShowAddForm(true);
                        setAddFormTab("material");
                        setNewItem((prev) => ({
                          ...prev,
                          lifecycleStage: "raw_material",
                        }));
                      }}
                      className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <Plus className="h-3 w-3" /> 항목 추가
                    </button>
                  </CardHeader>
                  <CardContent>
                    {renderActivityTable(["raw_material"])}
                    {renderAddForm("material")}
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
                    <button
                      onClick={() => {
                        setShowAddForm(true);
                        setAddFormTab("energy");
                        setNewItem((prev) => ({
                          ...prev,
                          lifecycleStage: "manufacturing",
                        }));
                      }}
                      className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <Plus className="h-3 w-3" /> 항목 추가
                    </button>
                  </CardHeader>
                  <CardContent>
                    {renderActivityTable(["manufacturing", "use"])}
                    {renderAddForm("energy")}

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
                    <button
                      onClick={() => {
                        setShowAddForm(true);
                        setAddFormTab("transport");
                        setNewItem((prev) => ({
                          ...prev,
                          lifecycleStage: "transportation",
                        }));
                      }}
                      className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      <Plus className="h-3 w-3" /> 항목 추가
                    </button>
                  </CardHeader>
                  <CardContent>
                    {renderActivityTable(["transportation"])}
                    {renderAddForm("transport")}

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
                    {formatCo2eFull(localTotalCo2e)}
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
                      "use",
                      "end_of_life",
                    ] as LifecycleStage[]
                  ).map((stage) => {
                    const value = stageBreakdown[stage] || 0;
                    const pct =
                      localTotalCo2e > 0
                        ? (Math.abs(value) / localTotalCo2e) * 100
                        : 0;
                    if (value === 0) return null;
                    return (
                      <div key={stage}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">
                            {LIFECYCLE_STAGE_LABELS[stage].ko}
                          </span>
                          <span
                            className={`font-medium ${value < 0 ? "text-green-600" : ""}`}
                          >
                            {value.toFixed(1)} kgCO₂e
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(Math.max(pct, 1), 100)}%`,
                              backgroundColor:
                                value < 0
                                  ? "#22c55e"
                                  : LIFECYCLE_COLORS[stage],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-3 text-xs text-gray-400">
                  항목 수: {productActivityData.length}개
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
