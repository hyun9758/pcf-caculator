import type { TrendDataPoint } from "../types";
import { activityData } from "./activity-data";
import { getEmissionFactor } from "./emission-factors";

/**
 * 과제 데이터에서 월별 시계열 자동 생성
 */
export function generateTrendData(): TrendDataPoint[] {
  const monthlyMap = new Map<
    string,
    { scope1: number; scope2: number; scope3: number; raw_material: number; manufacturing: number; transportation: number; use: number; end_of_life: number }
  >();

  for (const ad of activityData) {
    const month = ad.date.substring(0, 7); // "2025-01"
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, {
        scope1: 0, scope2: 0, scope3: 0,
        raw_material: 0, manufacturing: 0, transportation: 0, use: 0, end_of_life: 0,
      });
    }
    const entry = monthlyMap.get(month)!;
    const ef = getEmissionFactor(ad.emissionFactorId);
    if (!ef) continue;
    const co2e = ad.quantity * ef.co2ePerUnit;

    entry[ef.scope] += co2e;
    entry[ad.lifecycleStage] += co2e;
  }

  const sorted = [...monthlyMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  return sorted.map(([period, data]) => ({
    period,
    totalCo2e: data.scope1 + data.scope2 + data.scope3,
    byScope: { scope1: data.scope1, scope2: data.scope2, scope3: data.scope3 },
    byLifecycleStage: {
      raw_material: data.raw_material,
      manufacturing: data.manufacturing,
      transportation: data.transportation,
      use: data.use,
      end_of_life: data.end_of_life,
    },
  }));
}

export const trendData: TrendDataPoint[] = generateTrendData();
