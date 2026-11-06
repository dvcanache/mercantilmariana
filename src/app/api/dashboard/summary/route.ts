import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeDashboardMetrics } from "@/lib/dashboard-service";
import seedData from "@/data/seed-data.json";

export async function GET() {
  let salesList: any[] = seedData.sales;
  try {
    const dbSales = await prisma.saleTransaction.findMany();
    if (dbSales && dbSales.length > 0) {
      salesList = dbSales.map((s) => ({
        date: s.date,
        totalSaleUsd: Number(s.totalSaleUsd),
        totalMarginUsd: Number(s.totalMarginUsd),
      }));
    }
  } catch {}

  let monthlyFixedCosts = 1600;
  try {
    const costs = await prisma.fixedCostItem.findMany({ where: { active: true } });
    if (costs.length > 0) {
      monthlyFixedCosts = costs.reduce(
        (acc, c) => acc + Number(c.monthlyAmountUsd),
        0
      );
    }
  } catch {}

  const referenceDate = new Date(2026, 8, 21); // Matches Excel Sept 2026 reference or current
  const metrics = computeDashboardMetrics(salesList, monthlyFixedCosts, referenceDate);

  return NextResponse.json(metrics);
}
