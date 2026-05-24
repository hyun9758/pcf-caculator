import type { GhgScope, LifecycleStage } from "./emission";

/** 대시보드 요약 KPI */
export interface DashboardSummary {
  totalProducts: number;
  avgCo2ePerProduct: number;
  totalCo2e: number;
  scopeBreakdown: Record<GhgScope, number>;
  lifecycleBreakdown: Record<LifecycleStage, number>;
  topEmitter: { productName: string; co2e: number };
  lowestEmitter: { productName: string; co2e: number };
  quarterOverQuarterChange: number; // 전분기 대비 변화율 (%)
}

/** 시계열 데이터 포인트 */
export interface TrendDataPoint {
  period: string; // "2024-Q1"
  totalCo2e: number;
  byScope: Record<GhgScope, number>;
  byLifecycleStage: Record<LifecycleStage, number>;
}

/** 제품별 배출 순위 */
export interface ProductEmissionRank {
  productId: string;
  productName: string;
  category: string;
  totalCo2e: number;
  functionalUnit: string;
}
