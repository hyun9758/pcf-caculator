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
import { activityData as initialActivityData } from "@/lib/data/activity-data";
import { matchEmissionFactor } from "@/lib/data/emission-factors";
import {
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_COLORS,
  formatCo2eFull,
} from "@/lib/constants";
import { ACTIVITY_TYPE_TO_STAGE } from "@/lib/types";
import type { LifecycleStage, ActivityData, ActivityType } from "@/lib/types";
import { Plus, Trash2, X, Check, Zap, FlaskConical, Truck, AlertCircle } from "lucide-react";

interface FormErrors {
  date?: string;
  activityType?: string;
  description?: string;
  quantity?: string;
}

export default function InputPage() {
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("전기");
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  const [localActivityData, setLocalActivityData] = useState<ActivityData[]>(
    () => [...initialActivityData]
  );

  const [newItem, setNewItem] = useState({
    date: "",
    activityType: "전기" as ActivityType,
    description: "",
    quantity: "",
  });

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId)!,
    [selectedProductId]
  );

  const productActivityData = useMemo(
    () => localActivityData.filter((ad) => ad.productId === selectedProductId),
    [localActivityData, selectedProductId]
  );

  const getActivitiesByType = (type: ActivityType) =>
    productActivityData.filter((ad) => ad.activityType === type);

  // 유효성 검사
  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};

    if (!newItem.date) {
      errs.date = "일자를 입력해주세요";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(newItem.date)) {
      errs.date = "YYYY-MM-DD 형식으로 입력해주세요";
    }

    if (!newItem.quantity) {
      errs.quantity = "수량을 입력해주세요";
    } else if (isNaN(parseFloat(newItem.quantity)) || parseFloat(newItem.quantity) <= 0) {
      errs.quantity = "0보다 큰 숫자를 입력해주세요";
    }

    if (newItem.activityType === "원소재" && !newItem.description) {
      errs.description = "원소재 종류를 선택해주세요";
    }

    return errs;
  }, [newItem]);

  // 추가
  const handleAdd = useCallback(() => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const description = newItem.activityType === "전기"
      ? "한국전력"
      : newItem.activityType === "운송"
        ? "트럭"
        : newItem.description || "플라스틱 1";

    const ef = matchEmissionFactor(newItem.activityType, description);
    if (!ef) return;

    const lifecycleStage = ACTIVITY_TYPE_TO_STAGE[newItem.activityType];

    const newActivity: ActivityData = {
      id: `ad-new-${Date.now()}`,
      productId: selectedProductId,
      date: newItem.date,
      activityType: newItem.activityType,
      lifecycleStage,
      emissionFactorId: ef.id,
      description: ef.name,
      descriptionKo: description,
      quantity: parseFloat(newItem.quantity),
      unit: ef.unit,
    };

    setLocalActivityData((prev) => [...prev, newActivity]);
    setNewItem({ date: "", activityType: newItem.activityType, description: "", quantity: "" });
    setErrors({});
    setShowAddForm(false);
    setSuccessMessage("항목이 추가되었습니다");
    setTimeout(() => setSuccessMessage(""), 3000);
  }, [newItem, selectedProductId, validate]);

  // 삭제
  const handleDelete = useCallback((id: string) => {
    setLocalActivityData((prev) => prev.filter((ad) => ad.id !== id));
  }, []);

  // CO2e 계산
  const totalCo2eByType = useMemo(() => {
    const result: Record<string, number> = { 전기: 0, 원소재: 0, 운송: 0 };
    productActivityData.forEach((ad) => {
      const ef = emissionFactors.find((f) => f.id === ad.emissionFactorId);
      if (ef) result[ad.activityType] += ad.quantity * ef.co2ePerUnit;
    });
    return result;
  }, [productActivityData]);

  const totalCo2e = Object.values(totalCo2eByType).reduce((s, v) => s + v, 0);

  // 활동 데이터 테이블
  const renderTable = (type: ActivityType) => {
    const items = getActivitiesByType(type);
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>일자</TableHead>
            <TableHead>설명</TableHead>
            <TableHead className="text-right">수량</TableHead>
            <TableHead>단위</TableHead>
            <TableHead>배출계수</TableHead>
            <TableHead className="text-right">CO₂e (kg)</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((ad) => {
              const ef = emissionFactors.find((f) => f.id === ad.emissionFactorId);
              const co2e = ef ? ad.quantity * ef.co2ePerUnit : 0;
              const isNew = ad.id.startsWith("ad-new-");
              return (
                <TableRow key={ad.id} className={isNew ? "bg-green-50" : ""}>
                  <TableCell className="text-sm font-mono">{ad.date}</TableCell>
                  <TableCell className="text-sm">
                    {ad.descriptionKo}
                    {isNew && (
                      <Badge className="ml-2 text-[10px] bg-green-100 text-green-700 border-0">신규</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm">{ad.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-gray-500">{ad.unit}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {ef ? `${ef.co2ePerUnit} kgCO₂e/${ef.unit}` : "-"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">{co2e.toFixed(2)}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
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
                등록된 데이터가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  // 추가 폼
  const renderAddForm = () => {
    if (!showAddForm) return null;

    return (
      <div className="mt-4 rounded-lg border-2 border-dashed border-green-300 bg-green-50/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-green-800">새 항목 추가</h4>
          <button onClick={() => { setShowAddForm(false); setErrors({}); }} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">일자 *</label>
            <input
              type="date"
              value={newItem.date}
              onChange={(e) => setNewItem((p) => ({ ...p, date: e.target.value }))}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                errors.date ? "border-red-400 focus:ring-red-500" : "bg-white focus:border-green-500 focus:ring-green-500"
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.date}
              </p>
            )}
          </div>

          {activeTab === "원소재" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">원소재 종류 *</label>
              <select
                value={newItem.description}
                onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  errors.description ? "border-red-400 focus:ring-red-500" : "bg-white focus:border-green-500 focus:ring-green-500"
                }`}
              >
                <option value="">선택하세요</option>
                <option value="플라스틱 1">플라스틱 1 (2.3 kgCO₂e/kg)</option>
                <option value="플라스틱 2">플라스틱 2 (3.2 kgCO₂e/kg)</option>
              </select>
              {errors.description && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />{errors.description}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              수량 * ({activeTab === "전기" ? "kWh" : activeTab === "원소재" ? "kg" : "ton-km"})
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={newItem.quantity}
              onChange={(e) => setNewItem((p) => ({ ...p, quantity: e.target.value }))}
              placeholder="예: 100"
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                errors.quantity ? "border-red-400 focus:ring-red-500" : "bg-white focus:border-green-500 focus:ring-green-500"
              }`}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors.quantity}
              </p>
            )}
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Check className="h-4 w-4" /> 추가
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Header
        title="데이터 입력"
        description="컴퓨터 화면 (CT-045) — 활동 데이터 관리"
      />

      <div className="p-8 space-y-6">
        {/* Success message */}
        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            ✓ {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Tabs defaultValue="전기" onValueChange={(v) => { setActiveTab(v); setShowAddForm(false); setErrors({}); }}>
              <TabsList className="mb-4">
                <TabsTrigger value="전기" className="gap-2">
                  <Zap className="h-4 w-4" />
                  전기 ({getActivitiesByType("전기").length})
                </TabsTrigger>
                <TabsTrigger value="원소재" className="gap-2">
                  <FlaskConical className="h-4 w-4" />
                  원소재 ({getActivitiesByType("원소재").length})
                </TabsTrigger>
                <TabsTrigger value="운송" className="gap-2">
                  <Truck className="h-4 w-4" />
                  운송 ({getActivitiesByType("운송").length})
                </TabsTrigger>
              </TabsList>

              {(["전기", "원소재", "운송"] as ActivityType[]).map((type) => (
                <TabsContent key={type} value={type}>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">
                        {type} 데이터
                        <span className="ml-2 text-sm font-normal text-gray-400">
                          배출계수: {
                            type === "전기" ? "0.456 kgCO₂e/kWh" :
                            type === "원소재" ? "플라스틱1: 2.3 / 플라스틱2: 3.2 kgCO₂e/kg" :
                            "3.5 kgCO₂e/ton-km"
                          }
                        </span>
                      </CardTitle>
                      <button
                        onClick={() => {
                          setShowAddForm(true);
                          setNewItem((p) => ({ ...p, activityType: type, description: "" }));
                          setErrors({});
                        }}
                        className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                      >
                        <Plus className="h-3 w-3" /> 항목 추가
                      </button>
                    </CardHeader>
                    <CardContent>
                      {renderTable(type)}
                      {activeTab === type && renderAddForm()}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="text-base">실시간 PCF 프리뷰</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCo2eFull(totalCo2e)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    / {selectedProduct.functionalUnit}
                  </p>
                </div>

                <div className="space-y-3">
                  {(["전기", "원소재", "운송"] as const).map((type) => {
                    const value = totalCo2eByType[type] || 0;
                    const pct = totalCo2e > 0 ? (value / totalCo2e) * 100 : 0;
                    const colors = { 전기: "#3b82f6", 원소재: "#8b5cf6", 운송: "#f97316" };
                    const stages = { 전기: "manufacturing", 원소재: "raw_material", 운송: "transportation" } as const;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">
                            {type} ({LIFECYCLE_STAGE_LABELS[stages[type]].ko})
                          </span>
                          <span className="font-medium">{value.toFixed(1)} kgCO₂e</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.min(Math.max(pct, 1), 100)}%`,
                              backgroundColor: colors[type],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-3 space-y-1 text-xs text-gray-400">
                  <div>총 항목: {productActivityData.length}건</div>
                  <div>기간: 2025-01 ~ 2025-08</div>
                  <div>경계: Cradle-to-Gate</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
