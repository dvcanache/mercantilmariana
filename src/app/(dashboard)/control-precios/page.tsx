"use client";

import React, { useEffect, useState } from "react";
import { PriceControlTable, ProductItem } from "@/components/pricing/PriceControlTable";
import { ExchangeRates, calculateProductPricing } from "@/lib/pricing-engine";
import { ProductFormData } from "@/lib/types/product";
import defaultSeedData from "@/data/seed-data.json";

export default function ControlPreciosPage() {
  const [products, setProducts] = useState<ProductItem[]>(() =>
    (defaultSeedData.products as any[]).map((p, idx) => ({
      ...p,
      id: `prod_${idx + 1}`,
    }))
  );
  const [rates, setRates] = useState<ExchangeRates>(defaultSeedData.rates);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  const showNotification = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    async function load() {
      try {
        const [resProds, resRates] = await Promise.all([
          fetch("/api/products?includeArchived=true"),
          fetch("/api/rates"),
        ]);
        if (resProds.ok) {
          const p = await resProds.json();
          if (Array.isArray(p) && p.length > 0) setProducts(p);
        }
        if (resRates.ok) {
          const r = await resRates.json();
          if (r.rates) setRates(r.rates);
        }
      } catch {
        // Fallback to seed data
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreateProduct = async (data: ProductFormData) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo registrar el producto");
      }

      const created = await res.json();
      const newProductItem: ProductItem = {
        id: created.id,
        sku: created.sku,
        name: created.name,
        category: created.category,
        brand: created.brand,
        model: created.model,
        supplierCostUsd: Number(created.supplierCostUsd),
        targetMarginPercentage: Number(created.targetMarginPercentage),
        unitOfMeasure: created.unitOfMeasure,
        currentStock: Number(created.currentStock),
        active: created.active !== false,
      };

      setProducts((prev) => [newProductItem, ...prev]);
      showNotification(`Producto "${created.name}" (${created.sku}) agregado exitosamente al catálogo.`);
    } catch (err: any) {
      showNotification(err?.message || "Error al crear producto", "error");
      throw err;
    }
  };

  const handleUpdateProduct = async (
    id: string,
    updates: Partial<ProductFormData>
  ) => {
    // Optimistic update
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              category: updates.category ? updates.category : item.category,
            }
          : item
      )
    );

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al actualizar producto");
      }

      showNotification("Producto actualizado correctamente.");
    } catch (err: any) {
      showNotification(err?.message || "Error al actualizar producto", "error");
    }
  };

  const handleDeleteProduct = async (id: string, force: boolean = false) => {
    try {
      const res = await fetch(`/api/products/${id}${force ? "?force=true" : ""}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al eliminar producto");
      }

      const data = await res.json();

      if (data.action === "ARCHIVED") {
        const wantForce = window.confirm(
          `El producto "${data.sku || id}" tiene ${data.salesCount || "varias"} ventas registradas y fue pausado/archivado para proteger las cuentas.\n\n¿Desea ELIMINARLO PERMANENTEMENTE borrando también sus ventas asociadas?`
        );
        if (wantForce) {
          return handleDeleteProduct(id, true);
        }
        setProducts((prev) =>
          prev.map((item) => (item.id === id || item.sku === data.sku ? { ...item, active: false } : item))
        );
        showNotification("Producto archivado y desactivado del catálogo activo.", "info");
      } else {
        setProducts((prev) => prev.filter((item) => item.id !== id && item.sku !== data.sku));
        showNotification(data.message || "Producto eliminado permanentemente del catálogo.");
      }
    } catch (err: any) {
      showNotification(err?.message || "Error al eliminar producto", "error");
    }
  };

  return (
    <div className="space-y-3">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-2.5 text-xs font-semibold rounded-sm border shadow-sm transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : notification.type === "info"
              ? "bg-blue-50 text-blue-800 border-blue-300"
              : "bg-red-50 text-red-800 border-red-300"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-win10-border p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tasa Oficial BCV</p>
            <p className="text-lg font-black text-excel-darkGreen font-mono mt-0.5">
              Bs. {rates.officialBcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400">Conversión obligatoria al consumidor</p>
          </div>
          <span className="w-10 h-10 rounded-full bg-emerald-50 text-excel-darkGreen border border-emerald-200 flex items-center justify-center font-bold text-base">
            $
          </span>
        </div>

        <div className="bg-white border border-win10-border p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tasa de Reposición</p>
            <p className="text-lg font-black text-gray-800 font-mono mt-0.5">
              Bs. {rates.supplierReplacementRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400">Base para compra de inventario</p>
          </div>
          <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
            Bs.
          </span>
        </div>

        <div className="bg-white border border-win10-border p-3.5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Catálogo Activo</p>
            <p className="text-lg font-black text-gray-900 font-mono mt-0.5">
              {products.filter((p) => p.active !== false).length} <span className="text-xs font-normal text-gray-500">de {products.length} productos</span>
            </p>
            <p className="text-[11px] text-gray-400">Descuento promocional: {(rates.promoDiscountPercentage * 100).toFixed(0)}%</p>
          </div>
          <span className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-xs">
            %
          </span>
        </div>
      </div>

      {/* Interactive Grid Table */}
      <PriceControlTable
        products={products}
        rates={rates}
        onUpdateProduct={handleUpdateProduct}
        onCreateProduct={handleCreateProduct}
        onDeleteProduct={handleDeleteProduct}
      />
    </div>
  );
}
