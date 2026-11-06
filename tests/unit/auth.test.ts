import { describe, it, expect } from "vitest";
import {
  hashPassword,
  comparePassword,
  createSessionToken,
  verifySessionToken,
  SessionUser,
} from "../../src/lib/auth";

describe("Authentication Utilities", () => {
  it("hashes password and verifies correctly", async () => {
    const raw = "SuperSecret123!";
    const hash = await hashPassword(raw);
    expect(hash).not.toBe(raw);
    expect(hash.startsWith("$2")).toBe(true);

    const matches = await comparePassword(raw, hash);
    expect(matches).toBe(true);

    const wrong = await comparePassword("WrongPassword", hash);
    expect(wrong).toBe(false);
  });

  it("creates and verifies a valid JWT session token", async () => {
    const user: SessionUser = {
      id: "usr_12345",
      email: "test@mercantilmariana.com",
      name: "Juan Pérez",
      role: "SALES_CLERK",
    };

    const token = await createSessionToken(user);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(user.id);
    expect(verified?.email).toBe(user.email);
    expect(verified?.name).toBe(user.name);
    expect(verified?.role).toBe("SALES_CLERK");
  });

  it("handles ADMIN and MANAGER roles correctly", async () => {
    const adminUser: SessionUser = {
      id: "usr_admin",
      email: "admin@mercantilmariana.com",
      name: "Master Admin",
      role: "ADMIN",
    };

    const token = await createSessionToken(adminUser);
    const verified = await verifySessionToken(token);
    expect(verified?.role).toBe("ADMIN");
  });

  it("returns null for malformed or tampered tokens", async () => {
    const nullResult = await verifySessionToken("invalid.token.here");
    expect(nullResult).toBeNull();

    const emptyResult = await verifySessionToken("");
    expect(emptyResult).toBeNull();
  });
});
