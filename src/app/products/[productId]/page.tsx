"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout";
import { PcfSummaryCard, LifecycleSankey, ScopePieChart, AiAnalysis } from "@/components/pcf";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProduct } from "@/lib/data";
import { calculatePcf } from "@/lib/calculations";
import {
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_COLORS,
  SCOPE_COLORS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "@/lib/constants";
import type { PcfBoundary, ProductCategory, GhgScope, LifecycleStage } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const [boundary, setBoundary] = useState<PcfBoundary>("cradle-to-gate");

  const product = useMemo(() => getProduct(productId), [productId]);
  const pcfResult = useMemo(() => {
    if (!product) return null;
    return calculatePcf(product, boundary);
  }, [product, boundary]);

  if (!product || !pcfResult) {
    return (
      <div>
        <Header title="제품을 찾을 수 없습니다" />
        <div className="p-8">
          <Link
            href="/products"
            className="text-green-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> 제품 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const scopeLabels: Record<GhgScope, string> = {
    scope1: "Scope 1",
    scope2: "Scope 2",
    scope3: "Scope 3",
  };

  return (
    <div>
      <Header title={product.name} description={product.description} />

      <div className="p-8 space-y-6">
        {/* Breadcrumb + Boundary Toggle */}
        <div className="flex items-center justify-between">
          <Link
            href="/products"
            className="text-sm text-green-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> 제품 목록
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">시스템 경계:</span>
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setBoundary("cradle-to-gate")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  boundary === "cradle-to-gate"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Cradle-to-Gate
              </button>
              <button
                onClick={() => setBoundary("cradle-to-grave")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  boundary === "cradle-to-grave"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Cradle-to-Grave
              </button>
            </div>
          </div>
        </div>

        {/* Product Info + PCF Summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <PcfSummaryCard result={pcfResult} />
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">제품 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">카테고리</dt>
                    <dd className="mt-1">
                      <Badge
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[product.category as ProductCategory] + "20",
                          color:
                            CATEGORY_COLORS[product.category as ProductCategory],
                        }}
                      >
                        {CATEGORY_LABELS[product.category as ProductCategory]?.ko}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">기능 단위</dt>
                    <dd className="mt-1 font-medium">{product.functionalUnit}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">중량</dt>
                    <dd className="mt-1 font-medium">{product.weight} kg</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">방법론</dt>
                    <dd className="mt-1 font-medium">{pcfResult.methodology}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sankey Diagram */}
        <LifecycleSankey result={pcfResult} />

        {/* Scope Pie + Line Items */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ScopePieChart data={pcfResult.byScope} />
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  활동 데이터 상세 ({pcfResult.lineItems.length}개 항목)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>단계</TableHead>
                        <TableHead>항목</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead className="text-right">수량</TableHead>
                        <TableHead className="text-right">배출계수</TableHead>
                        <TableHead className="text-right">CO₂e</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pcfResult.lineItems.map((item) => (
                        <TableRow key={item.activityDataId}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{
                                borderColor:
                                  LIFECYCLE_COLORS[item.lifecycleStage as LifecycleStage],
                                color:
                                  LIFECYCLE_COLORS[item.lifecycleStage as LifecycleStage],
                              }}
                              className="text-xs"
                            >
                              {
                                LIFECYCLE_STAGE_LABELS[
                                  item.lifecycleStage as LifecycleStage
                                ]?.ko
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.descriptionKo}
                          </TableCell>
                          <TableCell>
                            <span
                              className="inline-block h-2 w-2 rounded-full mr-1"
                              style={{
                                backgroundColor:
                                  SCOPE_COLORS[item.scope as GhgScope],
                              }}
                            />
                            <span className="text-xs">
                              {scopeLabels[item.scope as GhgScope]}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {item.quantity.toLocaleString()} {item.unit}
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray-500">
                            {item.emissionFactorValue} kgCO₂e/{item.unit}
                          </TableCell>
                          <TableCell
                            className={`text-right text-sm font-medium ${
                              item.co2e < 0
                                ? "text-green-600"
                                : "text-gray-900"
                            }`}
                          >
                            {item.co2e.toFixed(2)} kgCO₂e
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Analysis */}
        <AiAnalysis pcfResult={pcfResult} />
      </div>
    </div>
  );
}
