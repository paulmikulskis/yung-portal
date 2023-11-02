import { type ClassValue, clsx } from "clsx";
import Stripe from "stripe";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAccountType(email: string) {
  const adminEmails = [
    "mikulskisp@gmail.com",
    "parth.d.nagraj@gmail.com",
    "parth@yungsten.tech",
    "paul@yungsten.tech",
    //"pineappaul@yungsten.tech",
  ];
  if (adminEmails.includes(email)) {
    return "Platform";
  } else {
    return "Basic";
  }
}

/**
 * Infers the status of a Stripe Connect account based on its requirements and payouts enabled status.
 * This function is used to determine the status of a Stripe Connect account based on its requirements and payouts enabled status.
 * A Stripe Connect account can have one of three statuses: "PENDING", "RESTRICTED", or "COMPLETE". A "PENDING" status means that the account is not yet fully set up and payouts are not yet enabled. A "RESTRICTED" status means that the account is set up, but there are outstanding requirements that need to be met before payouts can be enabled. A "COMPLETE" status means that the account is fully set up and payouts are enabled.
 * This function takes a Stripe Connect account object as input and returns the inferred status of the account based on its requirements and payouts enabled status. If the payouts enabled status is undefined or the requirements object is undefined, the function returns "PENDING". If the requirements object has any past due or currently due requirements, the function returns "RESTRICTED". If the payouts enabled status is true and there are no past due or currently due requirements, the function returns "COMPLETE".
 * @param account - The Stripe Connect account to infer the status of.
 * @returns The inferred status of the Stripe Connect account. Possible values are "PENDING", "RESTRICTED", or "COMPLETE".
 * @see {@link https://stripe.com/docs/connect/account-statuses | Stripe Connect Account Statuses}
 */
export function inferStripeAccountStatus(account: Stripe.Account) {
  const accountRequirements = account.requirements;
  const accountPayoutsEnabled = account.requirements;
  if (
    accountPayoutsEnabled === undefined ||
    accountRequirements === undefined
  ) {
    return "PENDING";
  }
  const pastDue = accountRequirements.past_due;
  const currentlyDue = accountRequirements.currently_due;
  const payoutsEnabled = account.payouts_enabled;
  if (pastDue === null && currentlyDue === null && payoutsEnabled === true) {
    return "COMPLETE";
  }
  if (
    (pastDue as string[]).length > 0 ||
    (currentlyDue as string[]).length > 0
  ) {
    return "RESTRICTED";
  } else if (!payoutsEnabled) {
    return "PENDING";
  } else return "COMPLETE";
}
