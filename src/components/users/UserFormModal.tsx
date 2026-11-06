"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Save, ShieldAlert, Key, User, Mail, Shield } from "lucide-react";

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "SALES_CLERK";
  active?: boolean;
  password?: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: UserData | null;
  onSave: (data: UserData) => Promise<void>;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MANAGER" | "SALES_CLERK">("SALES_CLERK");
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || "");
      setEmail(userToEdit.email || "");
      setRole(userToEdit.role || "SALES_CLERK");
      setActive(userToEdit.active !== false);
      setPassword("");
    } else {
      setName("");
      setEmail("");
      setRole("SALES_CLERK");
      setActive(true);
      setPassword("");
    }
    setError("");
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Ingrese el nombre del usuario.");
      return;
    }

    if (!userToEdit && !email.trim()) {
      setError("Ingrese el correo electrónico / usuario.");
      return;
    }

    if (!userToEdit && (!password || password.length < 6)) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (userToEdit && password && password.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: userToEdit?.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        active,
        password: password || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error guardando el usuario");
    } finally {
      setLoading(false);
    }
  };

  const isEditing = Boolean(userToEdit?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 select-none animate-fadeIn">
      {/* Windows 10 Dialog Box */}
      <div className="w-full max-w-md bg-white border border-[#004E8C] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Titlebar */}
        <div className="h-8 bg-[#004E8C] text-white flex items-center justify-between px-3 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-2">
            {isEditing ? <Save className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span>{isEditing ? "Modificar Usuario" : "Crear Nuevo Usuario"}</span>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-red-600 px-2 py-0.5 text-white/90 hover:text-white transition"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Nombre Completo:
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                required
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 focus:outline-none focus:border-excel-mediumGreen"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Correo Electrónico / Identificador:
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@mercantilmariana.com"
                required
                disabled={isEditing}
                className={`w-full pl-8 pr-3 py-1.5 border border-gray-300 focus:outline-none ${
                  isEditing ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "focus:border-excel-mediumGreen"
                }`}
              />
            </div>
            {isEditing && (
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                El correo no puede modificarse una vez registrado.
              </span>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Categoría / Rol de Acceso:
            </label>
            <div className="relative">
              <Shield className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 focus:outline-none focus:border-excel-mediumGreen bg-white"
              >
                <option value="SALES_CLERK">
                  Vendedor — Solo Lista de Precios (Restringido)
                </option>
                <option value="MANAGER">
                  Gerente — Operaciones y Finanzas (Sin Gestión de Usuarios)
                </option>
                <option value="ADMIN">
                  Master — Administrador General (Control Total)
                </option>
              </select>
            </div>
            <div className="mt-1 p-2 bg-gray-50 border border-gray-200 text-[11px] text-gray-600">
              {role === "SALES_CLERK" && (
                <span>⚠️ Rol restringido: Únicamente puede consultar la Lista de Precios sin visualizar costos ni márgenes.</span>
              )}
              {role === "MANAGER" && (
                <span>Gestiona precios, costos fijos y ventas. No puede crear ni eliminar usuarios.</span>
              )}
              {role === "ADMIN" && (
                <span>Control total sobre precios, costos fijos, análisis financiero y administración de usuarios.</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {isEditing ? "Nueva Contraseña (dejar en blanco para conservar actual):" : "Contraseña Inicial:"}
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? "••••••••" : "Mínimo 6 caracteres"}
                required={!isEditing}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 focus:outline-none focus:border-excel-mediumGreen"
              />
            </div>
          </div>

          {isEditing && (
            <div className="pt-2 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-excel-mediumGreen"
                />
                <span className="text-xs font-semibold text-gray-800">
                  Cuenta Activa (Permitir acceso al sistema)
                </span>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="win-btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="win-btn primary flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? "Guardando..." : isEditing ? "Actualizar Usuario" : "Crear Usuario"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
