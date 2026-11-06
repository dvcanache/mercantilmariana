import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { cachedProducts } from "@/lib/product-cache";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSessionUser(req);
  if (sessionUser?.role === "SALES_CLERK") {
    return NextResponse.json(
      { error: "Acceso denegado: No tiene permisos para modificar productos" },
      { status: 403 }
    );
  }

  try {
    const { id } = params;
    const body = await req.json();

    const {
      name,
      sku,
      category,
      brand,
      model,
      supplierCostUsd,
      targetMarginPercentage,
      unitOfMeasure,
      currentStock,
      active,
    } = body;

    if (supplierCostUsd !== undefined && (isNaN(Number(supplierCostUsd)) || Number(supplierCostUsd) <= 0)) {
      return NextResponse.json(
        { error: "El costo del proveedor en USD debe ser mayor a cero" },
        { status: 400 }
      );
    }

    if (
      targetMarginPercentage !== undefined &&
      (isNaN(Number(targetMarginPercentage)) ||
        Number(targetMarginPercentage) < 0 ||
        Number(targetMarginPercentage) > 1.0)
    ) {
      return NextResponse.json(
        { error: "El margen de contribución debe estar entre 0% y 100% (0.00 a 1.00)" },
        { status: 400 }
      );
    }

    let categoryId: string | undefined = undefined;
    if (category) {
      const catName = String(category).trim();
      const catCode = `CAT-${catName.toUpperCase().replace(/\s+/g, "").slice(0, 6)}`;
      try {
        const catRecord = await prisma.category.upsert({
          where: { code: catCode },
          update: { name: catName },
          create: {
            code: catCode,
            name: catName,
            suggestedMargin: targetMarginPercentage ? Number(targetMarginPercentage) : 0.35,
          },
        });
        categoryId = catRecord.id;
      } catch {
        // Fallback
      }
    }

    // Update in-memory cached fallback
    const cachedIdx = cachedProducts.findIndex(
      (p) => p.id === id || p.sku.toUpperCase() === id.toUpperCase()
    );
    if (cachedIdx !== -1) {
      cachedProducts[cachedIdx] = {
        ...cachedProducts[cachedIdx],
        ...(name !== undefined && { name: String(name).trim() }),
        ...(sku !== undefined && { sku: String(sku).trim().toUpperCase() }),
        ...(category !== undefined && { category: { name: String(category).trim() } }),
        ...(brand !== undefined && { brand: String(brand).trim() }),
        ...(model !== undefined && { model: String(model).trim() }),
        ...(supplierCostUsd !== undefined && { supplierCostUsd: Number(supplierCostUsd) }),
        ...(targetMarginPercentage !== undefined && { targetMarginPercentage: Number(targetMarginPercentage) }),
        ...(unitOfMeasure !== undefined && { unitOfMeasure: String(unitOfMeasure).trim() }),
        ...(currentStock !== undefined && { currentStock: Number(currentStock) }),
        ...(active !== undefined && { active: Boolean(active) }),
      };
    }

    try {
      // Find real DB record by ID or SKU
      const existingDb = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { sku: id }],
        },
      });

      if (existingDb) {
        const updated = await prisma.product.update({
          where: { id: existingDb.id },
          data: {
            ...(name !== undefined && { name: String(name).trim() }),
            ...(sku !== undefined && { sku: String(sku).trim().toUpperCase() }),
            ...(categoryId !== undefined && { categoryId }),
            ...(brand !== undefined && { brand: String(brand).trim() }),
            ...(model !== undefined && { model: String(model).trim() }),
            ...(supplierCostUsd !== undefined && { supplierCostUsd: Number(supplierCostUsd) }),
            ...(targetMarginPercentage !== undefined && {
              targetMarginPercentage: Number(targetMarginPercentage),
            }),
            ...(unitOfMeasure !== undefined && { unitOfMeasure: String(unitOfMeasure).trim() }),
            ...(currentStock !== undefined && { currentStock: Number(currentStock) }),
            ...(active !== undefined && { active: Boolean(active) }),
          },
          include: { category: true },
        });
        return NextResponse.json(updated);
      }
    } catch {
      // Fallback to cache response
    }

    return NextResponse.json({
      success: true,
      id,
      updates: cachedIdx !== -1 ? cachedProducts[cachedIdx] : body,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSessionUser(req);
  if (sessionUser?.role === "SALES_CLERK") {
    return NextResponse.json(
      { error: "Acceso denegado: No tiene permisos para eliminar o archivar productos" },
      { status: 403 }
    );
  }

  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const forceDelete = searchParams.get("force") === "true";

    // 1. Locate product in Neon DB by ID or SKU
    let dbProduct: any = null;
    try {
      dbProduct = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { sku: id }],
        },
        include: {
          _count: { select: { sales: true } },
        },
      });
    } catch {
      // DB connection issue fallback
    }

    // 2. Locate in local cache fallback
    const cachedIdx = cachedProducts.findIndex(
      (p) => p.id === id || p.sku.toUpperCase() === id.toUpperCase()
    );

    if (dbProduct) {
      const salesCount = dbProduct._count?.sales || 0;

      if (salesCount > 0 && !forceDelete) {
        // Soft archive by default to preserve financial historical integrity
        await prisma.product.update({
          where: { id: dbProduct.id },
          data: { active: false },
        });

        if (cachedIdx !== -1) {
          cachedProducts[cachedIdx].active = false;
        }

        return NextResponse.json({
          success: true,
          action: "ARCHIVED",
          id: dbProduct.id,
          sku: dbProduct.sku,
          salesCount,
          message:
            `El producto posee ${salesCount} ventas registradas. Ha sido desactivado/archivado del catálogo para proteger la contabilidad.`,
        });
      }

      // Hard permanent delete (Cascade deletes sales if force=true or schema cascade)
      if (salesCount > 0 && forceDelete) {
        await prisma.saleTransaction.deleteMany({
          where: { productId: dbProduct.id },
        });
      }

      await prisma.product.delete({
        where: { id: dbProduct.id },
      });

      if (cachedIdx !== -1) {
        cachedProducts.splice(cachedIdx, 1);
      }

      return NextResponse.json({
        success: true,
        action: "DELETED",
        id: dbProduct.id,
        sku: dbProduct.sku,
        message: "Producto eliminado permanentemente del catálogo",
      });
    }

    // 3. Fallback cache removal
    if (cachedIdx !== -1) {
      cachedProducts.splice(cachedIdx, 1);
      return NextResponse.json({
        success: true,
        action: "DELETED",
        id,
        message: "Producto eliminado del catálogo",
      });
    }

    return NextResponse.json(
      { error: `No se encontró el producto con identificador '${id}'` },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
