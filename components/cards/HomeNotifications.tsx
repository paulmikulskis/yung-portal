"use client";
import type { Notification } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { formatDistanceToNow } from "date-fns";
import { Label } from "../ui/label";
import { Button } from "@/components/ui/button";
import { BiCheck } from "react-icons/bi";
import HomeNotificationAction from "./HomeNotificationAction";

function HomeNotifications({
  notifications,
}: {
  notifications: Notification[];
}) {
  return (
    <div>
      <Label className="text-muted-foreground">Notifications</Label>
      <Accordion type="single" collapsible className="">
        {notifications.map((notification, i) => (
          <AccordionItem key={i} value={notification.id ?? i.toString()}>
            <AccordionTrigger className="w-full">
              <div className="flex flex-row justify-between items-center w-full">
                <p className="text-lg">{notification.title}</p>
                <p className="text-sm mr-4">
                  {formatDistanceToNow(notification.createdAt)} ago
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <p>{notification.body}</p>
              <div className="mt-4 w-full flex flex-row justify-end px-16">
                <HomeNotificationAction notification={notification} />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default HomeNotifications;
