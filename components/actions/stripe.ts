"use server";

import prisma from "@/lib/storage/prisma";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripeNoAcctErrMsg =
  "You requested an account link for an account that is not connected to your platform or does not exist.";
export async function createConnectedStripeAccountInner() {
  let acctLink: Stripe.Response<Stripe.AccountLink> | null = null;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = createServerActionClient({ cookies });
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
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const userDb = await prisma.appUser.findUnique({
    where: { id: user.id },
  });
  if (!userDb) {
    return { message: "No user found in the database" };
  }
  let acctId = userDb.stripeAcctId;
  if (acctId === null) {
    try {
      const acct = await stripe.accounts.create({
        type: "standard",
        country: "US",
      });
      if (!acct.id) {
        return {
          message: `Error creating Stripe account for user "${user.email}": ${acct}`,
        };
      }
      const dbRes = await prisma.appUser.update({
        where: { id: user.id },
        data: { stripeAcctId: acct.id },
      });
      acctId = dbRes.stripeAcctId;
    } catch (error) {
      return {
        message: `Error creating Stripe account for user "${user.email}": ${
          (error as Error).message
        }`,
      };
    }
  }
  if (!acctId) {
    return {
      message: `there was an issue creating or retrieving the Stripe Account ID for user "${user.email}"`,
    };
  }
  try {
    // The response to your Account Links request includes a value for the key url.
    // Redirect to this link to send your user into the flow.
    // NOTE: users should be authenticated before being redirected to this URL!
    acctLink = await stripe.accountLinks.create({
      account: acctId,
      // refresh_url should trigger a method to call Account Links again with the same parameters
      refresh_url: `${origin}/dashboard/banking/onboard/refresh`,
      // redirect to this URL when the user completes the Connect Onboarding flow.  No state passed back.
      return_url: `${origin}/dashboard/banking/onboard/complete`,
      type: "account_onboarding",
    });
  } catch (error) {
    const msg = (error as Error).message;
    console.log(
      `Error creating Stripe account for user "${user.email}", StripeAcct = "${acctId}": ${msg}`
    );
    if (msg === stripeNoAcctErrMsg) {
      console.log(
        `...the old StripeAccount "${acctId}" listed for user "${user.email}" is no longer valid.  Removing it from the database.`
      );
      await prisma.appUser.update({
        where: { id: user.id },
        data: { stripeAcctId: null },
      });
      return { message: "No account link found" };
    }
    return {
      message: `Error creating Stripe account: ${msg}`,
    };
  }
  if (acctLink === null) {
    return { message: "No account link found" };
  }
  console.log(
    `created connected Stripe account for user "${user.email}",\n  ${acctLink?.url}`
  );
  return redirect(acctLink.url);
}

export async function createConnectedStripeAccount() {
  "use server";
  await createConnectedStripeAccountInner(); // Simply add await
}
