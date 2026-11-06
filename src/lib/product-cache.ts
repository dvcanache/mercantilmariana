import seedData from "@/data/seed-data.json";

export interface CachedProductItem {
  id: string;
  sku: string;
  name: string;
  category: { id?: string; code?: string; name: string };
  brand: string;
  model: string;
  supplierCostUsd: number;
  targetMarginPercentage: number;
  unitOfMeasure: string;
  currentStock: number;
  active: boolean;
}

// Global cached products in memory for fallback/offline test environments
const globalForCache = globalThis as unknown as {
  cachedProducts?: CachedProductItem[];
};

export const cachedProducts: CachedProductItem[] =
  globalForCache.cachedProducts ||
  seedData.products.map((p, idx) => ({
    id: `prod_${idx + 1}`,
    sku: p.sku,
    name: p.name,
    category: { name: p.category },
    brand: p.brand,
    model: p.model,
    supplierCostUsd: p.supplierCostUsd,
    targetMarginPercentage: p.targetMarginPercentage,
    unitOfMeasure: p.unitOfMeasure,
    currentStock: p.currentStock,
    active: true,
  }));

if (process.env.NODE_ENV !== "production") {
  globalForCache.cachedProducts = cachedProducts;
}
