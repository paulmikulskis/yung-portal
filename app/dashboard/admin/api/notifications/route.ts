import prisma from "@/lib/storage/prisma";
import { Notification } from "@prisma/client";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const userEmailToFetch = request.nextUrl.searchParams.get("forEmail");
  if (!userEmailToFetch) {
    return new NextResponse(
      JSON.stringify({
        error: `must specify forUserId query param, received ${userEmailToFetch}`,
      }),
      { status: 400 }
    );
  }
  const supabase = createRouteHandlerClient({ cookies });

  const sesh = await supabase.auth.getSession();
  const user = sesh.data.session?.user;
  const dbUser = await prisma.appUser.findFirst({
    where: { email: user?.email },
  });
  if (!dbUser) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (dbUser.email !== userEmailToFetch && dbUser.acctType !== "Platform") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const dbUserEmailToFetchNotificationsFor = await prisma.appUser.findFirst({
    where: { email: userEmailToFetch },
  });
  const allowedSignupToFetchNotificationsFor =
    await prisma.allowedSignups.findFirst({
      where: { email: userEmailToFetch },
    });
  if (
    !dbUserEmailToFetchNotificationsFor &&
    !allowedSignupToFetchNotificationsFor
  ) {
    return new NextResponse(
      JSON.stringify({
        error: `no user or pending allowed signup found for email "${userEmailToFetch}"`,
      }),
      { status: 400 }
    );
  }
  let allowedSignupNotifications: Notification[] = [];
  let dbUserNotifications: Notification[] = [];
  allowedSignupToFetchNotificationsFor &&
    (allowedSignupNotifications = await prisma.notification.findMany({
      where: { allowedSignupsId: allowedSignupToFetchNotificationsFor.id },
      orderBy: { createdAt: "desc" },
    }));
  dbUserEmailToFetchNotificationsFor &&
    (dbUserNotifications = await prisma.notification.findMany({
      where: { receiverId: dbUserEmailToFetchNotificationsFor.id },
      orderBy: { createdAt: "desc" },
    }));

  return new NextResponse(
    JSON.stringify(
      dbUserEmailToFetchNotificationsFor !== null
        ? dbUserNotifications
        : allowedSignupNotifications
    ),
    {
      headers: { "content-type": "application/json" },
      status: 200,
    }
  );
}
