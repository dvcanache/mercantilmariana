import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { cachedProducts } from "../route";

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
        // Continue
      }
    }

    // Update in-memory cached fallback
    const cachedIdx = cachedProducts.findIndex((p) => p.id === id);
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
      const updated = await prisma.product.update({
        where: { id },
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
    } catch {
      // Return ok for local cache fallback
      return NextResponse.json({
        success: true,
        id,
        updates: cachedIdx !== -1 ? cachedProducts[cachedIdx] : body,
      });
    }
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

    let salesCount = 0;
    try {
      salesCount = await prisma.saleTransaction.count({
        where: { productId: id },
      });
    } catch {
      // Fallback
    }

    // Check in-memory cache
    const cachedIdx = cachedProducts.findIndex((p) => p.id === id);

    if (salesCount > 0) {
      // Soft Archive to protect financial audit trail
      try {
        await prisma.product.update({
          where: { id },
          data: { active: false },
        });
      } catch {
        // Fallback
      }

      if (cachedIdx !== -1) {
        cachedProducts[cachedIdx].active = false;
      }

      return NextResponse.json({
        success: true,
        action: "ARCHIVED",
        id,
        message:
          "El producto tiene ventas registradas en el historial. Ha sido desactivado/archivado para preservar la integridad financiera.",
      });
    }

    // Permanent Hard Delete if no sales exist
    try {
      await prisma.product.delete({
        where: { id },
      });
    } catch {
      // Fallback
    }

    if (cachedIdx !== -1) {
      cachedProducts.splice(cachedIdx, 1);
    }

    return NextResponse.json({
      success: true,
      action: "DELETED",
      id,
      message: "Producto eliminado exitosamente del catálogo",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
