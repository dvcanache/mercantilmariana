"use client";

import React, { useState } from "react";
import { X, RefreshCw, Save, ArrowRightLeft } from "lucide-react";

interface RateUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBcv: number;
  currentReplacement: number;
  currentDiscount: number;
  onSaveRates: (rates: {
    officialBcvRate: number;
    supplierReplacementRate: number;
    promoDiscountPercentage: number;
  }) => Promise<void>;
  onSyncBcv: () => Promise<number>;
}

export const RateUpdateModal: React.FC<RateUpdateModalProps> = ({
  isOpen,
  onClose,
  currentBcv,
  currentReplacement,
  currentDiscount,
  onSaveRates,
  onSyncBcv,
}) => {
  const [bcvRate, setBcvRate] = useState<number>(currentBcv);
  const [replacementRate, setReplacementRate] = useState<number>(currentReplacement);
  const [discountPercent, setDiscountPercent] = useState<number>(currentDiscount * 100);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>("");

  if (!isOpen) return null;

  const factor =
    replacementRate > 0 ? (bcvRate / replacementRate).toFixed(6) : "1.000000";

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage("");
      const fetchedRate = await onSyncBcv();
      if (fetchedRate > 0) {
        setBcvRate(fetchedRate);
        setSyncMessage(`Tasa BCV obtenida exitosamente: Bs. ${fetchedRate}`);
      }
    } catch {
      setSyncMessage("No se pudo obtener la tasa en línea. Ingrese el valor manual.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    if (bcvRate <= 0 || replacementRate <= 0) {
      alert("Las tasas deben ser números mayores a cero.");
      return;
    }
    try {
      setIsSaving(true);
      await onSaveRates({
        officialBcvRate: Number(bcvRate),
        supplierReplacementRate: Number(replacementRate),
        promoDiscountPercentage: Number(discountPercent) / 100,
      });
      onClose();
    } catch (e: any) {
      alert("Error guardando tasas: " + (e?.message || e));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm select-none p-4">
      {/* Windows 10 Dialog Box */}
      <div className="w-full max-w-md bg-white border border-gray-400 shadow-win10Modal overflow-hidden max-h-[90vh] flex flex-col">
        {/* Dialog Title Bar */}
        <div className="h-8 bg-excel-darkGreen text-white flex items-center justify-between px-3 text-xs font-semibold shrink-0">
          <span>Actualización de Tasas Bi-Monetarias Diarias</span>
          <button
            onClick={onClose}
            className="win-ctrl-btn close -mr-3"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-4 space-y-4 text-xs overflow-y-auto">
          <p className="text-gray-600">
            Actualice diariamente las tasas para recalibrar los precios de venta en Bolívares y promociones en divisas en todo el catálogo de Mercantil Mariana.
          </p>

          {/* Sync Button */}
          <div className="bg-gray-50 border border-gray-200 p-2.5 flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-800 block">Sincronización BCV</span>
              <span className="text-[11px] text-gray-500">Obtener tasa del día desde servicio oficial</span>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="win-btn flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Consultando..." : "Consultar BCV"}</span>
            </button>
          </div>

          {syncMessage && (
            <div className="text-[11px] text-excel-darkGreen bg-excel-lightSage p-2 border border-excel-mediumGreen/40">
              {syncMessage}
            </div>
          )}

          {/* Rate Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Tasa Oficial BCV de Venta (Bs. / USD):
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={bcvRate}
                onChange={(e) => setBcvRate(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 p-1.5 text-xs font-mono focus:border-excel-mediumGreen focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                Tasa de Compra Variante / Reposición (Bs. / USD):
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={replacementRate}
                onChange={(e) => setReplacementRate(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 p-1.5 text-xs font-mono focus:border-excel-mediumGreen focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                % Descuento Promocional en Divisas (Ej. 6%):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-24 border border-gray-300 p-1.5 text-xs font-mono focus:border-excel-mediumGreen focus:outline-none"
                />
                <span className="text-gray-500">%</span>
              </div>
            </div>
          </div>

          {/* Factor Result Preview */}
          <div className="bg-excel-lightSage border border-excel-mediumGreen/40 p-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-excel-darkGreen">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Factor de Cambio proyectado:</span>
            </div>
            <span className="font-mono font-bold text-sm text-excel-darkGreen">{factor}</span>
          </div>
        </div>

        {/* Dialog Footer Actions */}
        <div className="bg-gray-100 border-t border-gray-200 px-4 py-2.5 flex items-center justify-end space-x-2">
          <button onClick={onClose} className="win-btn">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="win-btn primary"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Guardando..." : "Guardar y Recalcular"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
