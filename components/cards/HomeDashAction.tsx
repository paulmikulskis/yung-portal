"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

function HomeDashAction({
  title,
  icon,
  hoverColor,
  href,
}: {
  title: string;
  icon: React.ReactNode;
  hoverColor?: string;
  href: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        router.push(href);
      }}
    >
      <Card
        className={`h-48 hover:border-2 text-${
          hoverColor ?? "green-700"
        }/60 hover:text-foreground/80`}
      >
        <CardHeader>
          <CardTitle className="text-foreground/80 ">{title}</CardTitle>
          {/* <CardDescription> */}
        </CardHeader>
        <CardContent className="flex justify-around m-0 p-0">
          <div className="xl:m-4 w-12">{icon}</div>
        </CardContent>
        {/* <CardFooter> */}
      </Card>
    </button>
  );
}

export default HomeDashAction;
