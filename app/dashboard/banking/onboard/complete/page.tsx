import { useUser } from "@/components/auth/UserContext";
import { Button } from "@/components/ui/button";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/storage/prisma";
import Stripe from "stripe";
import { inferStripeAccountStatus } from "@/lib/utils";
import { AccountState, AccountStateSchema } from "@/exports/data.types";

const errorPage = (custom?: string) => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">{"Hmmm, something didn't go right..."}</h1>
      <h2 className="text-2xl">
        Seems like there was an error reading your account status with Yungsten
        upon coming back from Stripe, please try again or contact a team member.
      </h2>
      {custom && (
        <>
          <hr />
          <p className="bg-rose-600 p-2 rounded-lg">{custom}</p>
        </>
      )}
      <Button className="w-48">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    </div>
  );
};

async function StripeConnectOnboardComplete() {
  const supabase = createServerComponentClient({ cookies });
  const session = await supabase.auth.getSession();
  const user = session.data.session?.user;
  if (!user) {
    return errorPage;
  }
  const appUser = await prisma.appUser.findUnique({
    where: { email: user.email },
  });
  if (!appUser) {
    return errorPage(`No user found in Yungsten Database for ${user.email}`);
  }
  const stripeAccountId = appUser.stripeAcctId;
  if (!stripeAccountId) {
    return errorPage(
      `No Stripe Account ID found for ${user.email}, please ensure you have started Stripe Connect onboarding correctly via the Yungsten Dashboard.`
    );
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const stripeAccount = await stripe.accounts.retrieve(stripeAccountId);
  const status = inferStripeAccountStatus(stripeAccount);
  console.log(`Stripe Account Status: ${status}`);
  const state: AccountState = AccountStateSchema.parse(appUser.accountState);
  if (status === "PENDING" || status === "RESTRICTED") {
    await prisma.appUser.update({
      where: { email: user.email },
      data: {
        accountState: {
          ...state,
          stripeJourney: "STRIPE_CONNECT_ONBOARD_ERROR",
        },
      },
    });
  } else {
    await prisma.notification.updateMany({
      where: {
        receiverId: appUser.id,
        action: "STRIPE_CONNECT_ONBOARD",
      },
      data: {
        status: "READ",
      },
    });
    await prisma.appUser.update({
      where: { email: user.email },
      data: {
        accountState: {
          ...state,
          stripeJourney: "STRIPE_CONNECT_ONBOARD_SUCCESS",
        },
      },
    });
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">Awesome!</h1>
      <h2 className="text-2xl">
        Getting started with Stripe is the first step to growing your business.
      </h2>
      <hr />
      <Button className="w-48">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    </div>
  );
}

export default StripeConnectOnboardComplete;
