import { PrismaClient } from "../src/generated/prisma";
import { dataProducts } from "./data/products";

const prisma = new PrismaClient();

async function main() {
  for (const dataProduct of dataProducts) {
    const upsertedProduct = await prisma.product.upsert({
      where: { slug: dataProduct.slug },
      update: dataProduct,
      create: dataProduct,
    });

    console.log(`🧸 ${upsertedProduct.name}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
