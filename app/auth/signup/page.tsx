import LoginBox from "@/components/auth/LoginBox";
import prisma from "@/lib/storage/prisma";

export default async function Login() {
  const expectedUsers = await prisma.allowedSignups.findMany({});
  return (
    <div className="h-screen w-screen flex flex-col items-center">
      <div className="h-[10%]" />
      <LoginBox type="signup" expectedUsers={expectedUsers} />
    </div>
  );
}
