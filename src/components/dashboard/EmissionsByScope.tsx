"use client";

import { ResponsivePie } from "@nivo/pie";
import { SCOPE_LABELS, SCOPE_COLORS } from "@/lib/constants";
import type { GhgScope } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmissionsByScopeProps {
  data: Record<GhgScope, number>;
}

export function EmissionsByScope({ data }: EmissionsByScopeProps) {
  const scopes: GhgScope[] = ["scope1", "scope2", "scope3"];
  const total = Object.values(data).reduce((sum, v) => sum + v, 0);

  const pieData = scopes.map((scope) => ({
    id: SCOPE_LABELS[scope].ko,
    label: SCOPE_LABELS[scope].ko,
    value: Math.round(data[scope] * 100) / 100,
    color: SCOPE_COLORS[scope],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">GHG Scope별 배출량</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsivePie
            data={pieData}
            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
            innerRadius={0.55}
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
            tooltip={({ datum }) => (
              <div className="rounded-lg bg-white px-3 py-2 shadow-lg border text-sm">
                <strong>{datum.label}</strong>
                <br />
                {datum.value.toFixed(1)} kgCO₂e (
                {((datum.value / total) * 100).toFixed(1)}%)
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
