import Stripe from "stripe";

export interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  avatarUrl: string;
  billingAddress?: Stripe.Address;
  paymentMethod?: Stripe.PaymentMethod[Stripe.PaymentMethod.Type];
}

export interface Subscription {
  id: string;
  userId: string;
  status?: Stripe.Subscription.Status;
  metadata?: Stripe.Metadata;
  priceId?: string;
  quantity?: number;
  cancelAtPeriodEnd?: boolean;
  created?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  endedAt?: string;
  cancelAt?: string;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  prices?: Stripe.Price[];
}
