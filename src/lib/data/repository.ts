/**
 * Data Repository — DB 또는 In-memory 데이터 소스 추상화
 *
 * USE_DB=true 환경변수 설정 시 Prisma(Postgres) 사용.
 * 미설정 시 기존 In-memory mock 데이터 사용.
 */
import type { Product, EmissionFactor, ActivityData } from "../types";

const useDb = process.env.USE_DB === "true";

// ============ Products ============

export async function findAllProducts(): Promise<Product[]> {
  if (useDb) {
    const { prisma } = await import("../prisma");
    const rows = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(mapProduct);
  }
  const { products } = await import("./products");
  return products;
}

export async function findProductById(id: string): Promise<Product | null> {
  if (useDb) {
    const { prisma } = await import("../prisma");
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? mapProduct(row) : null;
  }
  const { getProduct } = await import("./products");
  return getProduct(id) || null;
}

// ============ Emission Factors ============

export async function findAllEmissionFactors(
  filters?: { category?: string; region?: string }
): Promise<EmissionFactor[]> {
  if (useDb) {
    const { prisma } = await import("../prisma");
    const where: Record<string, string> = {};
    if (filters?.category) where.category = filters.category;
    if (filters?.region) where.region = filters.region;
    const rows = await prisma.emissionFactor.findMany({ where });
    return rows.map(mapEmissionFactor);
  }
  const { emissionFactors } = await import("./emission-factors");
  let result = [...emissionFactors];
  if (filters?.category) result = result.filter((ef) => ef.category === filters.category);
  if (filters?.region) result = result.filter((ef) => ef.region === filters.region);
  return result;
}

export async function findEmissionFactorById(id: string): Promise<EmissionFactor | null> {
  if (useDb) {
    const { prisma } = await import("../prisma");
    const row = await prisma.emissionFactor.findUnique({ where: { id } });
    return row ? mapEmissionFactor(row) : null;
  }
  const { getEmissionFactor } = await import("./emission-factors");
  return getEmissionFactor(id) || null;
}

// ============ Activity Data ============

export async function findActivityDataByProduct(productId: string): Promise<ActivityData[]> {
  if (useDb) {
    const { prisma } = await import("../prisma");
    const rows = await prisma.activityData.findMany({
      where: { productId },
      include: { emissionFactor: true },
    });
    return rows.map(mapActivityData);
  }
  const { getActivityDataByProduct } = await import("./activity-data");
  return getActivityDataByProduct(productId);
}

export async function createActivityData(
  data: Omit<ActivityData, "id">
): Promise<ActivityData> {
  if (useDb) {
    const { prisma } = await import("../prisma");
    const row = await prisma.activityData.create({
      data: {
        productId: data.productId,
        lifecycleStage: data.lifecycleStage,
        emissionFactorId: data.emissionFactorId,
        description: data.description,
        descriptionKo: data.descriptionKo,
        quantity: data.quantity,
        unit: data.unit,
      },
    });
    return mapActivityData(row);
  }
  // In-memory: 반환만 (실제 저장은 클라이언트 상태에서 관리)
  return {
    id: `ad-mem-${Date.now()}`,
    ...data,
  };
}

export async function deleteActivityData(id: string): Promise<void> {
  if (useDb) {
    const { prisma } = await import("../prisma");
    await prisma.activityData.delete({ where: { id } });
  }
}

// ============ Mappers (DB row → domain type) ============

function mapProduct(row: {
  id: string;
  name: string;
  description: string;
  category: string;
  functionalUnit: string;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category as Product["category"],
    functionalUnit: row.functionalUnit,
    weight: row.weight,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapEmissionFactor(row: {
  id: string;
  name: string;
  nameKo: string;
  category: string;
  unit: string;
  co2ePerUnit: number;
  source: string;
  region: string;
  scope: string;
}): EmissionFactor {
  return {
    id: row.id,
    name: row.name,
    nameKo: row.nameKo,
    category: row.category as EmissionFactor["category"],
    unit: row.unit,
    co2ePerUnit: row.co2ePerUnit,
    source: row.source,
    region: row.region,
    scope: row.scope as EmissionFactor["scope"],
  };
}

function mapActivityData(row: {
  id: string;
  productId: string;
  lifecycleStage: string;
  emissionFactorId: string;
  description: string;
  descriptionKo: string;
  quantity: number;
  unit: string;
}): ActivityData {
  return {
    id: row.id,
    productId: row.productId,
    lifecycleStage: row.lifecycleStage as ActivityData["lifecycleStage"],
    emissionFactorId: row.emissionFactorId,
    description: row.description,
    descriptionKo: row.descriptionKo,
    quantity: row.quantity,
    unit: row.unit,
  };
}
