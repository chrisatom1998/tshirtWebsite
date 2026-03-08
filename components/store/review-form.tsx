"use client";

import { useActionState } from "react";

import { saveReviewAction } from "@/app/actions/customer-account";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {
  status: "idle",
};

export function ReviewForm({
  productId,
  pathname,
  initialReview,
}: {
  productId: string;
  pathname: string;
  initialReview?: {
    rating: number;
    title: string | null;
    body: string;
  } | null;
}) {
  const [state, formAction] = useActionState(saveReviewAction, initialState);

  return (
    <form action={formAction} className="glass-panel space-y-5 p-6">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="pathname" value={pathname} />
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Your review</p>
        <h3 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">
          {initialReview ? "Update your take" : "Leave feedback"}
        </h3>
      </div>
      <div className="space-y-2">
        <Label>Rating</Label>
        <Select name="rating" defaultValue={String(initialReview?.rating || 5)}>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} star{value === 1 ? "" : "s"}
            </option>
          ))}
        </Select>
        {state.fieldErrors?.rating ? <p className="text-sm text-red-600">{state.fieldErrors.rating[0]}</p> : null}
      </div>
      <div className="space-y-2">
        <Label>Headline</Label>
        <Input name="title" placeholder="Fit, print, and feel" defaultValue={initialReview?.title || ""} />
        {state.fieldErrors?.title ? <p className="text-sm text-red-600">{state.fieldErrors.title[0]}</p> : null}
      </div>
      <div className="space-y-2">
        <Label>Review</Label>
        <Textarea
          name="body"
          placeholder="How did the tee fit, feel, and hold up after wear?"
          defaultValue={initialReview?.body || ""}
          required
        />
        {state.fieldErrors?.body ? <p className="text-sm text-red-600">{state.fieldErrors.body[0]}</p> : null}
      </div>
      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-moss"}`}>{state.message}</p>
      ) : null}
      <PendingButton pendingLabel="Saving review...">{initialReview ? "Update review" : "Submit review"}</PendingButton>
    </form>
  );
}
