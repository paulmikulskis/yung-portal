export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextThemeProvider from "../providers/Theme";

import createClient from "@/lib/supabase-server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import SupabaseProvider from "../providers/SupabaseProvider";
import HeaderNav from "../components/navigation/HeaderNav";
import { cookies } from "next/headers";
import AuthProvider from "@/components/auth/AuthProvider";
import prisma from "@/lib/storage/prisma";
import { UserContext } from "@/components/auth/UserContext";
import { AppUser, Prisma } from "@prisma/client";
import UserContextWrapper from "@/components/auth/UserContextWrapper";
import z from "zod";
import { AccountStateSchema } from "@/exports/data.types";
import {
  generateOnboardingNotifications,
  syncNotificationState,
} from "@/lib/notifications";
import { getAccountType } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yungsten Portal",
  description: "Your gateway to building with Yungsten Tech",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({
    cookies,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  let dbUser: AppUser | null = null;
  if (session?.user) {
    dbUser = await prisma.appUser.findUnique({
      where: {
        email: session.user.email,
      },
    });
    const allowedSignup = await prisma.allowedSignups.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        notifications: true,
      },
    });
    if (allowedSignup !== null && allowedSignup !== undefined) {
      const acctState = AccountStateSchema.parse(
        allowedSignup?.accountState ?? {}
      );
      // this user has never logged in before
      if (
        (dbUser === null || dbUser === undefined) &&
        session.user.email &&
        session.user.id
      ) {
        dbUser = await prisma.appUser.create({
          data: {
            accountState: acctState,
            id: session.user.id,
            email: session.user.email,
            firstName: session.user.user_metadata.firstName,
            lastName: session.user.user_metadata.lastName,
            businessName: session.user.user_metadata.businessName,
            acctType: getAccountType(session.user.email),
            Notification: {
              createMany: {
                data: allowedSignup.notifications.map(
                  ({ title, body, type, status, action, actionData, data }) => {
                    return {
                      title,
                      body,
                      type,
                      status,
                      action,
                      data,
                      actionData:
                        actionData !== null
                          ? (actionData as Prisma.JsonObject)
                          : undefined,
                    };
                  }
                ),
              },
            },
          },
        });
        await prisma.notification.deleteMany({
          where: {
            allowedSignupsId: allowedSignup.id,
          },
        });
        const bucket = await supabase.storage.createBucket(session.user.email);
        const file = await supabase.storage
          .from(session.user.email)
          .upload("welcome.txt", "Welcome to Yungsten Tech file drive!");
        await prisma.allowedSignups.update({
          where: {
            email: session.user.email,
          },
          data: {
            claimed: true,
          },
        });
      }
      const activeAccountState = AccountStateSchema.parse(
        dbUser?.accountState ?? {}
      );
      const dbUserNotifications = await prisma.notification.findMany({
        where: {
          receiverId: dbUser?.id as string,
        },
      });
      syncNotificationState(
        dbUser as AppUser,
        activeAccountState,
        dbUserNotifications
      );
    }
  }

  const accessToken = session?.access_token || null;
  return (
    <html lang="en">
      <body className={`flex flex-col bg-background ${inter.className}`}>
        <NextThemeProvider>
          <AuthProvider accessToken={accessToken}>
            <UserContextWrapper sbUser={session?.user} dbUser={dbUser}>
              <HeaderNav />
              {children}
            </UserContextWrapper>
          </AuthProvider>
        </NextThemeProvider>
      </body>
    </html>
  );
}
