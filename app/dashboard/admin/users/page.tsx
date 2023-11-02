import UsersTabs from "@/components/admin/users/UsersTabs";
import { AccountState, AccountStateSchema } from "@/exports/data.types";
import BackArrowSmall from "@/exports/icons/back-arrow-small";
import prisma from "@/lib/storage/prisma";
import { AppUser } from "@prisma/client";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

async function ManageUsers() {
  const supabase = createServerComponentClient({ cookies });
  const { data: session } = await supabase.auth.getSession();
  const dbUser = await prisma.appUser.findUnique({
    where: {
      email: session?.session?.user.email,
    },
  });
  if (dbUser?.acctType !== "Platform") {
    return <div>{"Unauthorized (nice try)"}</div>;
  }
  const dbUsers = await prisma.appUser.findMany({});
  const expectedSignups = await prisma.allowedSignups.findMany({
    where: {
      claimed: false,
    },
  });

  const getStripeStatus = (user: AppUser) => {
    const accountState = AccountStateSchema.parse(user.accountState);
    let stripeStatus = "N/A";
    if (accountState.stripeJourney !== "NONE") {
      if (user.stripeAcctId === null || user.stripeAcctId === "") {
        stripeStatus = "Not started";
      } else {
        if (accountState.stripeJourney === "STRIPE_CONNECT_ONBOARD_ERROR") {
          stripeStatus = "Onboard error";
        } else if (
          accountState.stripeJourney === "STRIPE_CONNECT_ONBOARD_SUCCESS"
        ) {
          stripeStatus = "Onboard success";
        } else if (
          accountState.stripeJourney === "STRIPE_CONNECT_ONBOARD_INFO"
        ) {
          stripeStatus = "Incomplete";
        }
      }
    }
    return stripeStatus;
  };
  const preparedUserData = dbUsers.map((user) => {
    const stripeStatus = getStripeStatus(user);
    return {
      stripeStatus,
      ...user,
    };
  });
  const preparedSignupData = expectedSignups.map((signup) => {
    const accountState = AccountStateSchema.parse(signup.accountState);
    return {
      stripeEnlist: accountState.stripeJourney !== "NONE" ? true : false,
      ...signup,
    };
  });

  return (
    <div className="flex flex-row gap-12 w-full">
      <a href="/dashboard">
        <BackArrowSmall className="w-4 ml-[-0.75rem] text-muted-foreground hover:text-foreground" />
      </a>

      <div className="flex flex-col gap-4 w-full">
        <h1 className="text-4xl">Manage Users</h1>
        <div className="flex flex-col gap-4">
          <UsersTabs
            dbUser={dbUser}
            dbUsers={preparedUserData}
            allowedSignups={preparedSignupData}
          />
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;
