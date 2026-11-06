import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "mercantil-mariana-super-secret-key-2026-bimonetary"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public assets and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/logo.jpg") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Allow authentication endpoints
  if (pathname === "/login" || pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  // 3. Root path '/' always routes to login screen first
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4. Verify session token for all protected routes
  const token = req.cookies.get("session_token")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  let sessionUser: { id: string; email: string; name: string; role: string } | null = null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    sessionUser = payload as any;
  } catch {
    // Invalid / expired token
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Sesión expirada o inválida" },
        { status: 401 }
      );
    }
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session_token");
    return response;
  }

  const role = sessionUser?.role;

  // 5. Role-based Access Control (RBAC)
  // Restricted Role: SALES_CLERK (Price List Viewer only)
  if (role === "SALES_CLERK") {
    const isAllowedPage = pathname === "/lista-precios";
    const isAllowedApi =
      pathname === "/api/products" ||
      pathname === "/api/rates" ||
      pathname === "/api/auth/me" ||
      pathname === "/api/auth/logout";

    if (!pathname.startsWith("/api/") && !isAllowedPage) {
      return NextResponse.redirect(new URL("/lista-precios", req.url));
    }

    if (
      pathname.startsWith("/api/") &&
      (!isAllowedApi || (req.method !== "GET" && pathname !== "/api/auth/logout"))
    ) {
      return NextResponse.json(
        { error: "Acceso denegado: Su rol únicamente tiene acceso a la Lista de Precios" },
        { status: 403 }
      );
    }
  }

  // Role: MANAGER (Commercial manager, no User Administration)
  if (role === "MANAGER") {
    if (pathname === "/usuarios") {
      return NextResponse.redirect(new URL("/control-precios", req.url));
    }
    if (pathname.startsWith("/api/users")) {
      return NextResponse.json(
        { error: "Acceso restringido: Se requieren permisos de Administrador Master" },
        { status: 403 }
      );
    }
  }

  // Master/ADMIN: full access to all routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
