"use client";

import { ResponsiveBar } from "@nivo/bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LIFECYCLE_STAGE_LABELS,
  LIFECYCLE_STAGE_ORDER,
  LIFECYCLE_COLORS,
} from "@/lib/constants";
import type { LifecycleStage } from "@/lib/types";

interface LifecycleBreakdownProps {
  data: Record<LifecycleStage, number>;
}

export function LifecycleBreakdown({ data }: LifecycleBreakdownProps) {
  const barData = LIFECYCLE_STAGE_ORDER.map((stage) => ({
    stage: LIFECYCLE_STAGE_LABELS[stage].ko,
    CO2e: Math.round(data[stage] * 100) / 100,
    color: LIFECYCLE_COLORS[stage],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">전과정 단계별 배출량</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveBar
            data={barData}
            keys={["CO2e"]}
            indexBy="stage"
            margin={{ top: 10, right: 30, bottom: 50, left: 100 }}
            padding={0.3}
            layout="horizontal"
            colors={{ datum: "data.color" }}
            borderRadius={4}
            axisBottom={{
              legend: "kgCO₂e",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
            }}
            labelSkipWidth={40}
            labelTextColor="#ffffff"
            tooltip={({ data: d }) => (
              <div className="rounded-lg bg-white px-3 py-2 shadow-lg border text-sm">
                <strong>{d.stage}</strong>
                <br />
                {Number(d.CO2e).toLocaleString()} kgCO₂e
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
