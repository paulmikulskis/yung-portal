"use server";

import prisma from "@/lib/storage/prisma";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";

async function RefreshStripeConnectFlow() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = createServerComponentClient({ cookies });
  if (!process.env.STRIPE_SECRET_KEY) {
    return { message: "No Stripe secret key found" };
  }
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    return { message: "No active session found" };
  }
  const user = session.data.session?.user;
  if (!user) {
    return { message: "No user found from the session" };
  }
  const dbUser = await prisma.appUser.findFirst({
    where: { email: user.email },
  });
  if (!dbUser) {
    return {
      message: `No user under email "${user.email}" found in the database`,
    };
  }
  const stripeAccountId = dbUser.stripeAcctId;
  if (!stripeAccountId) {
    return {
      message: `No Stripe account found for user "${user.email}"`,
    };
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // The response to your Account Links request includes a value for the key url.
  // Redirect to this link to send your user into the flow.
  // NOTE: users should be authenticated before being redirected to this URL!
  const acctLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    // refresh_url should trigger a method to call Account Links again with the same parameters
    refresh_url: `${origin}/dashboard/banking/onboard/refresh`,
    // redirect to this URL when the user completes the Connect Onboarding flow.  No state passed back.
    return_url: `${origin}/dashboard/banking/onboard/complete`,
    type: "account_onboarding",
  });
  return redirect(acctLink.url);
}

export default RefreshStripeConnectFlow;
