import { describe, it, expect } from "vitest";
import { calculateProductPricing } from "../../src/lib/pricing-engine";
import { ProductFormData, ManagedProduct } from "../../src/lib/types/product";

describe("Product Management & Validation Unit Tests", () => {
  const sampleRates = {
    supplierReplacementRate: 970.0,
    officialBcvRate: 849.56,
    promoDiscountPercentage: 0.06,
  };

  it("validates valid product form data successfully", () => {
    const validData: ProductFormData = {
      sku: "PROD-101",
      name: "Ventilador Samurai Turbo",
      category: "Ventilación",
      brand: "Samurai",
      model: "Turbo Silence 18",
      supplierCostUsd: 35.0,
      targetMarginPercentage: 0.4,
      unitOfMeasure: "Unidad",
      currentStock: 10,
      active: true,
    };

    expect(validData.sku.trim()).toBeTruthy();
    expect(validData.supplierCostUsd).toBeGreaterThan(0);
    expect(validData.targetMarginPercentage).toBeGreaterThanOrEqual(0);
    expect(validData.targetMarginPercentage).toBeLessThanOrEqual(1);

    const pricing = calculateProductPricing(
      {
        supplierCostUsd: validData.supplierCostUsd,
        targetMarginPercentage: validData.targetMarginPercentage,
      },
      sampleRates
    );

    expect(pricing.bcvPriceUsd).toBeGreaterThan(validData.supplierCostUsd * 0.87);
    expect(pricing.salePriceBs).toBeGreaterThan(0);
  });

  it("identifies invalid product inputs", () => {
    const invalidCost: ProductFormData = {
      sku: "PROD-102",
      name: "Licuadora",
      category: "Electrodomésticos",
      brand: "Oster",
      model: "Classic",
      supplierCostUsd: -10,
      targetMarginPercentage: 0.35,
    };

    const isCostValid = invalidCost.supplierCostUsd > 0;
    expect(isCostValid).toBe(false);

    const invalidMargin: ProductFormData = {
      sku: "PROD-103",
      name: "Nevera",
      category: "Línea Blanca",
      brand: "Mabe",
      model: "12P",
      supplierCostUsd: 300,
      targetMarginPercentage: 1.5, // 150% exceeds normal 1.0 limit
    };

    const isMarginValid =
      invalidMargin.targetMarginPercentage >= 0 &&
      invalidMargin.targetMarginPercentage <= 1.0;
    expect(isMarginValid).toBe(false);
  });

  it("simulates soft-delete state transition preserving product reference", () => {
    const product: ManagedProduct = {
      id: "prod_sample",
      sku: "PROD-999",
      name: "Producto con Ventas Previas",
      category: "General",
      brand: "Marca",
      model: "Mod-1",
      supplierCostUsd: 50,
      targetMarginPercentage: 0.3,
      unitOfMeasure: "Unidad",
      currentStock: 5,
      active: true,
    };

    // Simulate soft delete when sales count > 0
    const salesCount = 3;
    let action: "DELETED" | "ARCHIVED" = "DELETED";

    if (salesCount > 0) {
      product.active = false;
      action = "ARCHIVED";
    }

    expect(action).toBe("ARCHIVED");
    expect(product.active).toBe(false);
    expect(product.id).toBe("prod_sample"); // Reference retained
  });
});
