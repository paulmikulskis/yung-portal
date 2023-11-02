"use client";
import { markNotificationRead } from "@/components/actions/notifications";
import { Button } from "@/components/ui/button";
import { Notification } from "@prisma/client";

type DeleteNotificationProps = {
  notification: Notification;
};

function DeleteNotification(props: DeleteNotificationProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    const formData = new FormData();
    formData.append("notificationId", props.notification.id);
    formData.append("forceDelete", "true");
  };

  return (
    <Button variant="outline" type="submit" onClick={handleSubmit}>
      Delete
    </Button>
  );
}

export default DeleteNotification;
