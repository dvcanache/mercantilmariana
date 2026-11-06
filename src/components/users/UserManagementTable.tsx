"use client";

import React, { useState } from "react";
import { UserPlus, Edit2, Trash2, Shield, Search, CheckCircle, XCircle, X } from "lucide-react";
import { UserData } from "./UserFormModal";

interface UserManagementTableProps {
  users: UserData[];
  onOpenCreate: () => void;
  onOpenEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  loading?: boolean;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
            Master / Administrador
          </span>
        );
      case "MANAGER":
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-blue-100 text-blue-800 border border-blue-300">
            Gerente Comercial
          </span>
        );
      case "SALES_CLERK":
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">
            Vendedor (Solo Precios)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-gray-100 text-gray-800 border border-gray-300">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-win10-border flex flex-col shadow-sm">
      {/* Header Banner - Responsive */}
      <div className="p-3 sm:p-4 bg-excel-darkGreen text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
            <h2 className="text-xs sm:text-base font-bold tracking-wide uppercase text-white">
              MERCANTIL MARIANA — ADMINISTRACIÓN DE USUARIOS
            </h2>
          </div>
          <span className="text-[11px] sm:text-xs text-emerald-200 block mt-0.5">
            Gestión de credenciales, roles y permisos (Exclusivo Master)
          </span>
        </div>

        <button
          onClick={onOpenCreate}
          className="win-btn primary bg-excel-mediumGreen hover:bg-excel-darkGreen border-white/50 text-white font-bold h-8 sm:h-9 px-3.5 text-xs shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Toolbar / Search (Responsive) */}
      <div className="p-2.5 sm:p-3 bg-[#F9FAFB] border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o rol..."
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

        <span className="text-gray-600 font-mono font-bold bg-gray-100 px-2.5 py-1 border border-gray-200 rounded self-end sm:self-auto">
          {filtered.length} usuarios
        </span>
      </div>

      {/* Table with Sticky Header */}
      <div className="overflow-auto max-h-[calc(100vh-250px)]">
        <table className="win-table">
          <thead>
            <tr>
              <th className="charcoal">NOMBRE DEL EMPLEADO</th>
              <th className="charcoal">CORREO / USUARIO</th>
              <th className="charcoal">CATEGORÍA / ROL</th>
              <th className="charcoal text-center">ESTADO</th>
              <th className="charcoal text-center w-32">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  Cargando usuarios...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No se encontraron usuarios coincidentes.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isActive = u.active !== false;
                return (
                  <tr key={u.id || u.email}>
                    <td className="font-semibold text-gray-900">{u.name}</td>
                    <td className="font-mono text-gray-700">{u.email}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td className="text-center">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Activo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Inactivo</span>
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenEdit(u)}
                          className="w-8 h-8 flex items-center justify-center text-blue-700 hover:text-blue-900 hover:bg-blue-50 border border-gray-300 rounded-sm transition"
                          title="Modificar usuario o restablecer contraseña"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(u)}
                          className="w-8 h-8 flex items-center justify-center text-red-700 hover:text-red-900 hover:bg-red-50 border border-gray-300 rounded-sm transition"
                          title="Eliminar o desactivar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
