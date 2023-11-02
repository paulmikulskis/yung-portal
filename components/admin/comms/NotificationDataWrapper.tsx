import useSWR from "swr";
import { Notification } from "@prisma/client";
import NotificationEditCard from "./NotificationEditCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type NotificationDataWrapperProps = {
  searchEmail: string;
};

type Error = {
  error: string;
};

type NotificationData = Notification[] | Error;

const fetcher = (...args: unknown[] | [RequestInfo, RequestInit]) =>
  fetch(...(args as [RequestInfo, RequestInit])).then((res) => res.json());

function NotificationDataWrapper(props: NotificationDataWrapperProps) {
  const { data, error, isLoading, mutate } = useSWR<NotificationData>(
    `/dashboard/admin/api/notifications?forEmail=${props.searchEmail}`,
    fetcher
  );

  if (data && Array.isArray(data)) {
    return (
      <div className="w-full">
        <Tabs className="w-full" defaultValue="UNREAD">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="UNREAD" className="w-full">
              Unacknowledged
            </TabsTrigger>
            <TabsTrigger value="READ" className="w-full">
              Acknowledged
            </TabsTrigger>
          </TabsList>
          <TabsContent value="UNREAD" className="w-full">
            <div className="flex flex-col space-y-4 w-full">
              {data
                .filter((d) => d.status === "UNREAD")
                .map((notification) => (
                  <NotificationEditCard
                    key={notification.id}
                    notification={notification}
                    mutate={mutate}
                  />
                ))}
            </div>
          </TabsContent>
          <TabsContent value="READ" className="w-full">
            <div className="flex flex-col space-y-4 w-full">
              {data
                .filter((d) => d.status === "READ")
                .map((notification) => (
                  <NotificationEditCard
                    key={notification.id}
                    notification={notification}
                    mutate={mutate}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (data && !Array.isArray(data)) {
    return <p>Error loading notifications: {data.error}</p>;
  }

  if (error?.message) {
    return <p>Error loading notifications: {error?.message}</p>;
  }

  return <p>No notifications</p>;
}

export default NotificationDataWrapper;
