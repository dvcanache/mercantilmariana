"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const showDemoButtons = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const target = data.redirectUrl || "/control-precios";
        router.push(target);
        router.refresh();
      } else {
        setError(data.error || "Credenciales incorrectas");
      }
    } catch {
      setError("Error de conexión al iniciar sesión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const setDemo = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3B0F] via-[#274E13] to-[#122409] flex items-center justify-center p-3 sm:p-4 select-none">
      {/* Windows 10 Glass/Acrylic Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border border-white/50 shadow-2xl overflow-hidden transition-all">
        {/* Titlebar */}
        <div className="h-9 bg-excel-darkGreen text-white flex items-center justify-between px-3 text-xs font-semibold border-b border-excel-mediumGreen">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-wide">Mercantil Mariana</span>
            <span className="text-white/60">|</span>
            <span className="text-emerald-200">Inicio de Sesión</span>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
        </div>

        <div className="p-5 sm:p-7 space-y-5 sm:space-y-6">
          {/* Prominent High-Visibility Brand Logo & Heading */}
          <div className="text-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden border-4 border-excel-mediumGreen bg-white shadow-xl ring-4 ring-excel-lightSage/60 mb-2.5 sm:mb-3 flex items-center justify-center">
              <Image
                src="/logo.jpg"
                alt="Mercantil Mariana Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-wider uppercase text-excel-darkGreen">
              MERCANTIL MARIANA
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-600 font-medium mt-0.5">
              Sistema Bi-Monetario y Control de Precios
            </p>
          </div>

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-300 p-2.5 sm:p-3 flex items-center gap-2 rounded">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-bold mb-1.5">
                Correo Electrónico / Identificador:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="usuario@mercantilmariana.com"
                  className="w-full pl-9 pr-3 h-10 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:border-excel-mediumGreen focus:ring-1 focus:ring-excel-mediumGreen bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1.5">
                Contraseña:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 h-10 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:border-excel-mediumGreen focus:ring-1 focus:ring-excel-mediumGreen bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full win-btn primary h-10 sm:h-11 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              <span>{loading ? "Iniciando sesión..." : "Acceder al Sistema"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Select Buttons (Only rendered if NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true") */}
          {showDemoButtons ? (
            <div className="pt-3.5 border-t border-gray-200 text-center">
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-semibold block mb-2 uppercase tracking-wider">
                Acceso Rápido para Pruebas:
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDemo("admin@mercantilmariana.com", "admin123")}
                  className="px-2.5 py-1 text-[11px] bg-excel-lightSage text-excel-darkGreen font-bold border border-excel-mediumGreen/50 hover:bg-excel-mediumGreen hover:text-white transition shadow-sm rounded"
                  title="Acceso Maestro"
                >
                  Master Admin
                </button>
                <button
                  type="button"
                  onClick={() => setDemo("gerente@mercantilmariana.com", "gerente123")}
                  className="px-2.5 py-1 text-[11px] bg-gray-100 text-gray-800 font-semibold border border-gray-300 hover:bg-gray-200 transition shadow-sm rounded"
                  title="Gerente Comercial"
                >
                  Gerente
                </button>
                <button
                  type="button"
                  onClick={() => setDemo("vendedor@mercantilmariana.com", "vendedor123")}
                  className="px-2.5 py-1 text-[11px] bg-amber-50 text-amber-900 font-semibold border border-amber-300 hover:bg-amber-100 transition shadow-sm rounded"
                  title="Solo Lista de Precios"
                >
                  Vendedor (Solo Precios)
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3.5 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-400">
                Acceso protegido. Sistema exclusivo para el personal autorizado de Mercantil Mariana.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
