import LoginBox from "@/components/auth/LoginBox";
import prisma from "@/lib/storage/prisma";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getSession();
  const expectedUsers = await prisma.allowedSignups.findMany({});

  if (data?.session) {
    redirect("/dashboard");
  }
  return (
    <div className="h-screen w-screen flex flex-col items-center">
      <div className="h-[10%]" />
      <LoginBox type="login" expectedUsers={expectedUsers} />
    </div>
  );
}
