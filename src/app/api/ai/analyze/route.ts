import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { LIFECYCLE_STAGE_LABELS, SCOPE_LABELS } from "@/lib/constants";
import type { PcfResult } from "@/lib/types";
import type { LifecycleStage, GhgScope } from "@/lib/types";

export async function POST(request: Request) {
  const { pcfResult } = (await request.json()) as { pcfResult: PcfResult };

  // PCF 데이터를 자연어 컨텍스트로 변환
  const stageBreakdown = Object.entries(pcfResult.byLifecycleStage)
    .filter(([, value]) => value !== 0)
    .map(
      ([stage, value]) =>
        `- ${LIFECYCLE_STAGE_LABELS[stage as LifecycleStage]?.ko || stage}: ${value.toFixed(1)} kgCO₂e`
    )
    .join("\n");

  const scopeBreakdown = Object.entries(pcfResult.byScope)
    .filter(([, value]) => value !== 0)
    .map(
      ([scope, value]) =>
        `- ${SCOPE_LABELS[scope as GhgScope]?.ko || scope}: ${value.toFixed(1)} kgCO₂e`
    )
    .join("\n");

  const topItems = [...pcfResult.lineItems]
    .sort((a, b) => Math.abs(b.co2e) - Math.abs(a.co2e))
    .slice(0, 5)
    .map(
      (item) =>
        `- ${item.descriptionKo}: ${item.co2e.toFixed(1)} kgCO₂e (${item.emissionFactorName}, ${item.quantity} ${item.unit})`
    )
    .join("\n");

  const prompt = `당신은 탄소 관리 전문 컨설턴트입니다. 다음 제품의 PCF(제품 탄소 발자국) 분석 결과를 보고 전문적인 인사이트를 제공해주세요.

## 제품 정보
- 제품명: ${pcfResult.productName}
- 기능 단위: ${pcfResult.functionalUnit}
- 시스템 경계: ${pcfResult.boundary === "cradle-to-gate" ? "Cradle-to-Gate (원소재~출하)" : "Cradle-to-Grave (전 과정)"}
- 총 PCF: ${pcfResult.totalCo2e.toFixed(1)} kgCO₂e

## 전과정 단계별 배출량
${stageBreakdown}

## GHG Scope별 배출량
${scopeBreakdown}

## 상위 5개 배출 항목
${topItems}

## 분석 요청

다음 4가지를 한국어로 간결하게 분석해주세요:

### 1. 핵심 요약
총 PCF와 주요 배출원을 2-3문장으로 요약.

### 2. 주요 배출 원인 분석
가장 많은 배출을 차지하는 항목과 그 이유. 업계 평균과 비교했을 때 어떤 수준인지.

### 3. 감축 우선순위 제안
가장 효과적인 감축 방안 3가지를 구체적으로 제시. 각각의 예상 감축 효과(%)도 포함.

### 4. 추가 권고사항
데이터 품질 개선, 추가 측정 필요 항목, 장기적 전략 등.

마크다운 형식으로 작성해주세요.`;

  const result = streamText({
    model: google("gemini-2.0-flash"),
    prompt,
  });

  return result.toTextStreamResponse();
}
