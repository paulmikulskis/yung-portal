"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppUser, AllowedSignups } from "@prisma/client";
import { NotificationManager } from "./NotificationManager";
import { Button } from "@/components/ui/button";
import NewNotificationCard from "./ NewNotification";

type CommsTabsProps = {
  dbUser: AppUser;
  dbUsers: (AppUser & { stripeStatus: string })[];
  allowedSignups: AllowedSignups[];
};

function CommsTabs(props: CommsTabsProps) {
  return (
    <Tabs className="w-full" defaultValue="notifications">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
      </TabsList>
      <TabsContent value="notifications">
        <h2 className="mb-4 text-muted-foreground">
          Select a user, then manage their notifications here
        </h2>
        <div className="flex flex-row gap-12 w-full">
          <div className="flex flex-row gap-4 w-full">
            <NotificationManager
              dbUsers={props.dbUsers}
              allowedSignups={props.allowedSignups}
            />
          </div>
          <NewNotificationCard
            dbUsers={props.dbUsers}
            allowedSignups={props.allowedSignups}
          />
        </div>
      </TabsContent>
      <TabsContent value="messages">
        <h2 className="mb-4 text-muted-foreground">
          Communicate with clients via an instant-message style interface
        </h2>
        <p className="mb-4 text-muted-foreground">(coming soon)</p>
      </TabsContent>
    </Tabs>
  );
}

export default CommsTabs;
