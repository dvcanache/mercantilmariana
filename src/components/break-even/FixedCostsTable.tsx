"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2, Check, DollarSign } from "lucide-react";

export interface FixedCostItem {
  id: string;
  concept: string;
  monthlyAmountUsd: number;
  active: boolean;
}

interface FixedCostsTableProps {
  items: FixedCostItem[];
  bcvRate: number;
  onUpdateCost?: (id: string, amount: number) => Promise<void>;
  onAddCost?: (concept: string, amount: number) => Promise<void>;
  onDeleteCost?: (id: string) => Promise<void>;
  readOnly?: boolean;
}

export const FixedCostsTable: React.FC<FixedCostsTableProps> = ({
  items,
  bcvRate,
  onUpdateCost,
  onAddCost,
  onDeleteCost,
  readOnly = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [newConcept, setNewConcept] = useState<string>("");
  const [newAmount, setNewAmount] = useState<number>(0);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const totalUsd = items.reduce((acc, curr) => acc + (curr.active ? curr.monthlyAmountUsd : 0), 0);
  const totalBs = Math.round(totalUsd * bcvRate * 100) / 100;

  const saveEdit = async (id: string) => {
    if (onUpdateCost) {
      await onUpdateCost(id, editAmount);
    }
    setEditingId(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim() || newAmount <= 0) return;
    if (onAddCost) {
      await onAddCost(newConcept.trim(), newAmount);
      setNewConcept("");
      setNewAmount(0);
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white border border-win10-border flex flex-col shadow-sm">
      {/* Table Header / Action */}
      <div className="p-3 bg-[#F9FAFB] border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-excel-darkGreen uppercase">
            Estructura de Costos Fijos Operacionales Mensuales
          </h3>
          <span className="text-[11px] text-gray-500">
            Gastos recurrentes para mantener operativa la tienda Mercantil Mariana
          </span>
        </div>
        {!readOnly && onAddCost && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="win-btn primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Concepto</span>
          </button>
        )}
      </div>

      {/* Add Form Dropdown */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-3 bg-gray-50 border-b border-gray-200 flex gap-3 text-xs">
          <input
            type="text"
            placeholder="Concepto de Gasto (ej. Publicidad)"
            value={newConcept}
            onChange={(e) => setNewConcept(e.target.value)}
            className="flex-1 border border-gray-300 p-1 text-xs focus:outline-none focus:border-excel-mediumGreen"
            required
          />
          <input
            type="number"
            placeholder="Monto Mensual ($)"
            value={newAmount || ""}
            onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
            className="w-36 border border-gray-300 p-1 text-xs font-mono focus:outline-none focus:border-excel-mediumGreen"
            required
          />
          <button type="submit" className="win-btn primary">
            Guardar
          </button>
          <button type="button" onClick={() => setIsAdding(false)} className="win-btn">
            Cancelar
          </button>
        </form>
      )}

      {/* Grid */}
      <div className="overflow-auto max-h-[450px]">
        <table className="win-table">
          <thead>
            <tr>
              <th className="charcoal">CONCEPTO DE GASTO FIJO</th>
              <th className="numeric charcoal">MONTO MENSUAL ($)</th>
              <th className="numeric charcoal">MONTO (Bs. BCV)</th>
              <th className="numeric charcoal">% DEL TOTAL</th>
              {!readOnly && <th className="charcoal text-center">ACCIÓN</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const amountUsd = isEditing ? editAmount : item.monthlyAmountUsd;
              const amountBs = Math.round(amountUsd * bcvRate);
              const share = totalUsd > 0 ? (amountUsd / totalUsd) * 100 : 0;

              return (
                <tr key={item.id}>
                  <td className="font-medium text-gray-800">{item.concept}</td>
                  {/* Amount USD */}
                  <td className="numeric font-mono font-semibold">
                    {isEditing ? (
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={editAmount}
                        onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                        className="w-20 border border-excel-mediumGreen px-1 py-0.5 text-right font-mono text-xs"
                      />
                    ) : (
                      `$ ${item.monthlyAmountUsd.toLocaleString()}`
                    )}
                  </td>
                  {/* Amount Bs */}
                  <td className="numeric font-mono text-gray-600 bg-gray-50">
                    {amountBs.toLocaleString("es-VE")} Bs.
                  </td>
                  {/* % share */}
                  <td className="numeric font-mono text-gray-500">
                    {share.toFixed(2)}%
                  </td>
                  {/* Actions */}
                  {!readOnly && (
                    <td className="text-center">
                      {isEditing ? (
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="win-btn primary text-[11px] py-0.5 px-2 h-6"
                        >
                          <Check className="w-3 h-3" />
                          <span>Listo</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setEditAmount(item.monthlyAmountUsd);
                            }}
                            className="p-1 text-gray-500 hover:text-excel-darkGreen"
                            title="Editar monto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteCost && (
                            <button
                              onClick={() => onDeleteCost(item.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Eliminar concepto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-excel-lightSage font-bold">
              <td className="text-excel-darkGreen">TOTAL COSTOS FIJOS MENSUALES</td>
              <td className="numeric font-mono text-excel-darkGreen">
                $ {totalUsd.toLocaleString()}
              </td>
              <td className="numeric font-mono text-excel-darkGreen">
                {totalBs.toLocaleString("es-VE")} Bs.
              </td>
              <td className="numeric font-mono text-excel-darkGreen">100.00%</td>
              {!readOnly && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
