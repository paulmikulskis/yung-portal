import { AccountState } from "@/exports/data.types";
import { AppUser, Notification, Prisma } from "@prisma/client";
import prisma from "./storage/prisma";

export const generateOnboardingNotifications = (
  firstName: string,
  accountState: AccountState,
  acctType: "Platform" | "Basic"
) => {
  const notifications: Prisma.NotificationCreateWithoutReceiverInput[] = [];
  if (accountState.stripeJourney === "STRIPE_CONNECT_ONBOARD") {
    notifications.push({
      title: "Complete your Stripe onboarding",
      body:
        `To get your organization hooked up with digital banking,` +
        `Yungsten Tech will need you to complete your Stripe onboarding.  ` +
        `You should see an action card on the home dashboard for getting started.` +
        `Let us know if you have any questions during the process!`,
      type: "SYSTEM",
      action: "STRIPE_CONNECT_ONBOARD",
    });
  }
  if (acctType === "Platform") {
    notifications.push({
      title: "Welcome to the platform!",
      body:
        `Since you're a platform administrator ${firstName}, you have access to the super-admin dashboard.  ` +
        `You can use this dashboard to manage your organization's users, ` +
        `view analytics, and more.  This is basically what our clients see, but with more power and options.`,
      type: "SYSTEM",
      action: "ACKNOWLEDGE",
    });
    notifications.push({
      title: "Create your first user",
      body:
        `In general, we like to whitelist new users to the Yungsten Tech platform by preemptively adding their email addresses to the platform.  ` +
        `If you want to add a new expected user to the platform, you can do so by clicking the "Users" card on the platform dashboard.  `,
      type: "SYSTEM",
      action: "ACKNOWLEDGE",
    });
  } else {
    notifications.unshift({
      title: "Welcome to the app!",
      body:
        `We're excited to partner with you, ${firstName}.  ` +
        `It looks like this is your first time logging in.  ` +
        `You can find notifications and related TODO items in the dashboard notification center here.  ` +
        `We'll be in touch soon!`,
      type: "SYSTEM",
      action: "ACKNOWLEDGE",
    });
  }
  return notifications;
};

export const syncNotificationState = async (
  dbUser: AppUser,
  accountState: AccountState,
  notifications: Notification[]
) => {
  for (const noti of notifications) {
    if (
      noti.action === "STRIPE_CONNECT_ONBOARD" &&
      accountState.stripeJourney === "STRIPE_CONNECT_ONBOARD_SUCCESS"
    ) {
      await prisma.notification.update({
        where: { id: noti.id },
        data: { status: "READ" },
      });
    }
  }
};
