"use client";

import { useActionState } from "react";
import { Heart } from "lucide-react";

import { toggleWishlistAction, type WishlistActionState } from "@/app/actions/customer-account";
import { PendingButton } from "@/components/ui/pending-button";

const initialState: WishlistActionState = {
  status: "idle",
  wishlisted: false,
};

export function WishlistButton({
  productId,
  pathname,
  initialWishlisted,
}: {
  productId: string;
  pathname: string;
  initialWishlisted: boolean;
}) {
  const [state, formAction] = useActionState(toggleWishlistAction, {
    ...initialState,
    wishlisted: initialWishlisted,
  });

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="pathname" value={pathname} />
      <PendingButton variant={state.wishlisted ? "secondary" : "ghost"} pendingLabel="Saving..." className="w-full sm:w-auto">
        <Heart className={`mr-2 h-4 w-4 ${state.wishlisted ? "fill-current" : ""}`} />
        {state.wishlisted ? "Saved to wishlist" : "Save to wishlist"}
      </PendingButton>
      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-moss"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
