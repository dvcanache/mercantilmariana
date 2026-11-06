"use client";

import React, { useState, useEffect } from "react";
import { UserManagementTable } from "@/components/users/UserManagementTable";
import { UserFormModal, UserData } from "@/components/users/UserFormModal";
import { AlertTriangle } from "lucide-react";

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [errorBanner, setErrorBanner] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        const err = await res.json();
        setErrorBanner(err.error || "No se pudo cargar la lista de usuarios.");
      }
    } catch {
      setErrorBanner("Error de conexión al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
    setErrorBanner("");
    setSuccessBanner("");
  };

  const handleOpenEdit = (user: UserData) => {
    setUserToEdit(user);
    setIsModalOpen(true);
    setErrorBanner("");
    setSuccessBanner("");
  };

  const handleSaveUser = async (data: UserData) => {
    setErrorBanner("");
    setSuccessBanner("");

    if (data.id) {
      // Update
      const res = await fetch(`/api/users/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Error al actualizar el usuario");
      }

      setSuccessBanner(`Usuario "${data.name}" actualizado correctamente.`);
    } else {
      // Create
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Error al registrar el usuario");
      }

      setSuccessBanner(`Usuario "${data.name}" registrado correctamente.`);
    }

    await loadUsers();
  };

  const handleDeleteUser = async (user: UserData) => {
    setErrorBanner("");
    setSuccessBanner("");

    const confirmed = window.confirm(
      `¿Está seguro de que desea eliminar el usuario "${user.name}" (${user.email})?\n\nEsta acción revocará su acceso al sistema.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) {
        setErrorBanner(json.error || "No se pudo eliminar el usuario.");
        return;
      }

      setSuccessBanner(`Usuario "${user.name}" eliminado correctamente.`);
      await loadUsers();
    } catch {
      setErrorBanner("Error de comunicación al eliminar el usuario.");
    }
  };

  return (
    <div className="space-y-3">
      {errorBanner && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner("")}
            className="text-red-900 font-bold hover:underline ml-2"
          >
            Cerrar
          </button>
        </div>
      )}

      {successBanner && (
        <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-800 text-xs flex items-center justify-between">
          <span>{successBanner}</span>
          <button
            onClick={() => setSuccessBanner("")}
            className="text-emerald-900 font-bold hover:underline ml-2"
          >
            Cerrar
          </button>
        </div>
      )}

      <UserManagementTable
        users={users}
        onOpenCreate={handleOpenCreate}
        onOpenEdit={handleOpenEdit}
        onDelete={handleDeleteUser}
        loading={loading}
      />

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
        onSave={handleSaveUser}
      />
    </div>
  );
}
