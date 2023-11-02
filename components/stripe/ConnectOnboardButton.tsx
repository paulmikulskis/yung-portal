"use client";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { createConnectedStripeAccount } from "../actions/stripe";
import { startTransition } from "react";
import { redirect } from "next/navigation";

function ConnectOnboardButton() {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Button className="w-48" variant="destructive" disabled={true}>
        Stripe Error
      </Button>
    );
  }
  // const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return (
    <form action={createConnectedStripeAccount}>
      <Button className="w-48" type="submit">
        Start
      </Button>
    </form>
  );
}

export default ConnectOnboardButton;
