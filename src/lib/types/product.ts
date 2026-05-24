export type ProductCategory =
  | "steel"
  | "electronics"
  | "packaging"
  | "chemicals"
  | "automotive_parts";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  functionalUnit: string; // e.g., "1 ton of hot-rolled steel coil"
  weight: number; // kg
  createdAt: string;
  updatedAt: string;
}
