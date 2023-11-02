import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ConvoBubble from "@/exports/icons/convo-bubble";
import FolderIcon from "@/exports/icons/folder-icon";
import HomeDashAction from "@/components/cards/HomeDashAction";
import HomeNotifications from "@/components/cards/HomeNotifications";
import Money from "@/exports/icons/money";
import type { Notification } from "@prisma/client";
import prisma from "@/lib/storage/prisma";
import { generateHomeDashActions } from "@/lib/homeDashActions";
import { AccountStateSchema } from "@/exports/data.types";

async function DashboardHome() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }
  const dbUser = await prisma.appUser.findUnique({
    where: {
      email: user.email,
    },
    select: {
      accountState: true,
      acctType: true,
      Notification: {
        where: {
          status: "UNREAD",
        },
      },
    },
  });
  if (!dbUser) {
    redirect("/");
  }
  const loadedNotifications = dbUser?.Notification ?? [];
  const accountState = AccountStateSchema.parse(dbUser?.accountState ?? {});

  // generate the action cards for the home dashboard based on the account state and
  // potentially any pending notifications
  let actionCards = generateHomeDashActions(
    accountState,
    dbUser.acctType,
    loadedNotifications
  );

  return (
    <div className="flex flex-col p-8 lg:p-20 ">
      <p className="text-4xl mb-10">Welcome, {user.user_metadata.firstName}</p>
      <div className="flex flex-col md:flex-row gap-4 w-full lg:flex-row-reverse items-start">
        <div className="lg:w-[50%]">
          <HomeNotifications notifications={loadedNotifications} />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 md:px-8 gap-4 lg:w-[50%]">
          {actionCards.map((card) => (
            <HomeDashAction
              key={card!.title}
              href={card!.href}
              title={card!.title}
              icon={card!.icon}
              hoverColor={card?.hoverColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
