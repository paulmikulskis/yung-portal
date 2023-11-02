"use client";

import { User } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { AppUser } from "@prisma/client";
import { UserContext } from "./UserContext";

type UserProviderProps = {
  sbUser: User | undefined;
  dbUser: AppUser | null;
  children: React.ReactNode;
};

function UserContextWrapper(props: UserProviderProps) {
  return (
    <>
      <UserContext.Provider
        value={{ dbUser: props.dbUser, sbUser: props.sbUser }}
      >
        {props.children}
      </UserContext.Provider>
    </>
  );
}

export default UserContextWrapper;
