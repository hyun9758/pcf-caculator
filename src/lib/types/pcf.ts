import type { LifecycleStage, GhgScope, ActivityType } from "./emission";

/** PCF 시스템 경계 */
export type PcfBoundary = "cradle-to-gate" | "cradle-to-grave";

/** PCF 계산 결과 개별 항목 */
export interface PcfLineItem {
  activityDataId: string;
  description: string;
  descriptionKo: string;
  lifecycleStage: LifecycleStage;
  scope: GhgScope;
  quantity: number;
  unit: string;
  emissionFactorValue: number; // kgCO2e/unit
  emissionFactorName: string;
  co2e: number; // quantity × emissionFactorValue
  date?: string;
  activityType?: ActivityType;
}

/** PCF 계산 결과 */
export interface PcfResult {
  productId: string;
  productName: string;
  functionalUnit: string;
  totalCo2e: number; // kgCO2e
  calculatedAt: string;
  methodology: string; // "GHG Protocol Product Standard"
  boundary: PcfBoundary;
  byLifecycleStage: Record<LifecycleStage, number>;
  byScope: Record<GhgScope, number>;
  lineItems: PcfLineItem[];
}
