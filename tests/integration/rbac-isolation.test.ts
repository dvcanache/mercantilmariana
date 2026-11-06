import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getProductsHandler, POST as createProductHandler } from "../../src/app/api/products/route";
import { createSessionToken } from "../../src/lib/auth";

describe("Integration: RBAC Isolation & Data Sanitization (User Story 3)", () => {
  it("sanitizes product catalog for SALES_CLERK, stripping confidential costs and margins", async () => {
    const clerkToken = await createSessionToken({
      id: "usr_clerk_1",
      email: "vendedor@mercantilmariana.com",
      name: "Vendedor Mostrador",
      role: "SALES_CLERK",
    });

    const req = new NextRequest("http://localhost:3000/api/products", {
      headers: { authorization: `Bearer ${clerkToken}` },
    });

    const res = await getProductsHandler(req);
    expect(res.status).toBe(200);

    const products = await res.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);

    // Verify first product is completely sanitized of confidential numbers
    const first = products[0];
    expect(first.supplierCostUsd).toBeNull();
    expect(first.targetMarginPercentage).toBeNull();

    // Verify retail customer pricing is preserved
    expect(first.pricing).toBeDefined();
    expect(typeof first.pricing.bcvPriceUsd).toBe("number");
    expect(typeof first.pricing.salePriceBs).toBe("number");
    expect(typeof first.pricing.promoPriceUsd).toBe("number");
    expect(typeof first.pricing.promoPriceUsd2).toBe("number");
  });

  it("delivers full margin and supplier cost metrics to Master ADMIN", async () => {
    const adminToken = await createSessionToken({
      id: "usr_admin_1",
      email: "admin@mercantilmariana.com",
      name: "Administrador Master",
      role: "ADMIN",
    });

    const req = new NextRequest("http://localhost:3000/api/products", {
      headers: { authorization: `Bearer ${adminToken}` },
    });

    const res = await getProductsHandler(req);
    expect(res.status).toBe(200);

    const products = await res.json();
    expect(Array.isArray(products)).toBe(true);

    const first = products[0];
    expect(typeof first.supplierCostUsd).toBe("number");
    expect(typeof first.targetMarginPercentage).toBe("number");
    expect(first.supplierCostUsd).toBeGreaterThan(0);
  });

  it("rejects product registration attempts by SALES_CLERK with 403 Forbidden", async () => {
    const clerkToken = await createSessionToken({
      id: "usr_clerk_1",
      email: "vendedor@mercantilmariana.com",
      name: "Vendedor Mostrador",
      role: "SALES_CLERK",
    });

    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: { authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify({
        name: "Producto No Autorizado",
        supplierCostUsd: 100,
      }),
    });

    const res = await createProductHandler(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain("Acceso denegado");
  });
});
