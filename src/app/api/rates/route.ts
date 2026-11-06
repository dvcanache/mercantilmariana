import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import seedData from "@/data/seed-data.json";

// In-memory cache fallback for demo / serverless without DB
let cachedRates = { ...seedData.rates };

export async function GET() {
  try {
    const rateRecord = await prisma.exchangeRateSetting.findFirst();
    if (rateRecord) {
      cachedRates = {
        supplierReplacementRate: Number(rateRecord.supplierReplacementRate),
        officialBcvRate: Number(rateRecord.officialBcvRate),
        promoDiscountPercentage: Number(rateRecord.promoDiscountPercentage),
      };
    }
  } catch {
    // Return cached rates
  }

  const factor =
    cachedRates.supplierReplacementRate > 0
      ? cachedRates.officialBcvRate / cachedRates.supplierReplacementRate
      : 1;

  return NextResponse.json({
    rates: {
      ...cachedRates,
      exchangeFactor: factor,
      updatedAt: new Date().toISOString(),
    },
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplierReplacementRate, officialBcvRate, promoDiscountPercentage } = body;

    if (!supplierReplacementRate || !officialBcvRate) {
      return NextResponse.json(
        { error: "Tasa de compra y tasa BCV son obligatorias" },
        { status: 400 }
      );
    }

    cachedRates = {
      supplierReplacementRate: Number(supplierReplacementRate),
      officialBcvRate: Number(officialBcvRate),
      promoDiscountPercentage:
        promoDiscountPercentage !== undefined
          ? Number(promoDiscountPercentage)
          : cachedRates.promoDiscountPercentage,
    };

    try {
      const existing = await prisma.exchangeRateSetting.findFirst();
      if (existing) {
        await prisma.exchangeRateSetting.update({
          where: { id: existing.id },
          data: {
            supplierReplacementRate: cachedRates.supplierReplacementRate,
            officialBcvRate: cachedRates.officialBcvRate,
            promoDiscountPercentage: cachedRates.promoDiscountPercentage,
          },
        });
      } else {
        await prisma.exchangeRateSetting.create({
          data: cachedRates,
        });
      }

      await prisma.rateHistory.create({
        data: {
          officialBcvRate: cachedRates.officialBcvRate,
          supplierReplacementRate: cachedRates.supplierReplacementRate,
          source: "MANUAL_OVERRIDE",
        },
      });
    } catch {
      // DB offline, cached rates updated
    }

    return NextResponse.json({
      success: true,
      rates: cachedRates,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error actualizando tasas: " + (err?.message || err) },
      { status: 500 }
    );
  }
}
