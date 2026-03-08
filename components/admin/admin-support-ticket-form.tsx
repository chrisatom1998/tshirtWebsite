"use client";

import { SupportTicketStatus } from "@prisma/client";
import { useActionState } from "react";

import { updateSupportTicketAction } from "@/app/actions/admin-support";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {
  status: "idle",
};

const ticketStatuses = [
  SupportTicketStatus.OPEN,
  SupportTicketStatus.IN_PROGRESS,
  SupportTicketStatus.WAITING_ON_CUSTOMER,
  SupportTicketStatus.RESOLVED,
  SupportTicketStatus.CLOSED,
];

export function AdminSupportTicketForm({
  ticketId,
  status,
  adminResponse,
}: {
  ticketId: string;
  status: SupportTicketStatus;
  adminResponse?: string | null;
}) {
  const [state, formAction] = useActionState(updateSupportTicketAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div className="space-y-2">
        <Label>Status</Label>
        <Select name="status" defaultValue={status}>
          {ticketStatuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Admin response</Label>
        <Textarea name="adminResponse" defaultValue={adminResponse || ""} placeholder="Reply copy that should be visible internally and in the customer account view." />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-moss"}`}>{state.message}</p>
      ) : null}
      <PendingButton pendingLabel="Saving ticket...">Save ticket</PendingButton>
    </form>
  );
}
