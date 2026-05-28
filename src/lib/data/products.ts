import type { Product } from "../types";

export const products: Product[] = [
  {
    id: "prod-ct045",
    name: "컴퓨터 화면 (CT-045)",
    description:
      "컴퓨터 모니터 제품. 전기, 플라스틱 원소재, 트럭 운송 데이터를 기반으로 PCF를 산출합니다.",
    category: "electronics",
    functionalUnit: "1 unit",
    weight: 5.0,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-08-01T00:00:00Z",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: Product["category"]): Product[] {
  return products.filter((p) => p.category === category);
}
