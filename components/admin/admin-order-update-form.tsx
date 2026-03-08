"use client";

import { OrderStatus } from "@prisma/client";
import { useActionState } from "react";

import { updateOrderAction } from "@/app/actions/admin-orders";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {
  status: "idle",
};

const orderStatusOptions = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.FULFILLED,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
];

export function AdminOrderUpdateForm({
  orderId,
  status,
  shippingCarrier,
  trackingNumber,
  fulfillmentNotes,
}: {
  orderId: string;
  status: OrderStatus;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  fulfillmentNotes?: string | null;
}) {
  const [state, formAction] = useActionState(updateOrderAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select name="status" defaultValue={status}>
            {orderStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Carrier</Label>
          <Input name="shippingCarrier" defaultValue={shippingCarrier || ""} placeholder="UPS" />
        </div>
        <div className="space-y-2">
          <Label>Tracking</Label>
          <Input name="trackingNumber" defaultValue={trackingNumber || ""} placeholder="1Z..." />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Fulfillment notes</Label>
        <Textarea name="fulfillmentNotes" defaultValue={fulfillmentNotes || ""} placeholder="Packed with replacement label and rush handling." />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-moss"}`}>{state.message}</p>
      ) : null}
      <div className="flex justify-end">
        <PendingButton pendingLabel="Saving order...">Save order</PendingButton>
      </div>
    </form>
  );
}
