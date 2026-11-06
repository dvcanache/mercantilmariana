import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import seedData from "../src/data/seed-data.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Mercantil Mariana database from Excel seed dataset...");

  // 1. Seed Users (Admin, Manager, Sales Clerk)
  const adminPassword = await bcrypt.hash("admin123", 10);
  const managerPassword = await bcrypt.hash("gerente123", 10);
  const clerkPassword = await bcrypt.hash("vendedor123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@mercantilmariana.com" },
    update: { passwordHash: adminPassword, role: "ADMIN", active: true },
    create: {
      email: "admin@mercantilmariana.com",
      name: "Administrador General",
      passwordHash: adminPassword,
      role: "ADMIN",
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "gerente@mercantilmariana.com" },
    update: { passwordHash: managerPassword, role: "MANAGER", active: true },
    create: {
      email: "gerente@mercantilmariana.com",
      name: "Gerente Comercial",
      passwordHash: managerPassword,
      role: "MANAGER",
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "vendedor@mercantilmariana.com" },
    update: { passwordHash: clerkPassword, role: "SALES_CLERK", active: true },
    create: {
      email: "vendedor@mercantilmariana.com",
      name: "Vendedor de Mostrador",
      passwordHash: clerkPassword,
      role: "SALES_CLERK",
      active: true,
    },
  });

  console.log("Users created.");

  // 2. Seed Exchange Rates
  const existingRate = await prisma.exchangeRateSetting.findFirst();
  if (!existingRate) {
    await prisma.exchangeRateSetting.create({
      data: {
        supplierReplacementRate: seedData.rates.supplierReplacementRate,
        officialBcvRate: seedData.rates.officialBcvRate,
        promoDiscountPercentage: seedData.rates.promoDiscountPercentage,
      },
    });
  }
  console.log("Exchange rates initialized.");

  // 3. Seed Categories
  const categoryMap = new Map<string, string>();
  for (const cat of seedData.categories) {
    const created = await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name, suggestedMargin: cat.suggestedMargin },
      create: {
        code: cat.code,
        name: cat.name,
        suggestedMargin: cat.suggestedMargin,
      },
    });
    categoryMap.set(cat.name, created.id);
  }
  console.log(`Categories seeded: ${seedData.categories.length}`);

  // 4. Seed Products
  const productMap = new Map<string, string>();
  for (const prod of seedData.products) {
    const catId = categoryMap.get(prod.category) || Array.from(categoryMap.values())[0];
    const created = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        brand: prod.brand,
        model: prod.model,
        supplierCostUsd: prod.supplierCostUsd,
        targetMarginPercentage: prod.targetMarginPercentage,
        currentStock: prod.currentStock,
        categoryId: catId,
      },
      create: {
        sku: prod.sku,
        name: prod.name,
        brand: prod.brand,
        model: prod.model,
        supplierCostUsd: prod.supplierCostUsd,
        targetMarginPercentage: prod.targetMarginPercentage,
        unitOfMeasure: prod.unitOfMeasure,
        currentStock: prod.currentStock,
        categoryId: catId,
      },
    });
    productMap.set(prod.name, created.id);
  }
  console.log(`Products seeded: ${seedData.products.length}`);

  // 5. Seed Fixed Costs
  await prisma.fixedCostItem.deleteMany({});
  let idx = 0;
  for (const cost of seedData.fixedCosts) {
    await prisma.fixedCostItem.create({
      data: {
        concept: cost.concept,
        monthlyAmountUsd: cost.monthlyAmountUsd,
        orderIndex: idx++,
        active: true,
      },
    });
  }
  console.log(`Fixed costs seeded: ${seedData.fixedCosts.length}`);

  // 6. Seed Sales Transactions
  const paymentMethodMap: Record<string, any> = {
    "Divisas Efectivo": "DIVISAS_EFECTIVO",
    "Punto de Venta": "PUNTO_VENTA_BS",
    "Pago Móvil / Transf.": "PAGO_MOVIL",
    "Zelle": "ZELLE",
  };

  for (const sale of seedData.sales) {
    const prodId = productMap.get(sale.productName);
    if (prodId) {
      await prisma.saleTransaction.create({
        data: {
          date: new Date(sale.date),
          paymentMethod: paymentMethodMap[sale.paymentMethod] || "DIVISAS_EFECTIVO",
          productId: prodId,
          invoiceNumber: sale.invoiceNumber,
          quantity: sale.quantity,
          unitSalePriceUsd: sale.unitSalePriceUsd,
          unitCostUsd: sale.unitCostUsd,
          totalSaleUsd: sale.totalSaleUsd,
          unitMarginUsd: sale.unitMarginUsd,
          totalMarginUsd: sale.totalMarginUsd,
          recordedById: admin.id,
        },
      });
    }
  }
  console.log(`Sales seeded: ${seedData.sales.length}`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
