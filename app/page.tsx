import Image from "next/image";
import { ModalProvider } from "../providers/ModalProvider";
import LoginBox from "@/components/auth/LoginBox";
import prisma from "@/lib/storage/prisma";

export default async function Home() {
  const allowedSignups = await prisma.allowedSignups.findMany({});
  return (
    <main className="flex min-h-screen flex-col gap-10 px-12 lg:px-40 py-20">
      <div className="flex gap-8">
        <h1 className="text-4xl lg:text-6xl xl:text-8xl">Your</h1>
        <h1
          className="text-4xl lg:text-6xl"
          style={{
            backgroundImage: "linear-gradient(to right, #00BFFF, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {" "}
          <b>homebase</b>
        </h1>
      </div>
      <div className="flex flex-col lg:flex-row gap-2 justify-between items-center">
        <div className="flex flex-col lg:w-[50%]">
          <h2 className="text-2xl lg:text-4xl w-full text-muted-foreground transition-all hover:text-rose-600">
            <b>at Yungsten Tech</b>
          </h2>
          <hr className="w-full my-10 border-muted-foreground" />
          <p className="text-xl pr-20 tracking-wide leading-9">
            A place for our partners, associates, and interested parties to
            communicate and build their digital infrastructure
          </p>
        </div>
        <div className="my-12 lg:my-1">
          <LoginBox type="login" expectedUsers={allowedSignups} />
        </div>
      </div>
      <div className=""></div>
    </main>
  );
}
