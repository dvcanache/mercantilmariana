export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/mercantilmariana?schema=public",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "mercantil-mariana-super-secret-key-2026-bimonetary",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Mercantil Mariana — Control de Precios",
};
