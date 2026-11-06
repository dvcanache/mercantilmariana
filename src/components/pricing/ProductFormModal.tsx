"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Package, DollarSign, Calculator, AlertCircle } from "lucide-react";
import {
  calculateProductPricing,
  ExchangeRates,
  CalculatedPricingOutput,
} from "@/lib/pricing-engine";
import { ProductFormData } from "@/lib/types/product";

interface ProductFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: ProductFormData | null;
  existingCategories?: string[];
  exchangeRates: ExchangeRates;
  onClose: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  existingCategories = [],
  exchangeRates,
  onClose,
  onSave,
}) => {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [supplierCostUsd, setSupplierCostUsd] = useState<number | string>(100);
  const [targetMarginPercentage, setTargetMarginPercentage] = useState<number | string>(35);
  const [unitOfMeasure, setUnitOfMeasure] = useState("Unidad");
  const [currentStock, setCurrentStock] = useState<number | string>(0);
  const [active, setActive] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (mode === "edit" && initialData) {
        setSku(initialData.sku || "");
        setName(initialData.name || "");
        const cat = initialData.category || "General";
        if (existingCategories.includes(cat)) {
          setCategory(cat);
          setIsCustomCategory(false);
        } else {
          setCategory("__CUSTOM__");
          setIsCustomCategory(true);
          setCustomCategory(cat);
        }
        setBrand(initialData.brand || "");
        setModel(initialData.model || "");
        setSupplierCostUsd(initialData.supplierCostUsd ?? 100);
        setTargetMarginPercentage(
          initialData.targetMarginPercentage !== undefined
            ? Math.round(initialData.targetMarginPercentage * 100)
            : 35
        );
        setUnitOfMeasure(initialData.unitOfMeasure || "Unidad");
        setCurrentStock(initialData.currentStock ?? 0);
        setActive(initialData.active !== undefined ? initialData.active : true);
      } else {
        // Reset for create
        setSku("");
        setName("");
        setCategory(existingCategories[0] || "General");
        setIsCustomCategory(false);
        setCustomCategory("");
        setBrand("");
        setModel("");
        setSupplierCostUsd(50);
        setTargetMarginPercentage(35);
        setUnitOfMeasure("Unidad");
        setCurrentStock(0);
        setActive(true);
      }
    }
  }, [isOpen, mode, initialData, existingCategories]);

  // Live price preview calculation
  const livePricing: CalculatedPricingOutput | null = useMemo(() => {
    const cost = Number(supplierCostUsd);
    const marginPct = Number(targetMarginPercentage) / 100;
    if (isNaN(cost) || cost <= 0 || isNaN(marginPct) || marginPct < 0 || marginPct > 1) {
      return null;
    }
    try {
      return calculateProductPricing(
        { supplierCostUsd: cost, targetMarginPercentage: marginPct },
        exchangeRates
      );
    } catch {
      return null;
    }
  }, [supplierCostUsd, targetMarginPercentage, exchangeRates]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanSku = sku.trim().toUpperCase();
    const cleanName = name.trim();
    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    const cost = Number(supplierCostUsd);
    const margin = Number(targetMarginPercentage) / 100;
    const stock = Number(currentStock);

    if (!cleanSku) {
      setErrorMsg("El código SKU es obligatorio");
      return;
    }
    if (!cleanName) {
      setErrorMsg("El nombre del producto es obligatorio");
      return;
    }
    if (!finalCategory) {
      setErrorMsg("Debe especificar una categoría");
      return;
    }
    if (isNaN(cost) || cost <= 0) {
      setErrorMsg("El costo del proveedor en USD debe ser un número mayor a cero");
      return;
    }
    if (isNaN(margin) || margin < 0 || margin > 1) {
      setErrorMsg("El margen de contribución debe estar entre 0% y 100%");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        id: mode === "edit" ? initialData?.id : undefined,
        sku: cleanSku,
        name: cleanName,
        category: finalCategory,
        brand: brand.trim(),
        model: model.trim(),
        supplierCostUsd: cost,
        targetMarginPercentage: margin,
        unitOfMeasure: unitOfMeasure.trim() || "Unidad",
        currentStock: isNaN(stock) ? 0 : stock,
        active,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error al guardar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm select-none p-3 overflow-y-auto">
      {/* Windows 10 Dialog Window */}
      <div className="w-full max-w-2xl bg-white border border-gray-400 shadow-win10Modal overflow-hidden animate-in fade-in zoom-in-95 duration-100 my-auto max-h-[90vh] flex flex-col">
        {/* Title Bar */}
        <div className="h-8 bg-excel-darkGreen text-white flex items-center justify-between px-3 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5" />
            <span>
              {mode === "create"
                ? "Nuevo Producto — Registro en Catálogo"
                : `Editar Producto — [${sku}] ${name}`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="win-ctrl-btn close -mr-3"
            title="Cerrar"
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 rounded-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Basic Identifiers */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Código SKU *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: COL-01, ELEC-042"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full h-8 px-2.5 text-xs border border-gray-300 focus:border-excel-mediumGreen focus:ring-1 focus:ring-excel-mediumGreen outline-none font-mono uppercase bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Colchón Queen Size Pillow Top"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs border border-gray-300 focus:border-excel-mediumGreen focus:ring-1 focus:ring-excel-mediumGreen outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Categoría *
                </label>
                {!isCustomCategory ? (
                  <div className="flex gap-1.5">
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === "__NEW__") {
                          setIsCustomCategory(true);
                          setCustomCategory("");
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full h-8 px-2 text-xs border border-gray-300 focus:border-excel-mediumGreen focus:ring-1 focus:ring-excel-mediumGreen outline-none bg-white"
                    >
                      {existingCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__NEW__">＋ Nueva Categoría...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Escriba nueva categoría"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full h-8 px-2 text-xs border border-gray-300 focus:border-excel-mediumGreen outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomCategory(false)}
                      className="px-2 text-xs text-gray-600 bg-gray-100 border border-gray-300 hover:bg-gray-200"
                    >
                      Volver
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Marca
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Simmons, Mabe"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full h-8 px-2 text-xs border border-gray-300 focus:border-excel-mediumGreen outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Modelo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 2024, No Frost"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-8 px-2 text-xs border border-gray-300 focus:border-excel-mediumGreen outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Financial & Inventory Parameters */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Costo Proveedor ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-bold text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={supplierCostUsd}
                    onChange={(e) => setSupplierCostUsd(e.target.value)}
                    className="w-full h-8 pl-6 pr-2.5 text-xs border border-gray-300 focus:border-excel-mediumGreen focus:ring-1 focus:ring-excel-mediumGreen outline-none font-mono font-bold bg-white text-emerald-950"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                    Margen de Contribución (%) *
                  </label>
                  <span className="text-xs font-bold text-excel-darkGreen">
                    {targetMarginPercentage}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="1"
                    value={targetMarginPercentage}
                    onChange={(e) => setTargetMarginPercentage(Number(e.target.value))}
                    className="flex-1 accent-excel-mediumGreen cursor-pointer"
                  />
                  <div className="relative w-16">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={targetMarginPercentage}
                      onChange={(e) => setTargetMarginPercentage(e.target.value)}
                      className="w-full h-8 pr-5 pl-2 text-xs text-right border border-gray-300 focus:border-excel-mediumGreen outline-none font-bold"
                    />
                    <span className="absolute right-2 top-2 text-xs text-gray-400 font-bold">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Unidad de Medida
                  </label>
                  <select
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="w-full h-8 px-2 text-xs border border-gray-300 focus:border-excel-mediumGreen outline-none bg-white"
                  >
                    <option value="Unidad">Unidad</option>
                    <option value="Juego">Juego</option>
                    <option value="Caja">Caja</option>
                    <option value="Par">Par</option>
                    <option value="Docena">Docena</option>
                    <option value="Metro">Metro</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full h-8 px-2 text-xs border border-gray-300 focus:border-excel-mediumGreen outline-none bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-excel-mediumGreen rounded border-gray-300 focus:ring-excel-mediumGreen"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    Producto Activo (visible en catálogo público y ventas)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Live Bi-Monetary Pricing Preview */}
          <div className="p-3 bg-[#F4F8F4] border border-[#C5DAC5] rounded-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-excel-darkGreen mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Cálculo Automático en Tiempo Real (Tasas BCV & Reposición)</span>
            </div>

            {livePricing ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 border border-[#D5E5D5]">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold">
                    Costo Ajustado
                  </span>
                  <span className="text-sm font-bold text-gray-900 font-mono">
                    $ {livePricing.adjustedUnitCostUsd}
                  </span>
                </div>
                <div className="bg-white p-2 border border-[#D5E5D5]">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold">
                    Precio BCV ($)
                  </span>
                  <span className="text-sm font-bold text-excel-darkGreen font-mono">
                    $ {livePricing.bcvPriceUsd}
                  </span>
                </div>
                <div className="bg-white p-2 border border-[#D5E5D5]">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold">
                    Precio Venta (Bs.)
                  </span>
                  <span className="text-sm font-bold text-blue-900 font-mono">
                    Bs. {livePricing.salePriceBs.toLocaleString("es-VE")}
                  </span>
                </div>
                <div className="bg-white p-2 border border-[#D5E5D5]">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold">
                    Promo Divisas ($)
                  </span>
                  <span className="text-sm font-bold text-emerald-700 font-mono">
                    $ {livePricing.promoPriceUsd}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Ingrese un costo y margen válidos para ver la estimación de precios.
              </p>
            )}
          </div>

          {/* Dialog Footer Actions */}
          <div className="pt-2 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="win-btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="win-btn primary"
            >
              {isSubmitting
                ? "Guardando..."
                : mode === "create"
                ? "Registrar Producto"
                : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
