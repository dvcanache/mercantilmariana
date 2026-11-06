import { CalculatedPricingOutput } from "@/lib/pricing-engine";

export interface ProductCategory {
  id?: string;
  code?: string;
  name: string;
  suggestedMargin?: number;
}

export interface ProductFormData {
  id?: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  supplierCostUsd: number;
  targetMarginPercentage: number;
  unitOfMeasure?: string;
  currentStock?: number;
  active?: boolean;
}

export interface ManagedProduct {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory | string;
  brand: string;
  model: string;
  supplierCostUsd: number | null;
  targetMarginPercentage: number | null;
  unitOfMeasure: string;
  currentStock: number;
  active: boolean;
  pricing?: CalculatedPricingOutput;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface DeleteProductResponse {
  success: boolean;
  action: "DELETED" | "ARCHIVED";
  id: string;
  message: string;
}
