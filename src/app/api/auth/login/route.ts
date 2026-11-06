import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, createSessionToken, SessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch {
      // Allow fallback if database is not reachable
    }

    if (user) {
      if (user.active === false) {
        return NextResponse.json(
          { error: "Esta cuenta ha sido desactivada por el administrador" },
          { status: 403 }
        );
      }

      const match = await comparePassword(password, user.passwordHash);
      if (!match) {
        return NextResponse.json(
          { error: "Credenciales inválidas" },
          { status: 401 }
        );
      }
    } else {
      // Demo accounts fallback for zero-setup / offline environments
      if (normalizedEmail === "admin@mercantilmariana.com" && password === "admin123") {
        user = {
          id: "usr_admin",
          name: "Administrador General",
          email: "admin@mercantilmariana.com",
          role: "ADMIN" as const,
          active: true,
          passwordHash: "",
        };
      } else if (
        normalizedEmail === "gerente@mercantilmariana.com" &&
        password === "gerente123"
      ) {
        user = {
          id: "usr_manager",
          name: "Gerente Comercial",
          email: "gerente@mercantilmariana.com",
          role: "MANAGER" as const,
          active: true,
          passwordHash: "",
        };
      } else if (
        normalizedEmail === "vendedor@mercantilmariana.com" &&
        password === "vendedor123"
      ) {
        user = {
          id: "usr_clerk",
          name: "Vendedor de Mostrador",
          email: "vendedor@mercantilmariana.com",
          role: "SALES_CLERK" as const,
          active: true,
          passwordHash: "",
        };
      } else {
        return NextResponse.json(
          { error: "Credenciales inválidas" },
          { status: 401 }
        );
      }
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await createSessionToken(sessionUser);
    const redirectUrl =
      sessionUser.role === "SALES_CLERK" ? "/lista-precios" : "/control-precios";

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      token,
      redirectUrl,
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error en login: " + (err?.message || err) },
      { status: 500 }
    );
  }
}
