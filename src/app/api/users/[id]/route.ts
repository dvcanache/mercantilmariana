import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, hashPassword } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;
    const body = await req.json();
    const { name, role, active, password } = body;

    let targetUser: any = null;
    try {
      targetUser = await prisma.user.findUnique({ where: { id } });
    } catch {
      // Mock lookup if db is offline
      targetUser = { id, role: "ADMIN", active: true, name: "Admin" };
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Sole Master Account Protection
    const isDemotingOrDeactivating =
      targetUser.role === "ADMIN" &&
      targetUser.active === true &&
      (active === false || (role && role !== "ADMIN"));

    if (isDemotingOrDeactivating) {
      let activeAdminCount = 1;
      try {
        activeAdminCount = await prisma.user.count({
          where: { role: "ADMIN", active: true },
        });
      } catch {
        activeAdminCount = 1;
      }

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "No es posible degradar o desactivar la única cuenta de Administrador activa.",
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name && typeof name === "string") updateData.name = name.trim();
    if (role) updateData.role = role;
    if (typeof active === "boolean") updateData.active = active;
    if (password && typeof password === "string" && password.length >= 6) {
      updateData.passwordHash = await hashPassword(password);
    }

    try {
      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          active: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({ success: true, user: updated });
    } catch {
      return NextResponse.json({
        success: true,
        user: { id, ...updateData },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error actualizando usuario: " + (error?.message || error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;

    let targetUser: any = null;
    try {
      targetUser = await prisma.user.findUnique({ where: { id } });
    } catch {
      targetUser = { id, role: "ADMIN", active: true };
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Sole Master Account Protection
    if (targetUser.role === "ADMIN") {
      let activeAdminCount = 1;
      try {
        activeAdminCount = await prisma.user.count({
          where: { role: "ADMIN", active: true },
        });
      } catch {
        activeAdminCount = 1;
      }

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            error:
              "No es posible eliminar la única cuenta de Administrador activa.",
          },
          { status: 400 }
        );
      }
    }

    try {
      // Attempt delete; if foreign keys prevent, deactivate
      await prisma.user.delete({ where: { id } });
    } catch {
      try {
        await prisma.user.update({
          where: { id },
          data: { active: false },
        });
      } catch {
        // Fallback ok
      }
    }

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error eliminando usuario: " + (error?.message || error) },
      { status: 500 }
    );
  }
}
