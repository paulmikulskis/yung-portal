"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppUser, AllowedSignups } from "@prisma/client";
import UserDataTable from "./UserDataTable";
import {
  userDataTableColumns,
  allowedSignupsColumns,
} from "./UserDataTableCols";
import NewUserCard from "./NewUserCard";

type UserTabsProps = {
  dbUser: AppUser;
  dbUsers: (AppUser & { stripeStatus: string })[];
  allowedSignups: (AllowedSignups & { stripeEnlist: boolean })[];
};

function UsersTabs(props: UserTabsProps) {
  return (
    <Tabs className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All users</TabsTrigger>
        <TabsTrigger value="pending">Pending Signups</TabsTrigger>
        <TabsTrigger value="new">New Signup Slot</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <h2 className="mb-4 text-muted-foreground">
          Lists all application users on the platform
        </h2>
        <UserDataTable data={props.dbUsers} columns={userDataTableColumns} />
      </TabsContent>
      <TabsContent value="pending">
        <h2 className="mb-4 text-muted-foreground">
          View all signups that have not yet been claimed
        </h2>
        <UserDataTable
          data={props.allowedSignups}
          columns={allowedSignupsColumns}
        />
      </TabsContent>
      <TabsContent value="new">
        <h2 className="mb-4 text-muted-foreground">
          Create a new signup slot for a new user
        </h2>
        <NewUserCard />
      </TabsContent>
    </Tabs>
  );
}

export default UsersTabs;
