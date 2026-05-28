import type { ActivityData } from "../types";

/**
 * 과제 제공 활동 데이터 — 컴퓨터 화면 (CT-045)
 * 2025-01 ~ 2025-08, 30건
 */
export const activityData: ActivityData[] = [
  // === 전기 (한국전력) — 10건 ===
  { id: "ad-e01", productId: "prod-ct045", date: "2025-01-01", activityType: "전기", lifecycleStage: "manufacturing", emissionFactorId: "ef-electricity-kr", description: "Grid electricity (Korea)", descriptionKo: "한국전력", quantity: 110.0, unit: "kWh" },
  { id: "ad-e02", productId: "prod-ct045", date: "2025-02-01", activityType: "전기", lifecycleStage: "manufacturing", emissionFactorId: "ef-electricity-kr", description: "Grid electricity (Korea)", descriptionKo: "한국전력", quantity: 112.0, unit: "kWh" },
  { id: "ad-e03", productId: "prod-ct045", date: "2025-03-01", activityType: "전기", lifecycleStage: "manufacturing", emissionFactorId: "ef-electricity-kr", description: "Grid electricity (Korea)", descriptionKo: "한국전력", quantity: 115.0, unit: "kWh" },
  { id: "ad-e04", productId: "prod-ct045", date: "2025-04-01", activityType: "전기", lifecycleStage: "manufacturing", emissionFactorId: "ef-electricity-kr", description: "Grid electricity (Korea)", descriptionKo: "한국전력", quantity: 130.0, unit: "kWh" },
  { id: "ad-e05", productId: "prod-ct045", date: "2025-05-01", activityType: "전기", lifecycleStage: "manufacturing", emissionFactorId: "ef-electricity-kr", description: "Grid electricity (Korea)", descriptionKo: "한국전력", quantity: 120.0, unit: "kWh" },
  { id: "ad-e06", productId: "prod-ct045", date: "2025-06-01", activityType: "전기", lifecycleStage: "manufacturing", emissionFactorId: "ef-electricity-kr", description: "Grid electricity (Korea)", descriptionKo: "한국전력", quantity: 110.0, unit: "kWh" },
  { id: "ad-e07", productId: "prod-ct045", date: "2025-07-01", activityType: "전기", lifecycleStage: "manufacturing", emissionFactorId: "ef-electricity-kr", description: "Grid electricity (Korea)", descriptionKo: "한국전력", quantity: 120.0, unit: "kWh" },
  { id: "ad-e08", productId: "prod-ct045", date: "2025-08-01", activityType: "전기", lifecycleStage: "manufacturing", emissionFactorId: "ef-electricity-kr", description: "Grid electricity (Korea)", descriptionKo: "한국전력", quantity: 111.0, unit: "kWh" },
  { id: "ad-e09", productId: "prod-ct045", date: "2025-05-01", activityType: "전기", lifecycleStage: "manufacturing", emissionFactorId: "ef-electricity-kr", description: "Grid electricity (Korea)", descriptionKo: "한국전력", quantity: 101.0, unit: "kWh" },

  // === 원소재 (플라스틱) — 12건 ===
  { id: "ad-m01", productId: "prod-ct045", date: "2025-01-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-1", description: "Plastic resin type 1", descriptionKo: "플라스틱 1", quantity: 230.0, unit: "kg" },
  { id: "ad-m02", productId: "prod-ct045", date: "2025-02-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-1", description: "Plastic resin type 1", descriptionKo: "플라스틱 1", quantity: 340.0, unit: "kg" },
  { id: "ad-m03", productId: "prod-ct045", date: "2025-03-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-2", description: "Plastic resin type 2", descriptionKo: "플라스틱 2", quantity: 23.0, unit: "kg" },
  { id: "ad-m04", productId: "prod-ct045", date: "2025-03-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-1", description: "Plastic resin type 1", descriptionKo: "플라스틱 1", quantity: 430.0, unit: "kg" },
  { id: "ad-m05", productId: "prod-ct045", date: "2025-04-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-1", description: "Plastic resin type 1", descriptionKo: "플라스틱 1", quantity: 510.0, unit: "kg" },
  { id: "ad-m06", productId: "prod-ct045", date: "2025-05-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-1", description: "Plastic resin type 1", descriptionKo: "플라스틱 1", quantity: 424.0, unit: "kg" },
  { id: "ad-m07", productId: "prod-ct045", date: "2025-05-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-2", description: "Plastic resin type 2", descriptionKo: "플라스틱 2", quantity: 40.0, unit: "kg" },
  { id: "ad-m08", productId: "prod-ct045", date: "2025-06-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-1", description: "Plastic resin type 1", descriptionKo: "플라스틱 1", quantity: 450.0, unit: "kg" },
  { id: "ad-m09", productId: "prod-ct045", date: "2025-07-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-1", description: "Plastic resin type 1", descriptionKo: "플라스틱 1", quantity: 340.0, unit: "kg" },
  { id: "ad-m10", productId: "prod-ct045", date: "2025-07-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-2", description: "Plastic resin type 2", descriptionKo: "플라스틱 2", quantity: 43.0, unit: "kg" },
  { id: "ad-m11", productId: "prod-ct045", date: "2025-08-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-1", description: "Plastic resin type 1", descriptionKo: "플라스틱 1", quantity: 230.0, unit: "kg" },
  { id: "ad-m12", productId: "prod-ct045", date: "2025-05-01", activityType: "원소재", lifecycleStage: "raw_material", emissionFactorId: "ef-plastic-1", description: "Plastic resin type 1", descriptionKo: "플라스틱 1", quantity: 232.0, unit: "kg" },

  // === 운송 (트럭) — 9건 ===
  { id: "ad-t01", productId: "prod-ct045", date: "2025-01-01", activityType: "운송", lifecycleStage: "transportation", emissionFactorId: "ef-truck", description: "Truck transport", descriptionKo: "트럭", quantity: 41.0, unit: "ton-km" },
  { id: "ad-t02", productId: "prod-ct045", date: "2025-02-01", activityType: "운송", lifecycleStage: "transportation", emissionFactorId: "ef-truck", description: "Truck transport", descriptionKo: "트럭", quantity: 211.0, unit: "ton-km" },
  { id: "ad-t03", productId: "prod-ct045", date: "2025-03-01", activityType: "운송", lifecycleStage: "transportation", emissionFactorId: "ef-truck", description: "Truck transport", descriptionKo: "트럭", quantity: 123.0, unit: "ton-km" },
  { id: "ad-t04", productId: "prod-ct045", date: "2025-04-01", activityType: "운송", lifecycleStage: "transportation", emissionFactorId: "ef-truck", description: "Truck transport", descriptionKo: "트럭", quantity: 42.0, unit: "ton-km" },
  { id: "ad-t05", productId: "prod-ct045", date: "2025-05-01", activityType: "운송", lifecycleStage: "transportation", emissionFactorId: "ef-truck", description: "Truck transport", descriptionKo: "트럭", quantity: 123.0, unit: "ton-km" },
  { id: "ad-t06", productId: "prod-ct045", date: "2025-06-01", activityType: "운송", lifecycleStage: "transportation", emissionFactorId: "ef-truck", description: "Truck transport", descriptionKo: "트럭", quantity: 123.0, unit: "ton-km" },
  { id: "ad-t07", productId: "prod-ct045", date: "2025-07-01", activityType: "운송", lifecycleStage: "transportation", emissionFactorId: "ef-truck", description: "Truck transport", descriptionKo: "트럭", quantity: 41.0, unit: "ton-km" },
  { id: "ad-t08", productId: "prod-ct045", date: "2025-08-01", activityType: "운송", lifecycleStage: "transportation", emissionFactorId: "ef-truck", description: "Truck transport", descriptionKo: "트럭", quantity: 123.0, unit: "ton-km" },
  { id: "ad-t09", productId: "prod-ct045", date: "2025-05-01", activityType: "운송", lifecycleStage: "transportation", emissionFactorId: "ef-truck", description: "Truck transport", descriptionKo: "트럭", quantity: 12.0, unit: "ton-km" },
];

export function getActivityDataByProduct(productId: string): ActivityData[] {
  return activityData.filter((ad) => ad.productId === productId);
}
