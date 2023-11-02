import CommsTabs from "@/components/admin/comms/CommsTabs";
import { Button } from "@/components/ui/button";
import { AccountState, AccountStateSchema } from "@/exports/data.types";
import BackArrowSmall from "@/exports/icons/back-arrow-small";
import prisma from "@/lib/storage/prisma";
import { getStripeStatus } from "@/lib/stripe";
import { AppUser } from "@prisma/client";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

async function Comms() {
  const supabase = createServerComponentClient({ cookies });
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    return <div>{"Unauthorized"}</div>;
  }
  const dbUser = await prisma.appUser.findUnique({
    where: {
      email: session?.session?.user.email,
    },
  });
  if (dbUser?.acctType !== "Platform") {
    return <div>{"Unauthorized (nice try)"}</div>;
  }
  const dbUsers = await prisma.appUser.findMany({});
  const allowedSignups = await prisma.allowedSignups.findMany({});

  const preparedUserData = dbUsers.map((user) => {
    const stripeStatus = getStripeStatus(user);
    return {
      stripeStatus,
      ...user,
    };
  });

  return (
    <div className="flex flex-row gap-12 w-full">
      <a href="/dashboard">
        <BackArrowSmall className="w-4 ml-[-0.75rem] text-muted-foreground hover:text-foreground" />
      </a>
      <div className="flex flex-col gap-4 w-full">
        <h1 className="text-4xl">Client Communications</h1>
        <div className="flex flex-col gap-4">
          <CommsTabs
            dbUser={dbUser}
            dbUsers={preparedUserData}
            allowedSignups={allowedSignups}
          />
        </div>
      </div>
    </div>
  );
}

export default Comms;
