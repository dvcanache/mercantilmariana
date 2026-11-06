"use client";

import React, { useState } from "react";
import { Search, Calendar, DollarSign, X } from "lucide-react";

export interface SaleTransactionItem {
  id: string;
  date: string;
  paymentMethod: string;
  productName: string;
  invoiceNumber?: string;
  quantity: number;
  unitSalePriceUsd: number;
  unitCostUsd: number;
  totalSaleUsd: number;
  unitMarginUsd: number;
  totalMarginUsd: number;
}

interface SalesHistoryTableProps {
  sales: SaleTransactionItem[];
}

export const SalesHistoryTable: React.FC<SalesHistoryTableProps> = ({ sales }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("TODOS");

  const methods = [
    "TODOS",
    "DIVISAS_EFECTIVO",
    "PUNTO_VENTA_BS",
    "PAGO_MOVIL",
    "ZELLE",
    "TRANSFERENCIA",
  ];

  const formatMethod = (m: string) => {
    switch (m) {
      case "DIVISAS_EFECTIVO":
        return "Divisas Efectivo";
      case "PUNTO_VENTA_BS":
        return "Punto de Venta";
      case "PAGO_MOVIL":
        return "Pago Móvil";
      case "ZELLE":
        return "Zelle";
      case "TRANSFERENCIA":
        return "Transferencia";
      default:
        return m;
    }
  };

  const filtered = sales.filter((s) => {
    const matchesMethod =
      selectedMethod === "TODOS" || s.paymentMethod === selectedMethod;
    const matchesSearch =
      s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.invoiceNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const totalRevenue = filtered.reduce((acc, curr) => acc + curr.totalSaleUsd, 0);
  const totalProfit = filtered.reduce((acc, curr) => acc + curr.totalMarginUsd, 0);

  return (
    <div className="bg-white border border-win10-border flex flex-col h-full shadow-sm">
      {/* Toolbar - Responsive Layout */}
      <div className="p-2.5 sm:p-3 bg-[#F9FAFB] border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por producto o factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-7 h-9 text-xs border border-gray-300 focus:outline-none focus:border-excel-mediumGreen bg-white rounded"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-700"
              title="Limpiar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-700 font-bold text-xs hidden xs:inline">Pago:</span>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="border border-gray-300 px-2.5 h-8 sm:h-9 text-xs focus:outline-none focus:border-excel-mediumGreen bg-white font-medium rounded"
            >
              {methods.map((m) => (
                <option key={m} value={m}>
                  {m === "TODOS" ? "Todos los métodos" : formatMethod(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Totals Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 font-mono text-excel-darkGreen font-bold bg-excel-lightSage px-2 py-1 border border-excel-mediumGreen/40 rounded text-[11px]">
              <DollarSign className="w-3 h-3" />
              <span>$ {totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-auto flex-1 max-h-[calc(100vh-250px)]">
        <table className="win-table">
          <thead>
            <tr>
              <th className="charcoal">FECHA</th>
              <th className="charcoal">FORMA DE PAGO</th>
              <th className="charcoal">PRODUCTO</th>
              <th className="charcoal">N° FACTURA</th>
              <th className="numeric">CANTIDAD</th>
              <th className="numeric">PRECIO VENTA ($)</th>
              <th className="numeric">COSTO UNIT. ($)</th>
              <th className="numeric">TOTAL VENTA ($)</th>
              <th className="numeric">MARGEN UNIT. ($)</th>
              <th className="numeric bg-excel-mediumGreen text-white">MARGEN TOTAL ($)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-400">
                  No hay transacciones registradas con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono text-gray-600">
                    {s.date ? s.date.substring(0, 10) : "-"}
                  </td>
                  <td>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700 border border-gray-300">
                      {formatMethod(s.paymentMethod)}
                    </span>
                  </td>
                  <td className="font-medium text-gray-900">{s.productName}</td>
                  <td className="font-mono text-gray-500">{s.invoiceNumber || "-"}</td>
                  <td className="numeric font-mono font-semibold">{s.quantity}</td>
                  <td className="numeric font-mono">$ {s.unitSalePriceUsd}</td>
                  <td className="numeric font-mono text-gray-500">$ {s.unitCostUsd}</td>
                  <td className="numeric font-mono font-bold text-excel-darkGreen">
                    $ {s.totalSaleUsd.toLocaleString()}
                  </td>
                  <td className="numeric font-mono text-emerald-700">
                    $ {s.unitMarginUsd}
                  </td>
                  <td className="numeric font-mono font-bold text-excel-darkGreen bg-excel-lightSage/50">
                    $ {s.totalMarginUsd.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
