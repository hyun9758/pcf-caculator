/** 제품 전과정 평가(LCA) 단계 */
export type LifecycleStage =
  | "raw_material" // 원소재 취득
  | "manufacturing" // 제조
  | "transportation" // 운송/유통
  | "use" // 사용
  | "end_of_life"; // 폐기/재활용

/** GHG Protocol 배출 범위 */
export type GhgScope = "scope1" | "scope2" | "scope3";

/** 배출계수 카테고리 */
export type EmissionFactorCategory =
  | "material" // 원소재
  | "energy" // 에너지 (전력, 스팀)
  | "fuel" // 연료 (천연가스, 디젤)
  | "transport" // 운송
  | "waste"; // 폐기물 처리

/** 배출계수 데이터 */
export interface EmissionFactor {
  id: string;
  name: string;
  nameKo: string; // 한국어 이름
  category: EmissionFactorCategory;
  unit: string; // kg, kWh, tkm, L, m3 등
  co2ePerUnit: number; // kgCO2e per unit
  source: string; // 출처 (e.g., "IPCC 2021", "ecoinvent 3.9")
  region: string; // 지역 (e.g., "KR", "Global")
  scope: GhgScope;
}

/** 활동 데이터 (제품별 투입/배출 항목) */
export interface ActivityData {
  id: string;
  productId: string;
  lifecycleStage: LifecycleStage;
  emissionFactorId: string;
  description: string;
  descriptionKo: string;
  quantity: number;
  unit: string;
}
