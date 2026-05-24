import type { TrendDataPoint } from "../types";

/**
 * 8분기 시계열 데이터 (2024 Q1 ~ 2025 Q4)
 * 탄소 감축 이니셔티브로 약 12% 감소 추세 반영
 */
export const trendData: TrendDataPoint[] = [
  {
    period: "2024-Q1",
    totalCo2e: 3420,
    byScope: { scope1: 1540, scope2: 890, scope3: 990 },
    byLifecycleStage: {
      raw_material: 1025,
      manufacturing: 1370,
      transportation: 340,
      use: 445,
      end_of_life: 240,
    },
  },
  {
    period: "2024-Q2",
    totalCo2e: 3350,
    byScope: { scope1: 1500, scope2: 870, scope3: 980 },
    byLifecycleStage: {
      raw_material: 1005,
      manufacturing: 1340,
      transportation: 335,
      use: 435,
      end_of_life: 235,
    },
  },
  {
    period: "2024-Q3",
    totalCo2e: 3280,
    byScope: { scope1: 1460, scope2: 850, scope3: 970 },
    byLifecycleStage: {
      raw_material: 985,
      manufacturing: 1310,
      transportation: 330,
      use: 425,
      end_of_life: 230,
    },
  },
  {
    period: "2024-Q4",
    totalCo2e: 3200,
    byScope: { scope1: 1420, scope2: 830, scope3: 950 },
    byLifecycleStage: {
      raw_material: 960,
      manufacturing: 1280,
      transportation: 320,
      use: 415,
      end_of_life: 225,
    },
  },
  {
    period: "2025-Q1",
    totalCo2e: 3150,
    byScope: { scope1: 1390, scope2: 810, scope3: 950 },
    byLifecycleStage: {
      raw_material: 945,
      manufacturing: 1260,
      transportation: 315,
      use: 410,
      end_of_life: 220,
    },
  },
  {
    period: "2025-Q2",
    totalCo2e: 3100,
    byScope: { scope1: 1360, scope2: 800, scope3: 940 },
    byLifecycleStage: {
      raw_material: 930,
      manufacturing: 1240,
      transportation: 310,
      use: 400,
      end_of_life: 220,
    },
  },
  {
    period: "2025-Q3",
    totalCo2e: 3050,
    byScope: { scope1: 1330, scope2: 790, scope3: 930 },
    byLifecycleStage: {
      raw_material: 915,
      manufacturing: 1220,
      transportation: 305,
      use: 395,
      end_of_life: 215,
    },
  },
  {
    period: "2025-Q4",
    totalCo2e: 3010,
    byScope: { scope1: 1310, scope2: 780, scope3: 920 },
    byLifecycleStage: {
      raw_material: 905,
      manufacturing: 1205,
      transportation: 300,
      use: 390,
      end_of_life: 210,
    },
  },
];
