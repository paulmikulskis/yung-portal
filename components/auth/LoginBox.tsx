import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/database.types";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Forgot from "./Forgot";
import { AllowedSignups } from "@prisma/client";

type LoginBoxProps = {
  type: "login" | "signup" | "forgot";
  expectedUsers?: AllowedSignups[];
};

export default async function LoginBox(props: LoginBoxProps) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  console.log(`user: ${JSON.stringify(user, null, 2)}`);

  return (
    <div className="border px-8 pb-8 pt-4 flex flex-col rounded-xl border-2 shadow-xl hover:shadow-2xl bg-card">
      <div className="">
        {!user ? (
          props.type === "login" ? (
            <SignIn expectedUsers={props.expectedUsers} />
          ) : (
            <SignUp expectedUsers={props.expectedUsers} />
          )
        ) : props.type === "forgot" ? (
          <Forgot />
        ) : (
          <div className="mt-4">
            <a href="/dashboard">
              <Button variant={"outline"}>go to dashboard</Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
