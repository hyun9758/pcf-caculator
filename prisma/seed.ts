import { PrismaClient } from "../src/generated/prisma/client";
import { products } from "../src/lib/data/products";
import { emissionFactors } from "../src/lib/data/emission-factors";
import { activityData } from "../src/lib/data/activity-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 기존 데이터 삭제 (순서 중요: FK 의존성)
  await prisma.activityData.deleteMany();
  await prisma.emissionFactor.deleteMany();
  await prisma.product.deleteMany();

  // 배출계수 투입
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
      },
    });
  }

  // 제품 투입
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

  // 활동 데이터 투입
  console.log(`  → ${activityData.length}개 활동 데이터 투입`);
  for (const ad of activityData) {
    await prisma.activityData.create({
      data: {
        id: ad.id,
        productId: ad.productId,
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
  });
