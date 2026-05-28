import type { EmissionFactor } from "../types";

/**
 * 배출계수 데이터
 * - 과제 제공 배출계수 4개 (v1)
 * - 버전 이력 추적 지원
 */
export const emissionFactors: EmissionFactor[] = [
  // === 과제 제공 배출계수 ===
  {
    id: "ef-electricity-kr",
    name: "Grid electricity (Korea)",
    nameKo: "전기 (한국전력 기본값)",
    category: "energy",
    unit: "kWh",
    co2ePerUnit: 0.456,
    source: "과제 제공",
    region: "KR",
    scope: "scope2",
    version: 1,
    validFrom: "2025-01-01",
  },
  {
    id: "ef-plastic-1",
    name: "Plastic resin type 1",
    nameKo: "원소재 (플라스틱 1)",
    category: "material",
    unit: "kg",
    co2ePerUnit: 2.3,
    source: "과제 제공",
    region: "Global",
    scope: "scope3",
    version: 1,
    validFrom: "2025-01-01",
  },
  {
    id: "ef-plastic-2",
    name: "Plastic resin type 2",
    nameKo: "원소재 (플라스틱 2)",
    category: "material",
    unit: "kg",
    co2ePerUnit: 3.2,
    source: "과제 제공",
    region: "Global",
    scope: "scope3",
    version: 1,
    validFrom: "2025-01-01",
  },
  {
    id: "ef-truck",
    name: "Truck transport",
    nameKo: "운송 (트럭)",
    category: "transport",
    unit: "ton-km",
    co2ePerUnit: 3.5,
    source: "과제 제공",
    region: "KR",
    scope: "scope3",
    version: 1,
    validFrom: "2025-01-01",
  },
];

export function getEmissionFactor(id: string): EmissionFactor | undefined {
  return emissionFactors.find((ef) => ef.id === id);
}

export function getEmissionFactorsByCategory(
  category: EmissionFactor["category"]
): EmissionFactor[] {
  return emissionFactors.filter((ef) => ef.category === category);
}

/** 설명 텍스트로 배출계수 매칭 */
export function matchEmissionFactor(
  activityType: string,
  description: string
): EmissionFactor | undefined {
  if (activityType === "전기") return getEmissionFactor("ef-electricity-kr");
  if (activityType === "원소재") {
    if (description.includes("플라스틱 2")) return getEmissionFactor("ef-plastic-2");
    return getEmissionFactor("ef-plastic-1");
  }
  if (activityType === "운송") return getEmissionFactor("ef-truck");
  return undefined;
}
