import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { calculateProductPricing, ExchangeRates } from "@/lib/pricing-engine";
import seedData from "@/data/seed-data.json";
import { cachedProducts, CachedProductItem } from "@/lib/product-cache";

async function getEffectiveRates(): Promise<ExchangeRates> {
  try {
    const dbRates = await prisma.exchangeRateSetting.findFirst();
    if (dbRates) {
      return {
        supplierReplacementRate: Number(dbRates.supplierReplacementRate),
        officialBcvRate: Number(dbRates.officialBcvRate),
        promoDiscountPercentage: Number(dbRates.promoDiscountPercentage),
      };
    }
  } catch {
    // Fallback
  }
  return seedData.rates;
}

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser(req);
  const isRestricted = sessionUser?.role === "SALES_CLERK";
  const rates = await getEffectiveRates();

  const { searchParams } = new URL(req.url);
  const includeArchived = !isRestricted && searchParams.get("includeArchived") === "true";
  const categoryFilter = searchParams.get("category");
  const searchQuery = searchParams.get("search")?.toLowerCase().trim();

  try {
    const dbProducts = await prisma.product.findMany({
      where: {
        ...(!includeArchived && { active: true }),
        ...(categoryFilter && categoryFilter !== "TODAS" && {
          category: { name: { equals: categoryFilter, mode: "insensitive" } },
        }),
        ...(searchQuery && {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { sku: { contains: searchQuery, mode: "insensitive" } },
            { brand: { contains: searchQuery, mode: "insensitive" } },
            { model: { contains: searchQuery, mode: "insensitive" } },
          ],
        }),
      },
      include: { category: true },
      orderBy: { sku: "asc" },
    });

    const formatted = dbProducts.map((p) => {
      const cost = Number(p.supplierCostUsd);
      const margin = Number(p.targetMarginPercentage);
      const pricing = calculateProductPricing(
        { supplierCostUsd: cost, targetMarginPercentage: margin },
        rates
      );

      if (isRestricted) {
        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          brand: p.brand,
          model: p.model,
          unitOfMeasure: p.unitOfMeasure,
          currentStock: Number(p.currentStock),
          active: p.active,
          // Strictly scrub and mask confidential financial numbers
          supplierCostUsd: null,
          targetMarginPercentage: null,
          pricing: {
            bcvPriceUsd: pricing.bcvPriceUsd,
            salePriceBs: pricing.salePriceBs,
            promoPriceUsd: pricing.promoPriceUsd,
            promoPriceUsd2: pricing.promoPriceUsd2,
          },
        };
      }

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        brand: p.brand,
        model: p.model,
        supplierCostUsd: cost,
        targetMarginPercentage: margin,
        unitOfMeasure: p.unitOfMeasure,
        currentStock: Number(p.currentStock),
        active: p.active,
        pricing,
      };
    });

    return NextResponse.json(formatted);
  } catch {
    // Return cached fallback if database is offline
  }

  // Filter in-memory cache
  let items = cachedProducts;
  if (!includeArchived) {
    items = items.filter((p) => p.active !== false);
  }
  if (categoryFilter && categoryFilter !== "TODAS") {
    items = items.filter((p) => {
      const catName = typeof p.category === "string" ? p.category : p.category.name;
      return catName.toLowerCase() === categoryFilter.toLowerCase();
    });
  }
  if (searchQuery) {
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.sku.toLowerCase().includes(searchQuery) ||
        p.brand.toLowerCase().includes(searchQuery) ||
        p.model.toLowerCase().includes(searchQuery)
    );
  }

  const formattedCached = items.map((p) => {
    const cost = Number(p.supplierCostUsd);
    const margin = Number(p.targetMarginPercentage);
    const pricing = calculateProductPricing(
      { supplierCostUsd: cost, targetMarginPercentage: margin },
      rates
    );

    if (isRestricted) {
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        brand: p.brand,
        model: p.model,
        unitOfMeasure: p.unitOfMeasure,
        currentStock: Number(p.currentStock),
        active: p.active !== false,
        supplierCostUsd: null,
        targetMarginPercentage: null,
        pricing: {
          bcvPriceUsd: pricing.bcvPriceUsd,
          salePriceBs: pricing.salePriceBs,
          promoPriceUsd: pricing.promoPriceUsd,
          promoPriceUsd2: pricing.promoPriceUsd2,
        },
      };
    }

    return {
      ...p,
      active: p.active !== false,
      supplierCostUsd: cost,
      targetMarginPercentage: margin,
      pricing,
    };
  });

  return NextResponse.json(formattedCached);
}

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser(req);
  if (sessionUser?.role === "SALES_CLERK") {
    return NextResponse.json(
      { error: "Acceso denegado: No tiene permisos para registrar o modificar productos" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    const sku = body.sku ? String(body.sku).trim().toUpperCase() : "";
    const name = body.name ? String(body.name).trim() : "";
    const supplierCostUsd = Number(body.supplierCostUsd);
    const targetMarginPercentage = Number(body.targetMarginPercentage);
    const categoryName = body.category ? String(body.category).trim() : "General";

    if (!sku || !name) {
      return NextResponse.json(
        { error: "El código SKU y el nombre del producto son obligatorios" },
        { status: 400 }
      );
    }

    if (isNaN(supplierCostUsd) || supplierCostUsd <= 0) {
      return NextResponse.json(
        { error: "El costo del proveedor en USD debe ser un número mayor a cero" },
        { status: 400 }
      );
    }

    if (
      isNaN(targetMarginPercentage) ||
      targetMarginPercentage < 0 ||
      targetMarginPercentage > 1.0
    ) {
      return NextResponse.json(
        { error: "El margen de contribución debe estar entre 0% y 100% (0.00 a 1.00)" },
        { status: 400 }
      );
    }

    // Check duplicate SKU in cache
    const existingSkuCached = cachedProducts.find(
      (p) => p.sku.toUpperCase() === sku.toUpperCase()
    );

    try {
      const existingSkuDb = await prisma.product.findUnique({
        where: { sku },
      });
      if (existingSkuDb || existingSkuCached) {
        return NextResponse.json(
          { error: `Ya existe un producto registrado con el SKU '${sku}'` },
          { status: 409 }
        );
      }

      // Upsert Category
      const catCode = `CAT-${categoryName.toUpperCase().replace(/\s+/g, "").slice(0, 6)}`;
      const category = await prisma.category.upsert({
        where: { code: catCode },
        update: { name: categoryName },
        create: {
          code: catCode,
          name: categoryName,
          suggestedMargin: targetMarginPercentage || 0.35,
        },
      });

      const newDbProduct = await prisma.product.create({
        data: {
          sku,
          name,
          categoryId: category.id,
          brand: body.brand ? String(body.brand).trim() : "",
          model: body.model ? String(body.model).trim() : "",
          supplierCostUsd,
          targetMarginPercentage,
          unitOfMeasure: body.unitOfMeasure ? String(body.unitOfMeasure).trim() : "Unidad",
          currentStock: Number(body.currentStock) || 0,
          active: body.active !== undefined ? Boolean(body.active) : true,
        },
        include: { category: true },
      });

      // Synchronize in-memory cache
      cachedProducts.push({
        id: newDbProduct.id,
        sku: newDbProduct.sku,
        name: newDbProduct.name,
        category: { id: category.id, code: category.code, name: category.name },
        brand: newDbProduct.brand,
        model: newDbProduct.model,
        supplierCostUsd: Number(newDbProduct.supplierCostUsd),
        targetMarginPercentage: Number(newDbProduct.targetMarginPercentage),
        unitOfMeasure: newDbProduct.unitOfMeasure,
        currentStock: Number(newDbProduct.currentStock),
        active: newDbProduct.active,
      });

      return NextResponse.json(newDbProduct, { status: 201 });
    } catch (dbErr: any) {
      if (dbErr.code === "P2002") {
        return NextResponse.json(
          { error: `El SKU '${sku}' ya está registrado en la base de datos` },
          { status: 409 }
        );
      }
      // If DB fails, store in local fallback cache
      if (existingSkuCached) {
        return NextResponse.json(
          { error: `Ya existe un producto registrado con el SKU '${sku}'` },
          { status: 409 }
        );
      }

      const newProd: CachedProductItem = {
        id: `prod_${Date.now()}`,
        sku,
        name,
        category: { name: categoryName },
        brand: body.brand ? String(body.brand).trim() : "",
        model: body.model ? String(body.model).trim() : "",
        supplierCostUsd,
        targetMarginPercentage,
        unitOfMeasure: body.unitOfMeasure ? String(body.unitOfMeasure).trim() : "Unidad",
        currentStock: Number(body.currentStock) || 0,
        active: body.active !== undefined ? Boolean(body.active) : true,
      };
      cachedProducts.push(newProd);

      return NextResponse.json(newProd, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
