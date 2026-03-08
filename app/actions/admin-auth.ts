"use server";

import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { createAdminSession, verifyPassword, clearAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/types";
import { normalizeEmail } from "@/lib/utils";
import { loginSchema } from "@/lib/validators";

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
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

  if (!user || user.role !== Role.ADMIN) {
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

  await createAdminSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
