"use client";

import { CouponType } from "@prisma/client";
import { useActionState } from "react";

import { saveCouponAction } from "@/app/actions/admin-coupons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/types";
import { formatDateTimeLocalInput, formatPriceInput } from "@/lib/utils";

const initialState: ActionState = {
  status: "idle",
};

export function AdminCouponForm({
  initialValues,
}: {
  initialValues?: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    type: CouponType;
    amount: number;
    minimumSubtotal: number;
    usageLimit: number | null;
    startsAt: Date | null;
    endsAt: Date | null;
    isActive: boolean;
  };
}) {
  const [state, formAction] = useActionState(saveCouponAction, initialState);
  const amountValue =
    initialValues?.type === CouponType.FIXED_AMOUNT ? formatPriceInput(initialValues.amount) : String(initialValues?.amount || 10);

  return (
    <form action={formAction} className="space-y-5 rounded-[1.75rem] border border-black/10 bg-white/80 p-5">
      {initialValues ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input name="title" defaultValue={initialValues?.title || ""} placeholder="Welcome discount" required />
          {state.fieldErrors?.title ? <p className="text-sm text-red-600">{state.fieldErrors.title[0]}</p> : null}
        </div>
        <div className="space-y-2">
          <Label>Code</Label>
          <Input name="code" defaultValue={initialValues?.code || ""} placeholder="WELCOME10" required />
          {state.fieldErrors?.code ? <p className="text-sm text-red-600">{state.fieldErrors.code[0]}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea name="description" defaultValue={initialValues?.description || ""} placeholder="Short note customers see in the cart." />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select name="type" defaultValue={initialValues?.type || CouponType.PERCENTAGE}>
            <option value={CouponType.PERCENTAGE}>Percentage</option>
            <option value={CouponType.FIXED_AMOUNT}>Fixed amount</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input name="amount" type="number" min="0" step="0.01" defaultValue={amountValue} required />
        </div>
        <div className="space-y-2">
          <Label>Min subtotal</Label>
          <Input
            name="minimumSubtotal"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initialValues ? formatPriceInput(initialValues.minimumSubtotal) : ""}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label>Usage limit</Label>
          <Input name="usageLimit" type="number" min="1" step="1" defaultValue={initialValues?.usageLimit || ""} placeholder="Optional" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Starts at</Label>
          <Input name="startsAt" type="datetime-local" defaultValue={formatDateTimeLocalInput(initialValues?.startsAt)} />
        </div>
        <div className="space-y-2">
          <Label>Ends at</Label>
          <Input name="endsAt" type="datetime-local" defaultValue={formatDateTimeLocalInput(initialValues?.endsAt)} />
        </div>
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-canvas/70 px-4 py-3 text-sm text-black/65">
        <input type="checkbox" name="isActive" defaultChecked={initialValues?.isActive ?? true} />
        Coupon is active
      </label>
      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-moss"}`}>{state.message}</p>
      ) : null}
      <PendingButton pendingLabel="Saving coupon...">{initialValues ? "Update coupon" : "Create coupon"}</PendingButton>
    </form>
  );
}
