import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { products } from "../src/lib/data/products";
import { emissionFactors } from "../src/lib/data/emission-factors";
import { activityData } from "../src/lib/data/activity-data";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }) as unknown as InstanceType<typeof PrismaClient>;

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.activityData.deleteMany();
  await prisma.emissionFactor.deleteMany();
  await prisma.product.deleteMany();

  console.log(`  → ${emissionFactors.length}개 배출계수 투입`);
  for (const ef of emissionFactors) {
    await prisma.emissionFactor.create({
      data: {
        id: ef.id,
        name: ef.name,
        nameKo: ef.nameKo,
        category: ef.category,
        unit: ef.unit,
        co2ePerUnit: ef.co2ePerUnit,
        source: ef.source,
        region: ef.region,
        scope: ef.scope,
        version: ef.version ?? 1,
        validFrom: ef.validFrom ?? null,
        validTo: ef.validTo ?? null,
      },
    });
  }

  console.log(`  → ${products.length}개 제품 투입`);
  for (const product of products) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        functionalUnit: product.functionalUnit,
        weight: product.weight,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      },
    });
  }

  console.log(`  → ${activityData.length}개 활동 데이터 투입`);
  for (const ad of activityData) {
    await prisma.activityData.create({
      data: {
        id: ad.id,
        productId: ad.productId,
        date: ad.date,
        activityType: ad.activityType,
        lifecycleStage: ad.lifecycleStage,
        emissionFactorId: ad.emissionFactorId,
        description: ad.description,
        descriptionKo: ad.descriptionKo,
        quantity: ad.quantity,
        unit: ad.unit,
      },
    });
  }

  console.log("✅ Seed 완료!");
}

main()
  .catch((e) => {
    console.error("❌ Seed 실패:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
