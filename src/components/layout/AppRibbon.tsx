"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  ListOrdered,
  ShoppingCart,
  Scale,
  LineChart,
  Users,
  RefreshCw,
  PlusCircle,
  Printer,
  Package,
} from "lucide-react";

interface AppRibbonProps {
  onOpenRatesModal?: () => void;
  onOpenNewSaleModal?: () => void;
  onOpenNewProductModal?: () => void;
  onPrint?: () => void;
  userRole?: string;
}

export const AppRibbon: React.FC<AppRibbonProps> = ({
  onOpenRatesModal,
  onOpenNewSaleModal,
  onOpenNewProductModal,
  onPrint,
  userRole = "ADMIN",
}) => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Control de Precios",
      href: "/control-precios",
      icon: Calculator,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Lista de Precios",
      href: "/lista-precios",
      icon: ListOrdered,
      roles: ["ADMIN", "MANAGER", "SALES_CLERK"],
    },
    {
      name: "Registro de Ventas",
      href: "/registro-ventas",
      icon: ShoppingCart,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Punto de Equilibrio",
      href: "/punto-equilibrio",
      icon: Scale,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Resumen de Ganancias",
      href: "/resumen-ganancias",
      icon: LineChart,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Usuarios",
      href: "/usuarios",
      icon: Users,
      roles: ["ADMIN"],
    },
  ];

  const allowedItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <div className="bg-[#F8F9FA] border-b border-win10-border select-none no-print shadow-sm">
      {/* Ribbon Navigation & Actions - Responsive Layout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-2 sm:px-3 pt-1 border-b border-gray-200 gap-1 md:gap-0">
        {/* Navigation Tabs (Smooth touch scrolling on phone) */}
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none pb-1 md:pb-0 w-full md:w-auto">
          {allowedItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-xs font-semibold border-t-2 transition-all shrink-0 whitespace-nowrap ${
                  isActive
                    ? "border-excel-mediumGreen bg-white text-excel-darkGreen shadow-sm -mb-[1px] border-b-white border-l border-r border-gray-200"
                    : "border-transparent text-gray-700 hover:text-excel-darkGreen hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Quick Action Buttons (Touch-friendly 36px buttons, scrollable on phone) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1.5 pt-0.5 md:pt-0 shrink-0 w-full md:w-auto">
          {userRole !== "SALES_CLERK" && onOpenRatesModal && (
            <button
              onClick={onOpenRatesModal}
              className="win-btn text-excel-darkGreen font-semibold hover:bg-excel-lightSage h-8 sm:h-9 px-2.5 sm:px-3 text-xs shrink-0"
              title="Ajustar Tasas BCV y Reposición"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tasas</span>
            </button>
          )}

          {userRole !== "SALES_CLERK" && onOpenNewProductModal && (
            <button
              onClick={onOpenNewProductModal}
              className="win-btn h-8 sm:h-9 px-2.5 sm:px-3 font-semibold text-gray-700 hover:text-excel-darkGreen text-xs shrink-0"
              title="Registrar un nuevo producto en el catálogo"
            >
              <Package className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          )}

          {userRole !== "SALES_CLERK" && onOpenNewSaleModal && (
            <button
              onClick={onOpenNewSaleModal}
              className="win-btn primary h-8 sm:h-9 px-2.5 sm:px-3 font-semibold text-xs shrink-0"
              title="Registrar una nueva venta en el POS"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Venta</span>
            </button>
          )}

          {pathname === "/lista-precios" && onPrint && (
            <button
              onClick={onPrint}
              className="win-btn h-8 sm:h-9 px-2.5 sm:px-3 font-semibold text-xs shrink-0"
              title="Imprimir Catálogo de Precios"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          )}
        </div>
      </div>

      {/* Friendly Section Purpose Hint (Visible on sm+ screens) */}
      <div className="hidden sm:flex px-4 py-1.5 bg-white text-[11px] text-gray-500 items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-excel-darkGreen">
            {pathname === "/control-precios" && "Hoja Maestra:"}
            {pathname === "/lista-precios" && "Catálogo de Precios:"}
            {pathname === "/registro-ventas" && "Historial de Ventas:"}
            {pathname === "/punto-equilibrio" && "Punto de Equilibrio:"}
            {pathname === "/resumen-ganancias" && "Resumen Financiero:"}
            {pathname === "/usuarios" && "Control de Usuarios:"}
          </span>
          <span>
            {pathname === "/control-precios" && "Edite costos, márgenes y precios de venta de forma sencilla."}
            {pathname === "/lista-precios" && "Consulte precios oficiales en Bolívares y Dólares para clientes."}
            {pathname === "/registro-ventas" && "Registro de transacciones diarias y márgenes obtenidos."}
            {pathname === "/punto-equilibrio" && "Volumen mínimo de ventas para cubrir costos de operación."}
            {pathname === "/resumen-ganancias" && "Métricas de rentabilidad y ganancias netas del negocio."}
            {pathname === "/usuarios" && "Cree, edite o asigne permisos a los trabajadores del sistema."}
          </span>
        </div>
      </div>
    </div>
  );
};
