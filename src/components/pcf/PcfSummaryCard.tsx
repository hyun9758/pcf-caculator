"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCo2eFull } from "@/lib/constants";
import type { PcfResult } from "@/lib/types";
import { Leaf, FlaskConical, MapPin } from "lucide-react";

interface PcfSummaryCardProps {
  result: PcfResult;
}

export function PcfSummaryCard({ result }: PcfSummaryCardProps) {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">PCF 요약</h3>
          <Badge
            variant="outline"
            className="border-green-200 text-green-700 bg-green-50"
          >
            {result.boundary === "cradle-to-gate"
              ? "Cradle-to-Gate"
              : "Cradle-to-Grave"}
          </Badge>
        </div>

        <div className="text-center py-4">
          <p className="text-4xl font-bold text-gray-900">
            {formatCo2eFull(result.totalCo2e)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            / {result.functionalUnit}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <Leaf className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <p className="text-xs text-gray-500">방법론</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">
              GHG Protocol
            </p>
          </div>
          <div className="text-center">
            <FlaskConical className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-xs text-gray-500">항목 수</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">
              {result.lineItems.length}개
            </p>
          </div>
          <div className="text-center">
            <MapPin className="h-4 w-4 mx-auto text-orange-500 mb-1" />
            <p className="text-xs text-gray-500">경계</p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">
              {result.boundary === "cradle-to-gate" ? "게이트" : "무덤"}까지
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
