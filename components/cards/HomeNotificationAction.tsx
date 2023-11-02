"use client";
import { Notification, NotificationActionType } from "@prisma/client";
import { Button } from "../ui/button";
import { BiCheck } from "react-icons/bi";
import { FaWpforms } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { markNotificationRead } from "../actions/notifications";

const acknowledgeButton = (notification: Notification) => {
  return (
    <form action={markNotificationRead}>
      <input type="hidden" name="notificationId" value={notification.id} />
      <Button
        variant="outline"
        className="px-4 py-0 min-w-[20%] rounded text-muted-foreground hover:text-foreground"
      >
        Dissmiss
      </Button>
    </form>
  );
};

function HomeNotificationAction(props: { notification: Notification }) {
  const router = useRouter();

  switch (props.notification.action) {
    case "ACKNOWLEDGE":
      return acknowledgeButton(props.notification);
    case "STRIPE_CONNECT_ONBOARD":
      return (
        <Button
          variant="outline"
          className="px-4 py-0 min-w-[20%] rounded text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/dashboard/banking/onboard")}
        >
          <div className="flex flex-row items-center gap-2">
            <FaWpforms />
            <p>Get started</p>
          </div>
        </Button>
      );
    default:
      return "Dismiss";
  }
}

export default HomeNotificationAction;
