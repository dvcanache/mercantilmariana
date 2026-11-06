"use client";

import React from "react";
import Image from "next/image";
import { User, LogOut } from "lucide-react";

interface WindowTitleBarProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export const WindowTitleBar: React.FC<WindowTitleBarProps> = ({
  userName = "Administrador",
  userRole = "ADMIN",
  onLogout,
}) => {
  const roleDisplayNames: Record<string, string> = {
    ADMIN: "Master / Administrador",
    MANAGER: "Gerente Comercial",
    SALES_CLERK: "Vendedor",
  };

  const roleColors: Record<string, string> = {
    ADMIN: "bg-emerald-800 text-emerald-100 border-emerald-400",
    MANAGER: "bg-blue-800 text-blue-100 border-blue-400",
    SALES_CLERK: "bg-amber-800 text-amber-100 border-amber-400",
  };

  const badgeClass =
    roleColors[userRole] || "bg-excel-mediumGreen text-white border-white/30";
  const displayRole = roleDisplayNames[userRole] || userRole;

  return (
    <div className="h-12 bg-excel-darkGreen text-white flex items-center justify-between select-none border-b border-excel-mediumGreen px-2.5 sm:px-4 shadow-md no-print">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded bg-white shadow overflow-hidden border-2 border-white/60 flex items-center justify-center shrink-0">
          <Image
            src="/logo.jpg"
            alt="Mercantil Mariana Logo"
            fill
            className="object-contain p-0.5"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white leading-tight">
            MERCANTIL MARIANA
          </span>
          <span className="text-[10px] text-emerald-200 hidden md:block font-medium">
            Control de Precios de Venta & Finanzas Bi-Monetarias
          </span>
        </div>
      </div>

      {/* Right: User Info & Session Action (Mobile-Optimized) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-1.5 bg-black/20 px-2 py-1 rounded border border-white/10 text-xs">
          <User className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span className="font-semibold hidden sm:inline max-w-[110px] truncate">
            {userName}
          </span>
          <span
            className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded border ${badgeClass}`}
            title={`Rol: ${userRole}`}
          >
            {userRole === "ADMIN" ? "Admin" : userRole === "MANAGER" ? "Gerente" : "Ventas"}
          </span>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold bg-red-800/90 hover:bg-red-700 text-white border border-red-400/50 rounded transition shadow-sm h-8 shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        )}
      </div>
    </div>
  );
};
