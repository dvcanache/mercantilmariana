import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getUsersHandler, POST as createUserHandler } from "../../src/app/api/users/route";
import { PUT as updateUserHandler, DELETE as deleteUserHandler } from "../../src/app/api/users/[id]/route";
import { createSessionToken } from "../../src/lib/auth";

describe("Integration: Master User Management API (User Story 2)", () => {
  it("rejects unauthorized and non-admin requests with 401 or 403", async () => {
    // Unauthenticated
    const reqUnauth = new NextRequest("http://localhost:3000/api/users");
    const resUnauth = await getUsersHandler(reqUnauth);
    expect(resUnauth.status).toBe(401);

    // Sales Clerk trying to access
    const clerkToken = await createSessionToken({
      id: "usr_clerk_1",
      email: "clerk@mercantilmariana.com",
      name: "Clerk",
      role: "SALES_CLERK",
    });

    const reqClerk = new NextRequest("http://localhost:3000/api/users", {
      headers: { authorization: `Bearer ${clerkToken}` },
    });
    const resClerk = await getUsersHandler(reqClerk);
    expect(resClerk.status).toBe(403);
  });

  it("allows Master ADMIN to list users and create a new staff account", async () => {
    const adminToken = await createSessionToken({
      id: "usr_admin_1",
      email: "admin@mercantilmariana.com",
      name: "Admin",
      role: "ADMIN",
    });

    // List users
    const reqList = new NextRequest("http://localhost:3000/api/users", {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const resList = await getUsersHandler(reqList);
    expect(resList.status).toBe(200);
    const jsonList = await resList.json();
    expect(Array.isArray(jsonList.users)).toBe(true);

    // Create user
    const reqCreate = new NextRequest("http://localhost:3000/api/users", {
      method: "POST",
      headers: { authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: "Nuevo Empleado",
        email: "nuevo.empleado@mercantilmariana.com",
        password: "password123",
        role: "SALES_CLERK",
      }),
    });

    const resCreate = await createUserHandler(reqCreate);
    expect(resCreate.status).toBe(201);
    const jsonCreate = await resCreate.json();
    expect(jsonCreate.success).toBe(true);
    expect(jsonCreate.user.email).toBe("nuevo.empleado@mercantilmariana.com");
  });

  it("enforces Sole Master Protection when attempting to delete sole admin", async () => {
    const adminToken = await createSessionToken({
      id: "usr_admin_1",
      email: "admin@mercantilmariana.com",
      name: "Admin",
      role: "ADMIN",
    });

    const reqDelete = new NextRequest("http://localhost:3000/api/users/usr_admin_1", {
      method: "DELETE",
      headers: { authorization: `Bearer ${adminToken}` },
    });

    const resDelete = await deleteUserHandler(reqDelete, {
      params: { id: "usr_admin_1" },
    });
    expect(resDelete.status).toBe(400);

    const json = await resDelete.json();
    expect(json.error).toContain("No es posible eliminar la única cuenta de Administrador activa");
  });

  it("enforces Sole Master Protection when attempting to demote sole admin", async () => {
    const adminToken = await createSessionToken({
      id: "usr_admin_1",
      email: "admin@mercantilmariana.com",
      name: "Admin",
      role: "ADMIN",
    });

    const reqDemote = new NextRequest("http://localhost:3000/api/users/usr_admin_1", {
      method: "PUT",
      headers: { authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        role: "SALES_CLERK",
      }),
    });

    const resDemote = await updateUserHandler(reqDemote, {
      params: { id: "usr_admin_1" },
    });
    expect(resDemote.status).toBe(400);

    const json = await resDemote.json();
    expect(json.error).toContain("No es posible degradar o desactivar");
  });
});
