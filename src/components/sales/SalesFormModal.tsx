"use client";

import React, { useState, useEffect } from "react";
import { X, Save, ShoppingCart } from "lucide-react";
import { ExchangeRates, calculateProductPricing } from "@/lib/pricing-engine";
import { ProductItem } from "@/components/pricing/PriceControlTable";

interface SalesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  rates: ExchangeRates;
  onSubmitSale: (sale: {
    date: string;
    paymentMethod: string;
    productId: string;
    invoiceNumber?: string;
    quantity: number;
    unitSalePriceUsd: number;
    unitCostUsd: number;
    totalSaleUsd: number;
    unitMarginUsd: number;
    totalMarginUsd: number;
  }) => Promise<void>;
}

export const SalesFormModal: React.FC<SalesFormModalProps> = ({
  isOpen,
  onClose,
  products,
  rates,
  onSubmitSale,
}) => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("DIVISAS_EFECTIVO");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unitSalePrice, setUnitSalePrice] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activeProducts = products.filter((p: any) => p.active !== false);

  // Set default product when products load
  useEffect(() => {
    if (activeProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(activeProducts[0].id);
    }
  }, [activeProducts, selectedProductId]);

  // Recalculate price and cost when product or payment method changes
  useEffect(() => {
    const product = products.find((p) => p.id === selectedProductId);
    if (product) {
      const pricing = calculateProductPricing(
        {
          supplierCostUsd: product.supplierCostUsd,
          targetMarginPercentage: product.targetMarginPercentage,
        },
        rates
      );
      setUnitCost(pricing.adjustedUnitCostUsd);

      // Auto-set suggested price based on payment method
      if (paymentMethod === "DIVISAS_EFECTIVO") {
        setUnitSalePrice(pricing.promoPriceUsd || pricing.bcvPriceUsd);
      } else {
        setUnitSalePrice(pricing.bcvPriceUsd);
      }
    }
  }, [selectedProductId, paymentMethod, products, rates]);

  if (!isOpen) return null;

  const totalSale = Math.round(quantity * unitSalePrice * 100) / 100;
  const unitMargin = Math.round((unitSalePrice - unitCost) * 100) / 100;
  const totalMargin = Math.round(quantity * unitMargin * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0 || unitSalePrice <= 0) {
      alert("Por favor complete todos los datos requeridos de la venta.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitSale({
        date: new Date(date).toISOString(),
        paymentMethod,
        productId: selectedProductId,
        invoiceNumber: invoiceNumber.trim() || undefined,
        quantity,
        unitSalePriceUsd: unitSalePrice,
        unitCostUsd: unitCost,
        totalSaleUsd: totalSale,
        unitMarginUsd: unitMargin,
        totalMarginUsd: totalMargin,
      });
      onClose();
    } catch (e: any) {
      alert("Error al registrar venta: " + (e?.message || e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm select-none p-4">
      <div className="w-full max-w-lg bg-white border border-gray-400 shadow-win10Modal overflow-hidden max-h-[90vh] flex flex-col">
        {/* Title Bar */}
        <div className="h-8 bg-excel-darkGreen text-white flex items-center justify-between px-3 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Módulo de Registro de Ventas — Nueva Transacción</span>
          </div>
          <button onClick={onClose} className="win-ctrl-btn close -mr-3">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Fecha de Transacción:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full border border-gray-300 p-1.5 text-xs focus:border-excel-mediumGreen focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Forma de Pago:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-gray-300 p-1.5 text-xs focus:border-excel-mediumGreen focus:outline-none"
              >
                <option value="DIVISAS_EFECTIVO">Divisas Efectivo</option>
                <option value="PUNTO_VENTA_BS">Punto de Venta (Bolívares)</option>
                <option value="PAGO_MOVIL">Pago Móvil / Transf.</option>
                <option value="ZELLE">Zelle</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Producto del Catálogo:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-gray-300 p-1.5 text-xs focus:border-excel-mediumGreen focus:outline-none"
            >
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.brand} {p.model})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                N° de Factura / Control (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ej. F-1045"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full border border-gray-300 p-1.5 text-xs focus:border-excel-mediumGreen focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Cantidad Vendida:
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                required
                className="w-full border border-gray-300 p-1.5 text-xs font-mono focus:border-excel-mediumGreen focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Precio de Venta Unitario ($):
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={unitSalePrice}
                onChange={(e) => setUnitSalePrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full border border-gray-300 p-1.5 text-xs font-mono font-bold text-excel-darkGreen focus:border-excel-mediumGreen focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Costo Unitario ($):
              </label>
              <input
                type="number"
                step="1"
                readOnly
                value={unitCost}
                className="w-full border border-gray-200 bg-gray-50 p-1.5 text-xs font-mono text-gray-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Computed Summary Box */}
          <div className="bg-excel-lightSage border border-excel-mediumGreen/40 p-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[10px] text-gray-600 uppercase block font-semibold">
                Total Venta ($)
              </span>
              <span className="text-sm font-bold font-mono text-excel-darkGreen">
                $ {totalSale.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-600 uppercase block font-semibold">
                Margen Unitario ($)
              </span>
              <span className="text-sm font-bold font-mono text-emerald-800">
                $ {unitMargin.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-600 uppercase block font-semibold">
                Margen Total ($)
              </span>
              <span className="text-sm font-bold font-mono text-excel-darkGreen">
                $ {totalMargin.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-gray-200 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="win-btn">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="win-btn primary"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Registrando..." : "Guardar Transacción"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
