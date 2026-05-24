"use client";

import { ResponsiveLine } from "@nivo/line";
import { SCOPE_COLORS, SCOPE_LABELS } from "@/lib/constants";
import type { TrendDataPoint, GhgScope } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendChartProps {
  data: TrendDataPoint[];
  showByScope?: boolean;
}

export function TrendChart({ data, showByScope = true }: TrendChartProps) {
  const scopes: GhgScope[] = ["scope1", "scope2", "scope3"];

  const lineData = showByScope
    ? scopes.map((scope) => ({
        id: SCOPE_LABELS[scope].ko,
        color: SCOPE_COLORS[scope],
        data: data.map((point) => ({
          x: point.period,
          y: Math.round(point.byScope[scope]),
        })),
      }))
    : [
        {
          id: "총 배출량",
          color: "#16a34a",
          data: data.map((point) => ({
            x: point.period,
            y: Math.round(point.totalCo2e),
          })),
        },
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">분기별 배출량 추세</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 120, bottom: 50, left: 70 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
            }}
            colors={{ datum: "color" }}
            axisBottom={{
              tickRotation: -30,
              legend: "분기",
              legendOffset: 40,
              legendPosition: "middle",
            }}
            axisLeft={{
              legend: "kgCO₂e",
              legendOffset: -55,
              legendPosition: "middle",
            }}
            pointSize={8}
            pointColor={{ from: "color" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            enableArea={!showByScope}
            areaOpacity={0.1}
            useMesh={true}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                translateX: 110,
                itemWidth: 100,
                itemHeight: 20,
                symbolSize: 12,
                symbolShape: "circle",
              },
            ]}
            tooltip={({ point }) => (
              <div className="rounded-lg bg-white px-3 py-2 shadow-lg border text-sm">
                <strong>{point.seriesId}</strong>
                <br />
                {String(point.data.x)}: {Number(point.data.y).toLocaleString()}{" "}
                kgCO₂e
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
