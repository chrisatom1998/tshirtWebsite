import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CUSTOMER_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "@/lib/constants";

type SessionPayload = {
  userId: string;
  email: string;
  role: Role;
  name?: string | null;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

async function setSessionCookie(cookieName: string, session: SessionPayload) {
  const cookieStore = await cookies();
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function clearSessionCookie(cookieName: string) {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

async function getSession(cookieName: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createAdminSession(session: SessionPayload) {
  await setSessionCookie(SESSION_COOKIE_NAME, session);
}

export async function clearAdminSession() {
  await clearSessionCookie(SESSION_COOKIE_NAME);
}

export async function getAdminSession() {
  return getSession(SESSION_COOKIE_NAME);
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session || session.role !== Role.ADMIN) {
    redirect("/admin/login");
  }

  return session;
}

export async function createCustomerSession(session: SessionPayload) {
  await setSessionCookie(CUSTOMER_SESSION_COOKIE_NAME, session);
}

export async function clearCustomerSession() {
  await clearSessionCookie(CUSTOMER_SESSION_COOKIE_NAME);
}

export async function getCustomerSession() {
  const session = await getSession(CUSTOMER_SESSION_COOKIE_NAME);

  if (!session || session.role !== Role.CUSTOMER) {
    return null;
  }

  return session;
}

export async function requireCustomer(nextPath = "/account") {
  const session = await getCustomerSession();

  if (!session) {
    redirect(`/account/login?next=${encodeURIComponent(nextPath)}`);
  }

  return session;
}
