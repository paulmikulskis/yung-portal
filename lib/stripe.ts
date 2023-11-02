import { AccountStateSchema } from "@/exports/data.types";
import { AppUser } from "@prisma/client";

export const getStripeStatus = (user: AppUser) => {
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
      } else if (accountState.stripeJourney === "STRIPE_CONNECT_ONBOARD_INFO") {
        stripeStatus = "Incomplete";
      }
    }
  }
  return stripeStatus;
};
