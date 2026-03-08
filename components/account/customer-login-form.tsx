"use client";

import Link from "next/link";
import { useActionState } from "react";

import { customerLoginAction } from "@/app/actions/customer-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {
  status: "idle",
};

export function CustomerLoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction] = useActionState(customerLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath || "/account"} />
      <div className="space-y-2">
        <Label>Email</Label>
        <Input name="email" type="email" placeholder="you@example.com" required />
        {state.fieldErrors?.email ? <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p> : null}
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input name="password" type="password" placeholder="Enter your password" required />
        {state.fieldErrors?.password ? <p className="text-sm text-red-600">{state.fieldErrors.password[0]}</p> : null}
      </div>
      {state.message ? <p className="text-sm text-red-600">{state.message}</p> : null}
      <PendingButton className="w-full" size="lg" pendingLabel="Signing in...">
        Sign in
      </PendingButton>
      <p className="text-sm text-black/60">
        Need an account?{" "}
        <Link href={`/account/register${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="font-semibold text-ink hover:text-clay">
          Create one
        </Link>
      </p>
    </form>
  );
}
