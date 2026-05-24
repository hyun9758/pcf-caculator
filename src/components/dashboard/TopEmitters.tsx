"use client";

import { ResponsiveBar } from "@nivo/bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { ProductCategory } from "@/lib/types";

interface TopEmitterData {
  productName: string;
  category: string;
  totalCo2e: number;
}

interface TopEmittersProps {
  data: TopEmitterData[];
}

export function TopEmitters({ data }: TopEmittersProps) {
  const barData = data
    .sort((a, b) => b.totalCo2e - a.totalCo2e)
    .map((item) => ({
      product: item.productName.length > 15
        ? item.productName.substring(0, 15) + "…"
        : item.productName,
      CO2e: Math.round(item.totalCo2e * 100) / 100,
      color: CATEGORY_COLORS[item.category as ProductCategory] || "#6b7280",
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">제품별 배출량 순위</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveBar
            data={barData}
            keys={["CO2e"]}
            indexBy="product"
            layout="horizontal"
            margin={{ top: 10, right: 60, bottom: 30, left: 140 }}
            padding={0.3}
            colors={{ datum: "data.color" }}
            borderRadius={4}
            axisBottom={{
              legend: "kgCO₂e",
              legendPosition: "middle",
              legendOffset: 24,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
            }}
            labelSkipWidth={40}
            labelTextColor="#ffffff"
            tooltip={({ data: d }) => (
              <div className="rounded-lg bg-white px-3 py-2 shadow-lg border text-sm">
                <strong>{d.product}</strong>
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
