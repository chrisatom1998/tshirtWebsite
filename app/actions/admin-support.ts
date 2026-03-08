"use server";

import { SupportTicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/types";
import { supportTicketAdminUpdateSchema } from "@/lib/validators";

export async function updateSupportTicketAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = supportTicketAdminUpdateSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
    adminResponse: formData.get("adminResponse"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the support response fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.supportTicket.update({
    where: { id: parsed.data.ticketId },
    data: {
      status: parsed.data.status,
      adminResponse: parsed.data.adminResponse?.trim() || null,
      resolvedAt:
        parsed.data.status === SupportTicketStatus.RESOLVED || parsed.data.status === SupportTicketStatus.CLOSED
          ? new Date()
          : null,
    },
  });

  revalidatePath("/admin/support");
  revalidatePath("/support");
  revalidatePath("/account");

  return {
    status: "success",
    message: "Ticket updated.",
  };
}
