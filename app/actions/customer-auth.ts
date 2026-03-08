"use server";

import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { createCustomerSession, clearCustomerSession, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/types";
import { normalizeEmail } from "@/lib/utils";
import { loginSchema, registerSchema } from "@/lib/validators";

function getNextPath(formData: FormData) {
  const nextPath = String(formData.get("next") || "/account");

  if (!nextPath.startsWith("/")) {
    return "/account";
  }

  return nextPath;
}

export async function customerLoginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await db.user.findUnique({
    where: { email: normalizeEmail(parsed.data.email) },
  });

  if (!user || user.role !== Role.CUSTOMER) {
    return {
      status: "error",
      message: "Invalid credentials.",
    };
  }

  const isValid = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!isValid) {
    return {
      status: "error",
      message: "Invalid credentials.",
    };
  }

  await createCustomerSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  redirect(getNextPath(formData));
}

export async function customerRegisterAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const existing = await db.user.findUnique({
    where: { email },
  });

  if (existing) {
    return {
      status: "error",
      message: "An account with that email already exists.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await db.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  await createCustomerSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  redirect(getNextPath(formData));
}

export async function customerLogoutAction() {
  await clearCustomerSession();
  redirect("/account/login");
}
