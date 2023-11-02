"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Subscription, UserDetails } from "../exports/stripe.types";
import { User } from "@supabase/auth-helpers-nextjs";
import {
  useSessionContext,
  useUser as useSupaUser,
} from "@supabase/auth-helpers-react";

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase,
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  //const getUserDetails = async (): UserDetails => {}; // prisma select user details
  //const getSubscription = async (): Subscription => {}; // prisma select subscription

  useEffect(() => {
    if (user && !isLoadingDetails && !userDetails && !subscription) {
      // setIsLoadingDetails(true);
      // Promise.allSettled([getUserDetails(), getSubscription()]).then(
      //   ([userDetails, subscription]) => {
      //     if (userDetails.status === "fulfilled") {
      //       setUserDetails(userDetails.value as UserDetails);
      //     }
      //     if (subscription.status === "fulfilled") {
      //       setSubscription(subscription.value as Subscription);
      //     }
      //     setIsLoadingDetails(false);
      //   }
      // );
    } else if (!user && !isLoadingDetails && userDetails && subscription) {
      setUserDetails(null);
      setSubscription(null);
    }
  }, [user, isLoadingDetails]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingDetails,
    subscription,
  };
  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  } else {
    return context;
  }
};
