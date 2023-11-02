type NavigationItem = {
  href: string;
  label: string;
};

export const mainNavBase: NavigationItem[] = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "https://www.yungstentech.com/about",
    label: "About",
  },
];

export const mainNavAnon: NavigationItem[] = [
  ...mainNavBase,
  {
    href: "/auth/login",
    label: "Sign In",
  },
];

export const mainNavAuth: NavigationItem[] = [
  ...mainNavBase,
  // {
  //   href: "/account",
  //   label: "Account",
  // },
  {
    href: "/auth/logout",
    label: "Sign Out",
  },
];
