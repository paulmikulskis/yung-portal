import FolderIcon from "@/exports/icons/folder-icon";
import ConvoBubble from "@/exports/icons/convo-bubble";
import Money from "@/exports/icons/money";
import Users from "@/exports/icons/users";
import { AccountState } from "@/exports/data.types";
import { AcctType, Notification, Prisma } from "@prisma/client";
import CommsIcon from "@/exports/icons/comms";
<CommsIcon />;

type HomeDashActionData = (
  | {
      title: string;
      icon: JSX.Element;
      href: string;
      hoverColor: string;
    }
  | {
      title: string;
      icon: JSX.Element;
      href: string;
      hoverColor?: undefined;
    }
)[];

// actions that are always present on the home dashboard
export const defaultHomeActions: HomeDashActionData = [
  {
    title: "Drive",
    icon: <FolderIcon />,
    href: "/dashboard/drive",
    hoverColor: "yellow-500",
  },
];

export const generateHomeDashActions = (
  accountState: AccountState,
  accountType: AcctType,
  userNotifications: Notification[]
) => {
  const actions: HomeDashActionData = [];
  actions.push(...defaultHomeActions);
  if (
    accountState.stripeJourney === "STRIPE_CONNECT_ONBOARD" ||
    accountState.stripeJourney === "STRIPE_CONNECT_ONBOARD_ERROR" ||
    accountState.stripeJourney === "STRIPE_CONNECT_ONBOARD_INFO"
  ) {
    actions.push({
      title: "Set Up Banking",
      icon: <Money />,
      href: `/dashboard/banking/onboard`,
      hoverColor: "red-500",
    });
  }
  if (accountType === "Platform") {
    actions.push({
      title: "Users",
      icon: <Users />,
      href: "/dashboard/admin/users",
    });
    actions.push({
      title: "Comms",
      icon: <CommsIcon />,
      href: "/dashboard/admin/comms",
    });
  } else {
    actions.push({
      title: "Messages",
      icon: <ConvoBubble />,
      href: "/dashboard/convos",
    });
  }
  return actions;
};
