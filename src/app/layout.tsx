import type { Metadata } from "next";
import "./globals.css";
import "../styles/print.css";

export const metadata: Metadata = {
  title: "Mercantil Mariana — Control de Precios y Finanzas",
  description: "Sistema bi-monetario y control de precios de venta para Mercantil Mariana",
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-[#F0F2F5] text-gray-900">
        {children}
      </body>
    </html>
  );
}
