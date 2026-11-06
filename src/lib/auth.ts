import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "mercantil-mariana-super-secret-key-2026-bimonetary"
);

export type UserRole = "ADMIN" | "MANAGER" | "SALES_CLERK";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload || !payload.id || !payload.role) {
      return null;
    }
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: NextRequest): Promise<SessionUser | null> {
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      return verifySessionToken(token);
    }
    const cookieToken = req.cookies.get("session_token")?.value;
    if (cookieToken) {
      return verifySessionToken(cookieToken);
    }
  }

  try {
    const cookieStore = cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return null;

    return verifySessionToken(token);
  } catch {
    return null;
  }
}
