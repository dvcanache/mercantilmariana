import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as loginHandler } from "../../src/app/api/auth/login/route";
import { POST as logoutHandler } from "../../src/app/api/auth/logout/route";
import { GET as meHandler } from "../../src/app/api/auth/me/route";
import { createSessionToken } from "../../src/lib/auth";

describe("Integration: Authentication & Session Flow (User Story 1)", () => {
  it("authenticates valid admin credentials, issues session cookie, and returns redirectUrl", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@mercantilmariana.com",
        password: "admin123",
      }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.user.role).toBe("ADMIN");
    expect(json.redirectUrl).toBe("/control-precios");

    // Cookie verification
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("session_token=");
    expect(setCookie).toContain("HttpOnly");
  });

  it("authenticates sales clerk credentials and sets redirectUrl to /lista-precios", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "vendedor@mercantilmariana.com",
        password: "vendedor123",
      }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.user.role).toBe("SALES_CLERK");
    expect(json.redirectUrl).toBe("/lista-precios");
  });

  it("rejects invalid credentials with 401 Unauthorized", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@mercantilmariana.com",
        password: "incorrect-password",
      }),
    });

    const res = await loginHandler(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toBe("Credenciales inválidas");
  });

  it("clears session token on logout", async () => {
    const res = await logoutHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("Max-Age=0");
  });

  it("resolves active user session via /api/auth/me with Bearer token", async () => {
    const token = await createSessionToken({
      id: "usr_test",
      email: "test@mercantilmariana.com",
      name: "Usuario Prueba",
      role: "SALES_CLERK",
    });

    const req = new NextRequest("http://localhost:3000/api/auth/me", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const res = await meHandler(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.authenticated).toBe(true);
    expect(json.user.role).toBe("SALES_CLERK");
    expect(json.user.email).toBe("test@mercantilmariana.com");
  });
});
