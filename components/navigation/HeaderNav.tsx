import Image from "next/image";
import { mainNavAnon, mainNavAuth } from "../../exports/appNav.types";
import { Button } from "@/components/ui/button";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import HeaderButton from "./HeaderButton";

async function HeaderNav() {
  const supabase = createServerComponentClient({ cookies });
  const sesh = supabase.auth.getSession();
  const { data: session } = await sesh;
  const user = session.session?.user;
  const navs = user ? mainNavAuth : mainNavAnon;

  return (
    <div className="h-16 flex flex-row items-center justify-between w-full bg-secondary px-4">
      <a href="/">
        <Image
          src="/logo.png"
          width={38}
          height={38}
          alt="logo"
          className="mx-4"
        />
      </a>
      <ul className="flex flex-row items-center justify-between gap-4 px-4 py-1 text-primary-foreground">
        {navs.map((nav) => (
          <HeaderButton key={nav.href} href={nav.href} label={nav.label} />
        ))}
      </ul>
    </div>
  );
}

export default HeaderNav;
