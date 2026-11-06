import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateBreakEven } from "@/lib/pricing-engine";
import seedData from "@/data/seed-data.json";

let cachedFixedCosts = seedData.fixedCosts.map((c, idx) => ({
  id: `cost_${idx + 1}`,
  concept: c.concept,
  monthlyAmountUsd: c.monthlyAmountUsd,
  active: c.active,
}));

export async function GET() {
  let bcvRate = seedData.rates.officialBcvRate;
  try {
    const rateRecord = await prisma.exchangeRateSetting.findFirst();
    if (rateRecord) bcvRate = Number(rateRecord.officialBcvRate);
  } catch {}

  let costs = cachedFixedCosts;
  try {
    const dbCosts = await prisma.fixedCostItem.findMany({
      orderBy: { orderIndex: "asc" },
    });
    if (dbCosts && dbCosts.length > 0) {
      costs = dbCosts.map((c) => ({
        id: c.id,
        concept: c.concept,
        monthlyAmountUsd: Number(c.monthlyAmountUsd),
        active: c.active,
      }));
    }
  } catch {}

  // Average margin across catalog
  const avgMargin = 0.04577319588; // Excel reference benchmark

  const breakEven = calculateBreakEven(costs, avgMargin, bcvRate);

  return NextResponse.json({
    fixedCosts: costs,
    breakEven,
    bcvRate,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, amount } = body;

    const item = cachedFixedCosts.find((c) => c.id === id);
    if (item) {
      item.monthlyAmountUsd = Number(amount);
    }

    try {
      await prisma.fixedCostItem.update({
        where: { id },
        data: { monthlyAmountUsd: Number(amount) },
      });
    } catch {}

    return NextResponse.json({ success: true, updated: { id, amount } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concept, amount } = body;

    const newItem = {
      id: `cost_${cachedFixedCosts.length + 1}`,
      concept,
      monthlyAmountUsd: Number(amount),
      active: true,
    };
    cachedFixedCosts.push(newItem);

    try {
      await prisma.fixedCostItem.create({
        data: {
          concept,
          monthlyAmountUsd: Number(amount),
          orderIndex: cachedFixedCosts.length,
          active: true,
        },
      });
    } catch {}

    return NextResponse.json(newItem, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
