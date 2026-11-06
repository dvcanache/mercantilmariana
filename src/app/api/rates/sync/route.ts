import { NextResponse } from "next/server";
import { fetchCurrentBcvRate } from "@/lib/bcv-service";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const fetched = await fetchCurrentBcvRate();

    if (fetched.rate && fetched.rate > 0) {
      try {
        const existing = await prisma.exchangeRateSetting.findFirst();
        if (existing) {
          await prisma.exchangeRateSetting.update({
            where: { id: existing.id },
            data: { officialBcvRate: fetched.rate },
          });
        }
        await prisma.rateHistory.create({
          data: {
            officialBcvRate: fetched.rate,
            supplierReplacementRate: existing ? existing.supplierReplacementRate : 970.0,
            source: "AUTO_SYNC",
          },
        });
      } catch {
        // Fallback
      }

      return NextResponse.json({
        success: true,
        officialBcvRate: fetched.rate,
        date: fetched.date,
        source: fetched.source,
      });
    }

    return NextResponse.json(
      { error: "No se pudo obtener la tasa oficial" },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error sincronizando tasa BCV: " + (err?.message || err) },
      { status: 500 }
    );
  }
}
