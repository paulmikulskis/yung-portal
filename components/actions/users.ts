"use server";

import prisma from "@/lib/storage/prisma";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { AccountState } from "@/exports/data.types";
import { AcctType } from "@prisma/client";
import { ExpectedSignupSchema } from "@/exports/auth.types";
import z from "zod";
import { generateOnboardingNotifications } from "@/lib/notifications";

/**
 * It is good to have very detailed error messaging in this funciton since it is highly privileged.
 * @param formData HTML form data
 * @returns
 */
export async function createNewExpectedSignup(
  input: z.infer<typeof ExpectedSignupSchema>
) {
  const supabase = createServerActionClient({ cookies });
  const sesh = await supabase.auth.getSession();
  if (!sesh) {
    const msg =
      "Unauthorized: User attempting to create an allowedSignup not logged in";
    console.log(msg);
    return {
      error: true,
      message: msg,
    };
  }
  const user = sesh.data.session?.user;
  if (!user) {
    const msg =
      "Unauthorized: User attempting to create an allowedSignup not logged in";
    console.log(msg);
    return {
      error: true,
      message: msg,
    };
  }
  const dbUser = await prisma.appUser.findUnique({
    where: { email: user.email },
  });
  if (!dbUser) {
    const msg = `Unauthorized: User "${user.email}" attempting to create an allowedSignup is not found in database`;
    console.log(msg);
    return {
      error: true,
      message: msg,
    };
  }
  const parsedInputs = ExpectedSignupSchema.safeParse(input);
  if (!parsedInputs.success) {
    const msg = `Bad Request: ${parsedInputs.error.message}`;
    console.log(msg);
    return {
      error: true,
      message: msg,
    };
  }
  const expected = parsedInputs.data;

  const accountState: AccountState = {
    stripeJourney: expected.stripeConnectOnboard
      ? "STRIPE_CONNECT_ONBOARD"
      : "NONE",
  };
  const accountTypeFiltered: AcctType =
    expected.accountType === "admin"
      ? "Platform"
      : expected.accountType === "regular"
      ? "Basic"
      : "Basic";
  if (dbUser.acctType !== "Platform" && accountTypeFiltered === "Platform") {
    const msg =
      "Unauthorized: User attempting to create an allowedSignup is not an admin";
    console.log(msg);
    return {
      error: true,
      message: msg,
    };
  }
  const notificationData = generateOnboardingNotifications(
    parsedInputs.data.firstName ?? "colleague",
    accountState,
    accountTypeFiltered
  );

  try {
    console.log(`Creating new user with the following parameters:
        email: ${expected.email}
        firstName: ${expected.firstName}
        lastName: ${expected.lastName}
        businessName: ${expected.businessName}
        accountState: ${JSON.stringify(accountState)}
        accountType: ${accountTypeFiltered}`);

    const newUserSlot = await prisma.allowedSignups.create({
      data: {
        email: expected.email,
        firstName: expected.firstName,
        lastName: expected.lastName,
        businessName: expected.businessName,
        accountState: accountState,
        accountType: accountTypeFiltered,
        notifications: {
          createMany: {
            data: notificationData,
          },
        },
      },
    });
    return {
      message: `Successfully created a new sign up slot for user "${expected.email}" of account type "${accountTypeFiltered}"`,
      error: false,
    };
  } catch (error) {
    console.error(error);
    const msg = "Internal Server Error: Failed to create new user";
    console.log(msg);
    return {
      message: msg,
      error: true,
    };
  }
}
