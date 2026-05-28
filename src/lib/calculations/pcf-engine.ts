import type { Product, PcfResult, PcfLineItem, PcfBoundary } from "../types";
import type { LifecycleStage, GhgScope } from "../types";
import { CRADLE_TO_GATE_STAGES, LIFECYCLE_STAGE_ORDER } from "../constants";
import { getEmissionFactor } from "../data/emission-factors";
import { getActivityDataByProduct } from "../data/activity-data";

/**
 * PCF 계산 엔진
 *
 * 계산 공식: CO2e = Activity Data (수량) × Emission Factor (배출계수)
 * 제품 PCF = Σ (각 활동 데이터의 CO2e)
 */
export function calculatePcf(
  product: Product,
  boundary: PcfBoundary = "cradle-to-gate"
): PcfResult {
  const allActivityData = getActivityDataByProduct(product.id);

  const filteredData =
    boundary === "cradle-to-gate"
      ? allActivityData.filter((ad) =>
          CRADLE_TO_GATE_STAGES.includes(ad.lifecycleStage)
        )
      : allActivityData;

  const lineItems: PcfLineItem[] = filteredData
    .map((ad) => {
      const ef = getEmissionFactor(ad.emissionFactorId);
      if (!ef) return null;

      const co2e = ad.quantity * ef.co2ePerUnit;

      return {
        activityDataId: ad.id,
        description: ad.description,
        descriptionKo: ad.descriptionKo,
        lifecycleStage: ad.lifecycleStage,
        scope: ef.scope,
        quantity: ad.quantity,
        unit: ad.unit,
        emissionFactorValue: ef.co2ePerUnit,
        emissionFactorName: ef.nameKo,
        co2e,
        date: ad.date,
        activityType: ad.activityType,
      };
    })
    .filter((item): item is PcfLineItem & { date: string; activityType: string } => item !== null);

  const byLifecycleStage = LIFECYCLE_STAGE_ORDER.reduce(
    (acc, stage) => {
      acc[stage] = lineItems
        .filter((li) => li.lifecycleStage === stage)
        .reduce((sum, li) => sum + li.co2e, 0);
      return acc;
    },
    {} as Record<LifecycleStage, number>
  );

  const scopes: GhgScope[] = ["scope1", "scope2", "scope3"];
  const byScope = scopes.reduce(
    (acc, scope) => {
      acc[scope] = lineItems
        .filter((li) => li.scope === scope)
        .reduce((sum, li) => sum + li.co2e, 0);
      return acc;
    },
    {} as Record<GhgScope, number>
  );

  const totalCo2e = lineItems.reduce((sum, li) => sum + li.co2e, 0);

  return {
    productId: product.id,
    productName: product.name,
    functionalUnit: product.functionalUnit,
    totalCo2e,
    calculatedAt: new Date().toISOString(),
    methodology: "GHG Protocol Product Standard",
    boundary,
    byLifecycleStage,
    byScope,
    lineItems,
  };
}

export function calculateAllPcf(
  products: Product[],
  boundary: PcfBoundary = "cradle-to-gate"
): PcfResult[] {
  return products.map((product) => calculatePcf(product, boundary));
}
