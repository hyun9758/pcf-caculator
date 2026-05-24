"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: number; // 변화율 (%)
  icon: LucideIcon;
  iconColor?: string;
}

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-gray-400",
}: KpiCardProps) {
  const TrendIcon =
    change === undefined || change === 0
      ? Minus
      : change > 0
        ? TrendingUp
        : TrendingDown;

  const trendColor =
    change === undefined || change === 0
      ? "text-gray-400"
      : change < 0
        ? "text-green-600" // 탄소 감소 = 긍정
        : "text-red-600"; // 탄소 증가 = 부정

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={cn("mt-1 flex items-center gap-1 text-sm", trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span>{Math.abs(change).toFixed(1)}% 전분기 대비</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
