"use client";

import { ResponsiveSankey } from "@nivo/sankey";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LIFECYCLE_STAGE_LABELS, LIFECYCLE_COLORS } from "@/lib/constants";
import type { PcfResult } from "@/lib/types";

interface LifecycleSankeyProps {
  result: PcfResult;
}

export function LifecycleSankey({ result }: LifecycleSankeyProps) {
  // Sankey 노드: 입력 소스 → 전과정 단계 → 총배출
  const stagesWithEmissions = result.lineItems.reduce(
    (acc, item) => {
      const key = `${item.lifecycleStage}|${item.emissionFactorName}`;
      if (!acc[key]) {
        acc[key] = {
          stage: item.lifecycleStage,
          source: item.emissionFactorName,
          co2e: 0,
        };
      }
      acc[key].co2e += item.co2e;
      return acc;
    },
    {} as Record<string, { stage: string; source: string; co2e: number }>
  );

  const entries = Object.values(stagesWithEmissions).filter(
    (e) => e.co2e > 0
  );

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">전과정 배출 흐름</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">데이터가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  // 고유 노드 생성
  const nodeIds = new Set<string>();
  const links: { source: string; target: string; value: number }[] = [];

  entries.forEach(({ stage, source, co2e }) => {
    const sourceId = `src_${source}`;
    const stageId = `stage_${stage}`;

    nodeIds.add(sourceId);
    nodeIds.add(stageId);

    links.push({
      source: sourceId,
      target: stageId,
      value: Math.round(co2e * 100) / 100,
    });
  });

  // 전과정 단계 → 총배출
  const totalNodeId = "total";
  nodeIds.add(totalNodeId);

  const stageNodes = new Set<string>();
  entries.forEach(({ stage }) => stageNodes.add(stage));

  stageNodes.forEach((stage) => {
    const stageTotal = entries
      .filter((e) => e.stage === stage)
      .reduce((sum, e) => sum + e.co2e, 0);
    if (stageTotal > 0) {
      links.push({
        source: `stage_${stage}`,
        target: totalNodeId,
        value: Math.round(stageTotal * 100) / 100,
      });
    }
  });

  const nodes = Array.from(nodeIds).map((id) => {
    if (id === totalNodeId) {
      return { id, label: `총 ${result.totalCo2e.toFixed(0)} kgCO₂e` };
    }
    if (id.startsWith("stage_")) {
      const stage = id.replace("stage_", "") as keyof typeof LIFECYCLE_STAGE_LABELS;
      return {
        id,
        label: LIFECYCLE_STAGE_LABELS[stage]?.ko || stage,
        color: LIFECYCLE_COLORS[stage] || "#6b7280",
      };
    }
    // source node
    return { id, label: id.replace("src_", "") };
  });

  const data = { nodes, links };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">전과정 배출 흐름 (Sankey)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveSankey
            data={data}
            margin={{ top: 20, right: 160, bottom: 20, left: 160 }}
            align="justify"
            colors={{ scheme: "category10" }}
            nodeOpacity={1}
            nodeHoverOthersOpacity={0.35}
            nodeThickness={18}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeBorderRadius={3}
            linkOpacity={0.4}
            linkHoverOthersOpacity={0.1}
            linkContract={3}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
            label={(node) => {
              const label = (node as unknown as { label?: string }).label || String(node.id);
              return label.length > 12 ? label.substring(0, 12) + "…" : label;
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
