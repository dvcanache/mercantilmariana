import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as createProductHandler, GET as getProductsHandler } from "../../src/app/api/products/route";
import { PUT as updateProductHandler, DELETE as deleteProductHandler } from "../../src/app/api/products/[id]/route";
import { createSessionToken } from "../../src/lib/auth";

describe("Integration: Product CRUD & Dynamic Catalog API", () => {
  let adminToken: string;
  let clerkToken: string;

  it("sets up auth session tokens", async () => {
    adminToken = await createSessionToken({
      id: "usr_admin",
      email: "admin@mercantilmariana.com",
      name: "Admin Master",
      role: "ADMIN",
    });

    clerkToken = await createSessionToken({
      id: "usr_clerk",
      email: "clerk@mercantilmariana.com",
      name: "Clerk User",
      role: "SALES_CLERK",
    });

    expect(adminToken).toBeTruthy();
    expect(clerkToken).toBeTruthy();
  });

  it("creates a new product via POST /api/products as ADMIN", async () => {
    const testSku = `TEST-${Date.now()}`;
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sku: testSku,
        name: "Ventilador Samurai 18 Pulgadas",
        category: "Ventilación",
        brand: "Samurai",
        model: "Turbo Silence",
        supplierCostUsd: 35.0,
        targetMarginPercentage: 0.4,
        unitOfMeasure: "Unidad",
        currentStock: 15,
        active: true,
      }),
    });

    const res = await createProductHandler(req);
    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.sku).toBe(testSku);
    expect(created.name).toBe("Ventilador Samurai 18 Pulgadas");
  });

  it("rejects product creation by SALES_CLERK with 403", async () => {
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: {
        authorization: `Bearer ${clerkToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sku: "CLERK-TEST",
        name: "Unauthorized product",
        supplierCostUsd: 50,
      }),
    });

    const res = await createProductHandler(req);
    expect(res.status).toBe(403);
  });

  it("updates product attributes via PUT /api/products/[id]", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/prod_1", {
      method: "PUT",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "Colchón Matrimonial Ortopédico Actualizado",
        supplierCostUsd: 185.0,
        targetMarginPercentage: 0.52,
      }),
    });

    const res = await updateProductHandler(req, { params: { id: "prod_1" } });
    expect(res.status).toBe(200);
  });

  it("rejects product updates by SALES_CLERK with 403", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/prod_1", {
      method: "PUT",
      headers: {
        authorization: `Bearer ${clerkToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        supplierCostUsd: 200,
      }),
    });

    const res = await updateProductHandler(req, { params: { id: "prod_1" } });
    expect(res.status).toBe(403);
  });

  it("deletes a product via DELETE /api/products/[id]", async () => {
    // Delete non-existent or fresh product
    const req = new NextRequest("http://localhost:3000/api/products/prod_test_delete", {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    const res = await deleteProductHandler(req, { params: { id: "prod_test_delete" } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(["DELETED", "ARCHIVED"]).toContain(data.action);
  });

  it("rejects product deletion by SALES_CLERK with 403", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/prod_1", {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${clerkToken}`,
      },
    });

    const res = await deleteProductHandler(req, { params: { id: "prod_1" } });
    expect(res.status).toBe(403);
  });
});
