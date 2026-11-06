import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import seedData from "@/data/seed-data.json";

let cachedSales = seedData.sales.map((s, idx) => ({
  id: `sale_${idx + 1}`,
  date: s.date,
  paymentMethod: s.paymentMethod,
  productName: s.productName,
  invoiceNumber: s.invoiceNumber,
  quantity: s.quantity,
  unitSalePriceUsd: s.unitSalePriceUsd,
  unitCostUsd: s.unitCostUsd,
  totalSaleUsd: s.totalSaleUsd,
  unitMarginUsd: s.unitMarginUsd,
  totalMarginUsd: s.totalMarginUsd,
}));

export async function GET() {
  try {
    const dbSales = await prisma.saleTransaction.findMany({
      include: { product: true },
      orderBy: { date: "desc" },
    });

    if (dbSales && dbSales.length > 0) {
      const formatted = dbSales.map((s) => ({
        id: s.id,
        date: s.date.toISOString(),
        paymentMethod: s.paymentMethod,
        productName: s.product.name,
        invoiceNumber: s.invoiceNumber,
        quantity: Number(s.quantity),
        unitSalePriceUsd: Number(s.unitSalePriceUsd),
        unitCostUsd: Number(s.unitCostUsd),
        totalSaleUsd: Number(s.totalSaleUsd),
        unitMarginUsd: Number(s.unitMarginUsd),
        totalMarginUsd: Number(s.totalMarginUsd),
      }));
      return NextResponse.json(formatted);
    }
  } catch {
    // Return cached
  }

  return NextResponse.json(cachedSales);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      date,
      paymentMethod,
      productId,
      invoiceNumber,
      quantity,
      unitSalePriceUsd,
      unitCostUsd,
      totalSaleUsd,
      unitMarginUsd,
      totalMarginUsd,
    } = body;

    const newSale = {
      id: `sale_${cachedSales.length + 1}`,
      date: date || new Date().toISOString(),
      paymentMethod: paymentMethod || "DIVISAS_EFECTIVO",
      productName:
        seedData.products.find((p) => p.sku === productId || `prod_${seedData.products.indexOf(p)+1}` === productId)?.name || "Producto General",
      invoiceNumber: invoiceNumber || `F-${cachedSales.length + 1}`,
      quantity: Number(quantity) || 1,
      unitSalePriceUsd: Number(unitSalePriceUsd) || 0,
      unitCostUsd: Number(unitCostUsd) || 0,
      totalSaleUsd: Number(totalSaleUsd) || 0,
      unitMarginUsd: Number(unitMarginUsd) || 0,
      totalMarginUsd: Number(totalMarginUsd) || 0,
    };

    try {
      await prisma.saleTransaction.create({
        data: {
          date: new Date(newSale.date),
          paymentMethod: paymentMethod as any,
          productId,
          invoiceNumber: newSale.invoiceNumber,
          quantity: newSale.quantity,
          unitSalePriceUsd: newSale.unitSalePriceUsd,
          unitCostUsd: newSale.unitCostUsd,
          totalSaleUsd: newSale.totalSaleUsd,
          unitMarginUsd: newSale.unitMarginUsd,
          totalMarginUsd: newSale.totalMarginUsd,
        },
      });
    } catch {
      // In-memory fallback
    }

    cachedSales.unshift(newSale);

    return NextResponse.json(newSale, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
