"use client";

import { SupportTicketType } from "@prisma/client";
import { useActionState } from "react";

import { submitSupportTicketAction } from "@/app/actions/customer-account";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {
  status: "idle",
};

export function SupportTicketForm({
  defaultEmail,
  defaultName,
  defaultOrderNumber,
}: {
  defaultEmail?: string;
  defaultName?: string | null;
  defaultOrderNumber?: string;
}) {
  const [state, formAction] = useActionState(submitSupportTicketAction, initialState);

  return (
    <form action={formAction} className="glass-panel space-y-5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Request type</Label>
          <Select name="type" defaultValue={SupportTicketType.SUPPORT}>
            <option value={SupportTicketType.SUPPORT}>General support</option>
            <option value={SupportTicketType.RETURN}>Return or exchange</option>
          </Select>
          {state.fieldErrors?.type ? <p className="text-sm text-red-600">{state.fieldErrors.type[0]}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Order number</Label>
          <Input name="orderNumber" defaultValue={defaultOrderNumber || ""} placeholder="TLS-ABC123" />
          {state.fieldErrors?.orderNumber ? <p className="text-sm text-red-600">{state.fieldErrors.orderNumber[0]}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input name="name" defaultValue={defaultName || ""} placeholder="Avery Taylor" />
          {state.fieldErrors?.name ? <p className="text-sm text-red-600">{state.fieldErrors.name[0]}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input name="email" type="email" defaultValue={defaultEmail || ""} placeholder="you@example.com" required />
          {state.fieldErrors?.email ? <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Subject</Label>
        <Input name="subject" placeholder="What can we help with?" required />
        {state.fieldErrors?.subject ? <p className="text-sm text-red-600">{state.fieldErrors.subject[0]}</p> : null}
      </div>
      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea
          name="message"
          placeholder="Share the issue, the item you need help with, and the outcome you want."
          required
        />
        {state.fieldErrors?.message ? <p className="text-sm text-red-600">{state.fieldErrors.message[0]}</p> : null}
      </div>
      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-moss"}`}>{state.message}</p>
      ) : null}
      <PendingButton size="lg" pendingLabel="Submitting request...">
        Submit request
      </PendingButton>
    </form>
  );
}
