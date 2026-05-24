import type { LifecycleStage, GhgScope, ProductCategory } from "./types";

/** 전과정 단계 라벨 */
export const LIFECYCLE_STAGE_LABELS: Record<
  LifecycleStage,
  { en: string; ko: string }
> = {
  raw_material: { en: "Raw Material", ko: "원소재 취득" },
  manufacturing: { en: "Manufacturing", ko: "제조" },
  transportation: { en: "Transportation", ko: "운송/유통" },
  use: { en: "Use Phase", ko: "사용" },
  end_of_life: { en: "End of Life", ko: "폐기/재활용" },
};

/** 전과정 단계 순서 */
export const LIFECYCLE_STAGE_ORDER: LifecycleStage[] = [
  "raw_material",
  "manufacturing",
  "transportation",
  "use",
  "end_of_life",
];

/** Cradle-to-gate 에 포함되는 단계 */
export const CRADLE_TO_GATE_STAGES: LifecycleStage[] = [
  "raw_material",
  "manufacturing",
  "transportation",
];

/** GHG Scope 라벨 */
export const SCOPE_LABELS: Record<GhgScope, { en: string; ko: string }> = {
  scope1: { en: "Scope 1 (Direct)", ko: "Scope 1 (직접 배출)" },
  scope2: { en: "Scope 2 (Electricity)", ko: "Scope 2 (간접 배출)" },
  scope3: { en: "Scope 3 (Value Chain)", ko: "Scope 3 (기타 간접)" },
};

/** Scope 색상 (GHG 보고 관례) */
export const SCOPE_COLORS: Record<GhgScope, string> = {
  scope1: "#f97316", // orange
  scope2: "#3b82f6", // blue
  scope3: "#22c55e", // green
};

/** 전과정 단계 색상 */
export const LIFECYCLE_COLORS: Record<LifecycleStage, string> = {
  raw_material: "#8b5cf6", // purple
  manufacturing: "#f97316", // orange
  transportation: "#3b82f6", // blue
  use: "#22c55e", // green
  end_of_life: "#6b7280", // gray
};

/** 제품 카테고리 라벨 */
export const CATEGORY_LABELS: Record<
  ProductCategory,
  { en: string; ko: string }
> = {
  steel: { en: "Steel", ko: "철강" },
  electronics: { en: "Electronics", ko: "전자" },
  packaging: { en: "Packaging", ko: "포장재" },
  chemicals: { en: "Chemicals", ko: "화학" },
  automotive_parts: { en: "Automotive Parts", ko: "자동차 부품" },
};

/** 카테고리 색상 */
export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  steel: "#78716c",
  electronics: "#6366f1",
  packaging: "#d97706",
  chemicals: "#059669",
  automotive_parts: "#dc2626",
};

/** 숫자 포맷 헬퍼 */
export function formatCo2e(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}t`;
  }
  return `${value.toFixed(1)}kg`;
}

export function formatCo2eFull(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} tCO₂e`;
  }
  return `${value.toFixed(2)} kgCO₂e`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}
