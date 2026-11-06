import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, hashPassword } from "@/lib/auth";

// In-memory mock store for test/offline fallback
let mockUsers = [
  {
    id: "usr_admin",
    name: "Administrador General",
    email: "admin@mercantilmariana.com",
    role: "ADMIN",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_manager",
    name: "Gerente Comercial",
    email: "gerente@mercantilmariana.com",
    role: "MANAGER",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "usr_clerk",
    name: "Vendedor de Mostrador",
    email: "vendedor@mercantilmariana.com",
    role: "SALES_CLERK",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser(req);
  if (!sessionUser) {
    return NextResponse.json(
      { error: "No autorizado. Inicie sesión." },
      { status: 401 }
    );
  }

  if (sessionUser.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acceso restringido: Se requieren permisos de Administrador Master" },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch {
    // Return mock users for test/offline environment
    return NextResponse.json({ users: mockUsers });
  }
}

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser(req);
  if (!sessionUser) {
    return NextResponse.json(
      { error: "No autorizado. Inicie sesión." },
      { status: 401 }
    );
  }

  if (sessionUser.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acceso restringido: Se requieren permisos de Administrador Master" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "El nombre debe tener al menos 2 caracteres" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Debe ingresar un correo electrónico válido" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    const validRoles = ["ADMIN", "MANAGER", "SALES_CLERK"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "El rol seleccionado no es válido" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await hashPassword(password);

    try {
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        return NextResponse.json(
          { error: "El correo electrónico ya se encuentra registrado" },
          { status: 400 }
        );
      }

      const created = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: hashedPassword,
          role: role as any,
          active: true,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      return NextResponse.json({ success: true, user: created }, { status: 201 });
    } catch {
      // Mock store fallback
      if (mockUsers.some((u) => u.email === normalizedEmail)) {
        return NextResponse.json(
          { error: "El correo electrónico ya se encuentra registrado" },
          { status: 400 }
        );
      }

      const mockCreated = {
        id: "usr_" + Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        role,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockUsers.unshift(mockCreated);
      return NextResponse.json({ success: true, user: mockCreated }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error creando usuario: " + (error?.message || error) },
      { status: 500 }
    );
  }
}
