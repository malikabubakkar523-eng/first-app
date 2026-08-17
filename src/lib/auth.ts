import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// Stable JWT secret across all environments and deployments
const secretKeyString =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "veloce_super_secure_jwt_secret_key_shoes_app_2026_x89";

const JWT_SECRET = new TextEncoder().encode(secretKeyString);

const COOKIE_NAME = "veloce_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days persistence

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  avatar?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d") // 30 days valid token
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const getCurrentUser = getSession;

export async function setSessionCookie(user: SessionUser) {
  const token = await createToken(user);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    expires: new Date(Date.now() + SESSION_DURATION_SECONDS * 1000),
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
