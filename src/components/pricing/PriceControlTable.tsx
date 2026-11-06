"use client";

import React, { useState } from "react";
import {
  ExchangeRates,
  calculateProductPricing,
} from "@/lib/pricing-engine";
import {
  Search,
  Filter,
  Save,
  Check,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Package,
  X,
  Zap,
  BarChart2,
  RotateCcw,
  LayoutGrid,
  Table,
} from "lucide-react";
import { ProductFormModal } from "./ProductFormModal";
import { ProductFormData } from "@/lib/types/product";

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: { id?: string; code?: string; name: string } | string;
  brand: string;
  model: string;
  supplierCostUsd: number;
  targetMarginPercentage: number;
  unitOfMeasure?: string;
  currentStock?: number;
  active?: boolean;
}

interface PriceControlTableProps {
  products: ProductItem[];
  rates: ExchangeRates;
  onUpdateProduct?: (
    id: string,
    updates: Partial<ProductFormData>
  ) => Promise<void>;
  onCreateProduct?: (data: ProductFormData) => Promise<void>;
  onDeleteProduct?: (id: string) => Promise<void>;
  readOnly?: boolean;
}

export const PriceControlTable: React.FC<PriceControlTableProps> = ({
  products,
  rates,
  onUpdateProduct,
  onCreateProduct,
  onDeleteProduct,
  readOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [showArchived, setShowArchived] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editCost, setEditCost] = useState<number>(0);
  const [editMargin, setEditMargin] = useState<number>(0);
  const [savedRowId, setSavedRowId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"simple" | "detailed">("simple");
  const [mobileDisplay, setMobileDisplay] = useState<"cards" | "table">("cards");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<ProductFormData | null>(null);

  // Extract unique categories
  const categories = Array.from(
    new Set(
      products.map((p) =>
        typeof p.category === "string" ? p.category : p.category?.name || "General"
      )
    )
  );

  const filteredProducts = products.filter((p) => {
    // Archived filter
    if (!showArchived && p.active === false) {
      return false;
    }

    const catName =
      typeof p.category === "string" ? p.category : p.category?.name || "";
    const matchesCat =
      selectedCategory === "TODAS" || catName.toLowerCase() === selectedCategory.toLowerCase();

    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.model && p.model.toLowerCase().includes(query));

    return matchesCat && matchesSearch;
  });

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setModalMode("edit");
    const catName =
      typeof p.category === "string" ? p.category : p.category?.name || "General";
    setSelectedProduct({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: catName,
      brand: p.brand || "",
      model: p.model || "",
      supplierCostUsd: p.supplierCostUsd,
      targetMarginPercentage: p.targetMarginPercentage,
      unitOfMeasure: p.unitOfMeasure || "Unidad",
      currentStock: p.currentStock || 0,
      active: p.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleModalSave = async (data: ProductFormData) => {
    if (modalMode === "create") {
      if (onCreateProduct) {
        await onCreateProduct(data);
      }
    } else if (modalMode === "edit" && data.id) {
      if (onUpdateProduct) {
        await onUpdateProduct(data.id, data);
      }
    }
  };

  const startInlineEdit = (p: ProductItem) => {
    if (readOnly) return;
    setEditingRowId(p.id);
    setEditCost(p.supplierCostUsd);
    setEditMargin(p.targetMarginPercentage * 100);
  };

  const saveInlineEdit = async (id: string) => {
    if (!onUpdateProduct) return;
    await onUpdateProduct(id, {
      supplierCostUsd: editCost,
      targetMarginPercentage: editMargin / 100,
    });
    setEditingRowId(null);
    setSavedRowId(id);
    setTimeout(() => setSavedRowId(null), 2000);
  };

  const handleDelete = async (p: ProductItem) => {
    if (readOnly || !onDeleteProduct) return;
    const confirmMsg = `¿Está seguro de eliminar o archivar el producto "${p.name}" (${p.sku})?\n\nSi tiene ventas históricas asociadas, será archivado para proteger la contabilidad. Si no tiene ventas, será eliminado permanentemente.`;
    if (window.confirm(confirmMsg)) {
      await onDeleteProduct(p.id);
    }
  };

  const handleToggleActive = async (p: ProductItem) => {
    if (readOnly || !onUpdateProduct) return;
    await onUpdateProduct(p.id, {
      active: p.active === false ? true : false,
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("TODAS");
  };

  return (
    <div className="bg-white border border-win10-border flex flex-col h-full shadow-sm">
      {/* Primary Toolbar - Fully Responsive for Phone & Desktop */}
      <div className="p-2.5 sm:p-3 bg-[#F9FAFB] border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
        {/* Search Input with Clear Button */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por producto, código o marca..."
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

        {/* View Mode & Actions Row */}
        <div className="flex items-center flex-wrap justify-between sm:justify-end gap-2">
          {/* Mobile Display Toggle (Cards vs Table on small screens) */}
          <div className="flex sm:hidden items-center bg-gray-200 p-0.5 rounded border border-gray-300">
            <button
              type="button"
              onClick={() => setMobileDisplay("cards")}
              className={`p-1.5 rounded ${
                mobileDisplay === "cards" ? "bg-excel-darkGreen text-white" : "text-gray-700"
              }`}
              title="Ver tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileDisplay("table")}
              className={`p-1.5 rounded ${
                mobileDisplay === "table" ? "bg-excel-darkGreen text-white" : "text-gray-700"
              }`}
              title="Ver tabla"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Switcher (Simple vs Accounting) */}
          <div className="flex items-center bg-gray-200 p-0.5 rounded border border-gray-300">
            <button
              type="button"
              onClick={() => setViewMode("simple")}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded transition-all ${
                viewMode === "simple"
                  ? "bg-excel-darkGreen text-white shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              title="Modo fácil"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Sencilla</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("detailed")}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded transition-all ${
                viewMode === "detailed"
                  ? "bg-excel-darkGreen text-white shadow-sm"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              title="Modo contable completo"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Contable</span>
            </button>
          </div>

          {/* Archived Toggle */}
          <label className="flex items-center gap-1 text-gray-700 cursor-pointer select-none h-8 px-1.5 hover:bg-gray-100 rounded text-xs">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded text-excel-mediumGreen w-3.5 h-3.5"
            />
            <span className="hidden xs:inline">Archivados</span>
          </label>

          {/* Create Product Button */}
          {!readOnly && onCreateProduct && (
            <button
              onClick={openCreateModal}
              className="win-btn primary text-xs h-8 sm:h-9 px-3 font-bold shadow-sm"
              title="Registrar producto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar (Touch Swipeable on Phone) */}
      <div className="px-2.5 sm:px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-xs font-bold text-gray-500 mr-1 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Categorías:</span>
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
          Todas ({products.filter((p) => showArchived || p.active !== false).length})
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => {
            const cName = typeof p.category === "string" ? p.category : p.category?.name || "General";
            return cName.toLowerCase() === cat.toLowerCase() && (showArchived || p.active !== false);
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

      {/* Mobile Card View (Rendered on Phone when mobileDisplay === 'cards') */}
      <div className={`sm:hidden ${mobileDisplay === "cards" ? "block" : "hidden"} overflow-y-auto flex-1 p-2 space-y-2.5 max-h-[calc(100vh-270px)]`}>
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2 stroke-1" />
            <p className="font-semibold text-gray-700">No se encontraron productos.</p>
            <button
              onClick={resetFilters}
              className="win-btn mt-2 text-xs h-8 px-3"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isInlineEditing = editingRowId === p.id;
            const cost = isInlineEditing ? editCost : p.supplierCostUsd;
            const margin = isInlineEditing
              ? editMargin / 100
              : p.targetMarginPercentage;

            const pricing = calculateProductPricing(
              { supplierCostUsd: cost, targetMarginPercentage: margin },
              rates
            );

            const catName =
              typeof p.category === "string"
                ? p.category
                : p.category?.name || "General";

            const isArchived = p.active === false;

            return (
              <div
                key={`mob_${p.id}`}
                className={`bg-white border rounded p-3 shadow-sm ${
                  isArchived ? "opacity-75 border-gray-300 bg-gray-50" : "border-gray-200"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono font-bold text-gray-700">{p.sku}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded font-semibold border border-gray-200">
                      {catName}
                    </span>
                    {isArchived ? (
                      <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded font-bold">
                        Archivado
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        Activo
                      </span>
                    )}
                  </div>
                </div>

                {/* Name & Model */}
                <h4 className="font-bold text-gray-900 text-xs">{p.name}</h4>
                {(p.brand || p.model) && (
                  <p className="text-[11px] text-gray-500 mb-2">
                    {[p.brand, p.model].filter(Boolean).join(" • ")}
                  </p>
                )}

                {/* Price Display */}
                <div className="bg-excel-lightSage/40 border border-excel-mediumGreen/30 rounded p-2 my-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-excel-darkGreen uppercase block">
                      Precio Oficial Bs:
                    </span>
                    <span className="font-mono font-black text-excel-darkGreen text-sm">
                      Bs. {pricing.salePriceBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-600 uppercase block">
                      Precio BCV ($):
                    </span>
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      $ {pricing.bcvPriceUsd}
                    </span>
                  </div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-3 gap-1 text-[11px] text-gray-600 mb-2 bg-gray-50 p-1.5 rounded">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Costo</span>
                    <span className="font-mono font-bold text-gray-800">$ {p.supplierCostUsd}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase">Margen</span>
                    <span className="font-mono font-bold text-gray-800">{(p.targetMarginPercentage * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-amber-700 block uppercase">Promo $</span>
                    <span className="font-mono font-bold text-amber-900">$ {pricing.promoPriceUsd}</span>
                  </div>
                </div>

                {/* Inline Edit Form on Mobile */}
                {isInlineEditing && (
                  <div className="p-2 bg-emerald-50 border border-emerald-300 rounded my-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-gray-700 w-24">Costo ($):</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editCost}
                        onChange={(e) => setEditCost(parseFloat(e.target.value) || 0)}
                        className="w-full border border-excel-mediumGreen px-2 py-1 text-xs font-mono bg-white rounded"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-gray-700 w-24">Margen (%):</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="99"
                        value={editMargin}
                        onChange={(e) => setEditMargin(parseFloat(e.target.value) || 0)}
                        className="w-full border border-excel-mediumGreen px-2 py-1 text-xs font-mono bg-white rounded"
                      />
                    </div>
                    <button
                      onClick={() => saveInlineEdit(p.id)}
                      className="w-full win-btn primary h-8 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Ajuste</span>
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                {!readOnly && (
                  <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-gray-100">
                    <button
                      onClick={() => isInlineEditing ? saveInlineEdit(p.id) : startInlineEdit(p)}
                      className="win-btn text-xs h-7 px-2 font-medium"
                    >
                      {isInlineEditing ? "Cancelar" : "Ajustar"}
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-gray-600 hover:text-excel-darkGreen border border-gray-300 rounded"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(p)}
                      className="p-1.5 border rounded text-emerald-700 border-emerald-300 bg-emerald-50"
                      title="Pausar / Reactivar"
                    >
                      {isArchived ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    {onDeleteProduct && (
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-red-600 border border-red-200 rounded hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Grid Container (Shown on Desktop, or when mobileDisplay === 'table' on phone) */}
      <div className={`overflow-auto flex-1 max-h-[calc(100vh-250px)] ${mobileDisplay === "cards" ? "hidden sm:block" : "block"}`}>
        <table className="win-table">
          <thead>
            {viewMode === "simple" ? (
              /* Simple Mode Headers */
              <tr>
                <th className="charcoal w-28">CÓDIGO / SKU</th>
                <th className="charcoal">PRODUCTO</th>
                <th className="charcoal">CATEGORÍA</th>
                <th className="charcoal text-center w-24">ESTADO</th>
                <th className="charcoal numeric w-28">COSTO COMPRA ($)</th>
                <th className="charcoal numeric w-24">% MARGEN</th>
                <th className="numeric bg-excel-darkGreen text-white w-28">PRECIO ($ BCV)</th>
                <th className="numeric bg-excel-mediumGreen text-white w-36">PRECIO VENTA (Bs.)</th>
                <th className="numeric bg-[#B45309] text-white w-28">PROMO ($)</th>
                {!readOnly && <th className="charcoal text-center w-36">ACCIONES</th>}
              </tr>
            ) : (
              /* Detailed Accounting Mode Headers */
              <tr>
                <th className="charcoal">SKU</th>
                <th className="charcoal">PRODUCTOS</th>
                <th className="charcoal">ESTADO</th>
                <th className="charcoal numeric">PRECIO COMPRA ($)</th>
                <th className="charcoal">CATEGORÍA</th>
                <th className="charcoal">MARCA</th>
                <th className="charcoal">MODELO</th>
                <th className="numeric">FACTOR CAMBIO</th>
                <th className="numeric">COSTO UNIT. ($)</th>
                <th className="numeric">% MARGEN</th>
                <th className="numeric">PRECIO BCV ($)</th>
                <th className="numeric">PRECIO VENTA (Bs.)</th>
                <th className="numeric">MARGEN BRUTO (Bs.)</th>
                <th className="numeric bg-[#D97706] text-white">PROMO DIVISAS ($)</th>
                <th className="numeric bg-[#00A758] text-white">PROMO 2 (6%) ($)</th>
                <th className="numeric">MARGEN PROMO ($)</th>
                {!readOnly && <th className="charcoal text-center min-w-[130px]">ACCIONES</th>}
              </tr>
            )}
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={viewMode === "simple" ? (readOnly ? 9 : 10) : (readOnly ? 16 : 17)}
                  className="text-center py-12 text-gray-500 text-xs"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="w-8 h-8 text-gray-400 stroke-1" />
                    <p className="font-semibold text-gray-700">
                      No se encontraron productos que coincidan con la búsqueda o filtro seleccionado.
                    </p>
                    {(searchTerm || selectedCategory !== "TODAS") && (
                      <button
                        onClick={resetFilters}
                        className="win-btn mt-2 text-xs h-8 px-3 font-medium flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restablecer búsqueda y filtros</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const isInlineEditing = editingRowId === p.id;
                const cost = isInlineEditing ? editCost : p.supplierCostUsd;
                const margin = isInlineEditing
                  ? editMargin / 100
                  : p.targetMarginPercentage;

                const pricing = calculateProductPricing(
                  { supplierCostUsd: cost, targetMarginPercentage: margin },
                  rates
                );

                const catName =
                  typeof p.category === "string"
                    ? p.category
                    : p.category?.name || "General";

                const isArchived = p.active === false;

                if (viewMode === "simple") {
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        savedRowId === p.id
                          ? "bg-excel-lightSage"
                          : isArchived
                          ? "bg-gray-50 opacity-70"
                          : "hover:bg-[#EBF1F5]"
                      }`}
                    >
                      <td className="font-mono text-gray-700 font-bold text-xs">
                        {p.sku}
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-xs">{p.name}</span>
                          {(p.brand || p.model) && (
                            <span className="text-[11px] text-gray-500">
                              {[p.brand, p.model].filter(Boolean).join(" • ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium border border-gray-200">
                          {catName}
                        </span>
                      </td>
                      <td className="text-center">
                        {isArchived ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700 border border-gray-300">
                            <EyeOff className="w-2.5 h-2.5" />
                            Archivado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Eye className="w-2.5 h-2.5" />
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="numeric font-mono font-semibold">
                        {isInlineEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editCost}
                            onChange={(e) =>
                              setEditCost(parseFloat(e.target.value) || 0)
                            }
                            className="w-20 border border-excel-mediumGreen px-1.5 py-0.5 text-right font-mono text-xs bg-white"
                          />
                        ) : (
                          `$ ${p.supplierCostUsd.toLocaleString()}`
                        )}
                      </td>
                      <td className="numeric font-mono">
                        {isInlineEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              step="1"
                              min="0"
                              max="99"
                              value={editMargin}
                              onChange={(e) =>
                                setEditMargin(parseFloat(e.target.value) || 0)
                              }
                              className="w-14 border border-excel-mediumGreen px-1 py-0.5 text-right font-mono text-xs bg-white"
                            />
                            <span>%</span>
                          </div>
                        ) : (
                          `${(p.targetMarginPercentage * 100).toFixed(0)}%`
                        )}
                      </td>
                      <td className="numeric font-mono font-bold text-gray-900 bg-gray-50/80">
                        $ {pricing.bcvPriceUsd}
                      </td>
                      <td className="numeric font-mono font-extrabold text-excel-darkGreen bg-excel-lightSage/50 text-xs">
                        Bs. {pricing.salePriceBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="numeric font-mono font-bold text-amber-900 bg-amber-50">
                        $ {pricing.promoPriceUsd}
                      </td>
                      {!readOnly && (
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {isInlineEditing ? (
                              <button
                                onClick={() => saveInlineEdit(p.id)}
                                className="win-btn primary text-[11px] py-1 px-2 h-7"
                                title="Guardar ajuste"
                              >
                                <Save className="w-3 h-3" />
                                <span>Listo</span>
                              </button>
                            ) : savedRowId === p.id ? (
                              <span className="text-excel-vibrant font-bold flex items-center justify-center gap-1 text-[11px]">
                                <Check className="w-3 h-3" />
                                <span>Guardado</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => startInlineEdit(p)}
                                className="win-btn text-[11px] py-1 px-2 h-7 font-medium"
                                title="Ajuste rápido"
                              >
                                Ajustar
                              </button>
                            )}

                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-gray-600 hover:text-excel-darkGreen hover:bg-gray-100 border border-gray-300 rounded"
                              title="Editar producto"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleActive(p)}
                              className={`p-1.5 border rounded ${
                                isArchived
                                  ? "text-gray-400 hover:text-emerald-700 border-gray-300"
                                  : "text-emerald-700 hover:text-gray-400 border-emerald-300 bg-emerald-50"
                              }`}
                              title={isArchived ? "Reactivar" : "Pausar"}
                            >
                              {isArchived ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {onDeleteProduct && (
                              <button
                                onClick={() => handleDelete(p)}
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                }

                /* Detailed Mode Row */
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      savedRowId === p.id
                        ? "bg-excel-lightSage"
                        : isArchived
                        ? "bg-gray-50 opacity-70"
                        : "hover:bg-[#EBF1F5]"
                    }`}
                  >
                    <td className="font-mono text-gray-600 font-semibold text-[11px]">
                      {p.sku}
                    </td>
                    <td className="font-medium text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {p.currentStock !== undefined && p.currentStock <= 0 && (
                          <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.2 rounded font-bold">
                            Sin Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {isArchived ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700 border border-gray-300">
                          <EyeOff className="w-2.5 h-2.5" />
                          Archivado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Eye className="w-2.5 h-2.5" />
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="numeric font-semibold">
                      {isInlineEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editCost}
                          onChange={(e) =>
                            setEditCost(parseFloat(e.target.value) || 0)
                          }
                          className="w-16 border border-excel-mediumGreen px-1 py-0.5 text-right font-mono text-xs"
                        />
                      ) : (
                        `$ ${p.supplierCostUsd.toLocaleString()}`
                      )}
                    </td>
                    <td className="text-gray-600">{catName}</td>
                    <td className="text-gray-600">{p.brand}</td>
                    <td className="text-gray-600">{p.model}</td>
                    <td className="numeric font-mono text-gray-500 bg-gray-50">
                      {pricing.factor.toFixed(4)}
                    </td>
                    <td className="numeric font-mono font-bold text-gray-700 bg-excel-lightSage/50">
                      $ {pricing.adjustedUnitCostUsd}
                    </td>
                    <td className="numeric">
                      {isInlineEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="99"
                            value={editMargin}
                            onChange={(e) =>
                              setEditMargin(parseFloat(e.target.value) || 0)
                            }
                            className="w-12 border border-excel-mediumGreen px-1 py-0.5 text-right font-mono text-xs"
                          />
                          <span>%</span>
                        </div>
                      ) : (
                        `${(p.targetMarginPercentage * 100).toFixed(0)}%`
                      )}
                    </td>
                    <td className="numeric font-mono font-bold text-gray-900 bg-gray-50/80">
                      $ {pricing.bcvPriceUsd}
                    </td>
                    <td className="numeric font-mono font-extrabold text-excel-darkGreen bg-excel-lightSage/60">
                      {pricing.salePriceBs.toLocaleString("es-VE")} Bs.
                    </td>
                    <td className="numeric font-mono text-gray-700">
                      {pricing.grossMarginBs.toLocaleString("es-VE")} Bs.
                    </td>
                    <td className="numeric font-mono font-bold text-amber-950 bg-amber-50">
                      $ {pricing.promoPriceUsd}
                    </td>
                    <td className="numeric font-mono font-bold text-emerald-950 bg-emerald-50">
                      $ {pricing.promoPriceUsd2}
                    </td>
                    <td className="numeric font-mono text-emerald-800">
                      $ {pricing.grossMarginPromoUsd}
                    </td>
                    {!readOnly && (
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isInlineEditing ? (
                            <button
                              onClick={() => saveInlineEdit(p.id)}
                              className="win-btn primary text-[11px] py-0.5 px-1.5 h-6"
                            >
                              <Save className="w-3 h-3" />
                              <span>Listo</span>
                            </button>
                          ) : savedRowId === p.id ? (
                            <span className="text-excel-vibrant font-bold flex items-center justify-center gap-1 text-[11px]">
                              <Check className="w-3 h-3" />
                              <span>Guardado</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => startInlineEdit(p)}
                              className="win-btn text-[11px] py-0.5 px-1.5 h-6"
                            >
                              Ajustar
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1 text-gray-600 hover:text-excel-darkGreen border border-gray-300 rounded-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleActive(p)}
                            className={`p-1 border rounded-sm ${
                              isArchived
                                ? "text-gray-400 border-gray-300"
                                : "text-emerald-700 border-emerald-300 bg-emerald-50"
                            }`}
                          >
                            {isArchived ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {onDeleteProduct && (
                            <button
                              onClick={() => handleDelete(p)}
                              className="p-1 text-red-600 hover:text-red-800 border border-red-200 rounded-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal (Create & Edit) */}
      <ProductFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedProduct}
        existingCategories={categories}
        exchangeRates={rates}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
      />
    </div>
  );
};
