import type { Product } from "../types";

export const products: Product[] = [
  {
    id: "prod-steel-coil",
    name: "열연강판 (Hot-Rolled Steel Coil)",
    description:
      "고로(BF-BOF) 공정으로 생산되는 열연강판. 건설, 자동차, 조선 산업의 기초 소재.",
    category: "steel",
    functionalUnit: "1 ton",
    weight: 1000,
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2025-03-10T14:30:00Z",
  },
  {
    id: "prod-laptop",
    name: "노트북 컴퓨터 (Laptop)",
    description:
      "14인치 비즈니스 노트북. 반도체, LCD 패널, 배터리, PCB 등 다양한 부품 포함.",
    category: "electronics",
    functionalUnit: "1 unit",
    weight: 1.8,
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2025-04-05T10:00:00Z",
  },
  {
    id: "prod-cardboard-box",
    name: "골판지 박스 (Corrugated Box)",
    description:
      "B골 골판지 택배 박스 (400×300×200mm). 재생 펄프 70% + 원목 펄프 30% 혼합.",
    category: "packaging",
    functionalUnit: "1,000 units",
    weight: 350,
    createdAt: "2024-03-10T09:00:00Z",
    updatedAt: "2025-02-20T11:00:00Z",
  },
  {
    id: "prod-battery-cell",
    name: "리튬이온 배터리셀 (Li-ion Cell)",
    description:
      "NCM811 양극재 기반 원통형 배터리셀. 전기차 및 ESS용.",
    category: "electronics",
    functionalUnit: "1 kWh capacity",
    weight: 6.5,
    createdAt: "2024-04-20T09:00:00Z",
    updatedAt: "2025-05-01T15:00:00Z",
  },
  {
    id: "prod-pet-bottle",
    name: "PET 음료병 (PET Bottle)",
    description:
      "500mL 일회용 음료 용기. 석유 기반 PET 수지 사용, 캡 및 라벨 포함.",
    category: "packaging",
    functionalUnit: "1,000 units",
    weight: 18,
    createdAt: "2024-05-05T09:00:00Z",
    updatedAt: "2025-04-15T09:30:00Z",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: Product["category"]): Product[] {
  return products.filter((p) => p.category === category);
}
