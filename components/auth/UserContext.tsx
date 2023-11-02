"use client";

import { createContext, useContext } from "react";
import { User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { AppUser } from "@prisma/client";

export const UserContext = createContext<{
  sbUser: User | undefined;
  dbUser: AppUser | null;
} | null>(null);

type UserProviderProps = {
  sbUser: User;
  dbUser: AppUser;
  children: React.ReactNode;
};

const UserProvider = (props: UserProviderProps) => {
  const user = {
    sbUser: props.sbUser,
    dbUser: props.dbUser,
  };
  return (
    <UserContext.Provider value={{ ...user }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;

export const useUser = () => {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return user;
};
