"use client";

import { ResponsivePie } from "@nivo/pie";
import { SCOPE_LABELS, SCOPE_COLORS } from "@/lib/constants";
import type { GhgScope } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScopePieChartProps {
  data: Record<GhgScope, number>;
  compact?: boolean;
}

export function ScopePieChart({ data, compact = false }: ScopePieChartProps) {
  const scopes: GhgScope[] = ["scope1", "scope2", "scope3"];
  const total = Object.values(data).reduce((sum, v) => sum + v, 0);

  const pieData = scopes
    .filter((scope) => data[scope] !== 0)
    .map((scope) => ({
      id: SCOPE_LABELS[scope].ko,
      label: SCOPE_LABELS[scope].ko,
      value: Math.round(Math.abs(data[scope]) * 100) / 100,
      color: SCOPE_COLORS[scope],
    }));

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="text-base">Scope별 배출 비율</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={compact ? "h-[200px]" : "h-[280px]"}>
          <ResponsivePie
            data={pieData}
            margin={
              compact
                ? { top: 10, right: 60, bottom: 10, left: 60 }
                : { top: 20, right: 80, bottom: 20, left: 80 }
            }
            innerRadius={0.5}
            padAngle={2}
            cornerRadius={4}
            colors={{ datum: "data.color" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#374151"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#ffffff"
            arcLabel={(d) =>
              `${((d.value / total) * 100).toFixed(0)}%`
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
