"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/admin-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = {
  status: "idle",
};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input name="email" type="email" placeholder="owner@threadline.local" required />
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
    </form>
  );
}
