"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "../ui/button";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

type HeaderButtonProps = {
  href: string;
  label: string;
  action?: () => void;
};

function HeaderButton(props: HeaderButtonProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  async function handleSignOut() {
    await supabase.auth.signOut();
  }
  return (
    <Button
      key={props.href}
      variant="outline"
      className="text-foreground"
      onClick={
        props.label === "Sign Out"
          ? handleSignOut
          : () => router.push(props.href)
      }
    >
      {props.label}
    </Button>
  );
}

export default HeaderButton;
