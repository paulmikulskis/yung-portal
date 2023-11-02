import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import prisma from "@/lib/storage/prisma";
import { AuthTokenResponse } from "@supabase/supabase-js";
async function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createServerComponentClient({
    cookies: () => cookies(),
  });
  const allowedSignups = await prisma.allowedSignups.findMany({
    select: {
      email: true,
    },
  });
  const code = searchParams?.code;
  if (code) {
    // We have a code, so let's exchange it for a session
    await supabase.auth
      .exchangeCodeForSession(code as string)
      .then(async (resp: AuthTokenResponse) => {
        if (resp.error) {
          alert(resp.error.message);
        }
        if (resp.data.user?.email) {
          // do not create a user if they are not in the allowed signups list
          if (
            !allowedSignups.find(
              (signup) => signup.email === resp.data.user?.email
            )
          ) {
            await supabase.auth.signOut();
            return;
          }
        }
        const user = resp?.data.user;
        if (user) {
          alert("creating user");
          await prisma.appUser.create({
            data: {
              email: user.email || "",
              firstName: user.user_metadata.firstName,
              lastName: user.user_metadata.lastName,
            },
          });
        } else {
          alert("no user");
        }
      });
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-6xl font-bold">
        Welcome to Yungsten Tech, {"friend"}
      </h1>
    </div>
  );
}

export default Page;
