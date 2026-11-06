"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Filter, Printer, X, LayoutGrid, Table, RotateCcw, Tag } from "lucide-react";
import { ProductItem } from "@/components/pricing/PriceControlTable";
import { ExchangeRates, calculateProductPricing } from "@/lib/pricing-engine";

interface PublicPriceTableProps {
  products: ProductItem[];
  rates: ExchangeRates;
  onPrint?: () => void;
}

export const PublicPriceTable: React.FC<PublicPriceTableProps> = ({
  products,
  rates,
  onPrint,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [viewLayout, setViewLayout] = useState<"cards" | "table">("cards");

  const categories = Array.from(
    new Set(
      products.map((p) =>
        typeof p.category === "string" ? p.category : p.category?.name || "General"
      )
    )
  );

  const filtered = products
    .filter((p) => (p as any).active !== false)
    .filter((p) => {
      const catName =
        typeof p.category === "string" ? p.category : p.category?.name || "";
      const matchesCat =
        selectedCategory === "TODAS" || catName.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCat && matchesSearch;
    });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("TODAS");
  };

  return (
    <div className="bg-white border border-win10-border flex flex-col shadow-sm">
      {/* Header Banner for Customer Display View */}
      <div className="p-3 sm:p-4 bg-excel-darkGreen text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 no-print shadow-sm">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Prominent Official Logo in Price Catalog */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-md bg-white p-1 border-2 border-white/80 shadow-md shrink-0 flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="Mercantil Mariana Logo"
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div>
            <h2 className="text-xs sm:text-base md:text-lg font-extrabold tracking-wide uppercase text-white leading-tight">
              MERCANTIL MARIANA — LISTA DE PRECIOS
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-[11px] sm:text-xs">
              <span className="bg-emerald-800/90 border border-emerald-400/40 px-2 py-0.5 rounded text-emerald-100 font-semibold font-mono">
                Tasa BCV: Bs. {rates.officialBcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </span>
              <span className="bg-amber-800/90 border border-amber-400/40 px-1.5 py-0.5 rounded text-amber-100 font-semibold">
                Promo: {(rates.promoDiscountPercentage * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {onPrint && (
          <button
            onClick={onPrint}
            className="win-btn primary bg-excel-mediumGreen hover:bg-excel-darkGreen border-white/50 text-white font-bold h-8 sm:h-9 px-3 text-xs shadow-sm self-start sm:self-auto shrink-0"
            title="Imprimir Catálogo en papel o PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        )}
      </div>

      {/* Dedicated Executive Print Header (Only visible on paper printouts) */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-[#1E3B0F] pb-3 mb-4 p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded bg-white p-1 border border-gray-400 shrink-0">
            <Image
              src="/logo.jpg"
              alt="Mercantil Mariana Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase text-[#1E3B0F] tracking-wide">
              MERCANTIL MARIANA
            </h1>
            <p className="text-xs text-gray-700 font-bold uppercase">
              Lista Oficial de Precios al Consumidor
            </p>
          </div>
        </div>
        <div className="text-right text-xs space-y-0.5 font-mono">
          <p className="font-bold text-gray-900">
            Tasa Oficial BCV: Bs. {rates.officialBcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-600 font-sans">
            Fecha: {new Date().toLocaleDateString("es-VE")}
          </p>
        </div>
      </div>

      {/* Filter & Layout Toolbar (Responsive on Mobile) */}
      <div className="p-2.5 sm:p-3 bg-[#F9FAFB] border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs no-print">
        {/* Left: Search with Clear Button */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por producto, marca o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 h-9 text-xs border border-gray-300 focus:outline-none focus:border-excel-mediumGreen bg-white rounded"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Layout Switcher & Count */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          {/* View Toggle: Cards vs Table */}
          <div className="flex items-center bg-gray-200 p-0.5 rounded border border-gray-300">
            <button
              type="button"
              onClick={() => setViewLayout("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-all ${
                viewLayout === "cards"
                  ? "bg-excel-darkGreen text-white shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              title="Vista de tarjetas visuales"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tarjetas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewLayout("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-all ${
                viewLayout === "table"
                  ? "bg-excel-darkGreen text-white shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              title="Vista en tabla tradicional"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>

          <span className="text-gray-600 font-mono font-bold bg-gray-100 px-2.5 sm:px-3 py-1.5 border border-gray-200 rounded text-xs">
            {filtered.length} productos
          </span>
        </div>
      </div>

      {/* Category Pills Bar for Instant 1-Touch Filtering (Touch Swipeable) */}
      <div className="px-2.5 sm:px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none no-print">
        <span className="text-xs font-bold text-gray-500 mr-1 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Categorías:
        </span>
        <button
          type="button"
          onClick={() => setSelectedCategory("TODAS")}
          className={`px-3 py-1 text-xs rounded-full transition-all shrink-0 font-medium ${
            selectedCategory === "TODAS"
              ? "bg-excel-darkGreen text-white font-bold shadow-sm"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          Todas ({products.filter((p) => (p as any).active !== false).length})
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => {
            if ((p as any).active === false) return false;
            const cName = typeof p.category === "string" ? p.category : p.category?.name || "General";
            return cName.toLowerCase() === cat.toLowerCase();
          }).length;
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full transition-all shrink-0 font-medium ${
                isSelected
                  ? "bg-excel-darkGreen text-white font-bold shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Content Area: Cards or Table */}
      <div className="overflow-auto flex-1 max-h-[calc(100vh-250px)]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">No encontramos productos con ese nombre o categoría.</p>
            {(searchTerm || selectedCategory !== "TODAS") && (
              <button
                onClick={resetFilters}
                className="win-btn mt-3 text-xs h-8 px-3 font-medium inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mostrar todos los productos</span>
              </button>
            )}
          </div>
        ) : viewLayout === "cards" ? (
          /* Visual Cards Grid (Easy, non-complicated viewing for customers & clerks) */
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 no-print">
            {filtered.map((p) => {
              const pricing =
                (p as any).pricing ||
                calculateProductPricing(
                  {
                    supplierCostUsd: p.supplierCostUsd || 0,
                    targetMarginPercentage: p.targetMarginPercentage || 0.35,
                  },
                  rates
                );

              const catName =
                typeof p.category === "string"
                  ? p.category
                  : p.category?.name || "General";

              return (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between hover:border-excel-mediumGreen"
                >
                  <div>
                    {/* Top Meta: SKU & Category */}
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="font-mono text-gray-500 font-bold">{p.sku}</span>
                      <span className="bg-emerald-50 text-excel-darkGreen font-semibold px-2 py-0.5 rounded border border-emerald-200">
                        {catName}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                      {p.name}
                    </h3>

                    {/* Brand & Model */}
                    {(p.brand || p.model) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {[p.brand, p.model].filter(Boolean).join(" • ")}
                      </p>
                    )}
                  </div>

                  {/* Pricing Badges */}
                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                    {/* Official Price in Bolívares */}
                    <div className="bg-emerald-50/70 border border-emerald-300 rounded p-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-excel-darkGreen uppercase">
                        Precio en Bs:
                      </span>
                      <span className="text-base font-black text-excel-darkGreen font-mono">
                        Bs. {pricing.salePriceBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Official Price in USD BCV */}
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-gray-600 font-semibold">Tasa Oficial ($):</span>
                      <span className="font-bold text-gray-900 font-mono text-sm">
                        $ {pricing.bcvPriceUsd}
                      </span>
                    </div>

                    {/* Promo Cash Price */}
                    <div className="flex items-center justify-between text-xs px-1 text-amber-900 bg-amber-50/70 p-1.5 rounded border border-amber-200">
                      <span className="font-semibold">Promo Efectivo:</span>
                      <span className="font-black font-mono">
                        $ {pricing.promoPriceUsd}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View for Users who want a compact list */
          <table className="win-table no-print">
            <thead>
              <tr>
                <th className="charcoal">PRODUCTOS</th>
                <th className="charcoal">CATEGORÍA</th>
                <th className="charcoal">MARCA</th>
                <th className="charcoal">MODELO</th>
                <th className="numeric bg-excel-darkGreen text-white">PRECIO BCV ($)</th>
                <th className="numeric bg-excel-mediumGreen text-white">PRECIO VENTA (Bolívares)</th>
                <th className="numeric bg-[#B45309] text-white">PROMO DIVISAS ($)</th>
                <th className="numeric bg-[#047857] text-white">
                  PROMO DIVISAS 2 ({(rates.promoDiscountPercentage * 100).toFixed(0)}%)
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const pricing =
                  (p as any).pricing ||
                  calculateProductPricing(
                    {
                      supplierCostUsd: p.supplierCostUsd || 0,
                      targetMarginPercentage: p.targetMarginPercentage || 0.35,
                    },
                    rates
                  );

                const catName =
                  typeof p.category === "string"
                    ? p.category
                    : p.category?.name || "General";

                return (
                  <tr key={p.id} className="hover:bg-[#EBF1F5] transition-colors">
                    <td className="font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{p.name}</span>
                        {p.sku && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            SKU: {p.sku}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-gray-600">{catName}</td>
                    <td className="text-gray-600">{p.brand}</td>
                    <td className="text-gray-600">{p.model}</td>
                    <td className="numeric font-mono font-bold text-gray-900 bg-gray-50/80">
                      $ {pricing.bcvPriceUsd}
                    </td>
                    <td className="numeric font-mono font-extrabold text-excel-darkGreen bg-excel-lightSage/60 text-xs">
                      Bs. {pricing.salePriceBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="numeric font-mono font-bold text-amber-950 bg-amber-50">
                      $ {pricing.promoPriceUsd}
                    </td>
                    <td className="numeric font-mono font-bold text-emerald-950 bg-emerald-50">
                      $ {pricing.promoPriceUsd2}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Print-Only Table (Always clean and formatted for paper) */}
        <table className="win-table hidden print:table w-full">
          <thead>
            <tr>
              <th className="charcoal">PRODUCTOS</th>
              <th className="charcoal">CATEGORÍA</th>
              <th className="charcoal">MARCA / MODELO</th>
              <th className="numeric bg-excel-darkGreen text-white">PRECIO ($ BCV)</th>
              <th className="numeric bg-excel-mediumGreen text-white">PRECIO VENTA (Bs.)</th>
              <th className="numeric bg-[#B45309] text-white">PROMO EFECTIVO ($)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const pricing =
                (p as any).pricing ||
                calculateProductPricing(
                  {
                    supplierCostUsd: p.supplierCostUsd || 0,
                    targetMarginPercentage: p.targetMarginPercentage || 0.35,
                  },
                  rates
                );

              const catName =
                typeof p.category === "string"
                  ? p.category
                  : p.category?.name || "General";

              return (
                <tr key={`print_${p.id}`}>
                  <td className="font-bold text-gray-900">{p.name}</td>
                  <td className="text-gray-700">{catName}</td>
                  <td className="text-gray-600">{[p.brand, p.model].filter(Boolean).join(" ")}</td>
                  <td className="numeric font-mono font-bold">$ {pricing.bcvPriceUsd}</td>
                  <td className="numeric font-mono font-extrabold text-excel-darkGreen">
                    Bs. {pricing.salePriceBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="numeric font-mono font-bold">$ {pricing.promoPriceUsd}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
