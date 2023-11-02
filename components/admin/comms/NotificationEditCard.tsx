"use client";
import { Notification } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UpdateNotificationSchema } from "@/exports/data.types";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Form } from "@/components/ui/form";
import { useRef, useState } from "react";
import {
  markNotificationRead,
  updateNotificationContents,
} from "@/components/actions/notifications";
import { KeyedMutator } from "swr";
import DeleteNotification from "./DeleteNotification";

type NotificationEditCardProps = {
  notification: Notification;
  mutate: KeyedMutator<any>;
};

function NotificationEditCard(props: NotificationEditCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  const formRef = useRef<HTMLFormElement>(null);
  const notification = props.notification;
  const form = useForm<z.infer<typeof UpdateNotificationSchema>>({
    resolver: zodResolver(UpdateNotificationSchema),
    defaultValues: {
      notificationId: notification.id,
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = form;

  const updateNotification: SubmitHandler<
    z.infer<typeof UpdateNotificationSchema>
  > = async () => {
    const values = getValues();
    toggleEditMode();
    const { message, error, notification } = await updateNotificationContents(
      values
    );
    if (error) {
      console.log(`ERROR: ${error}\n${message}`);
    } else {
      console.log(message);
      props.mutate();
    }
  };

  const deleteNotification = (notificationId: string) => {
    // API call to delete notification
  };

  return (
    <Card key={notification.id} className="border-muted-foreground">
      <Form {...form}>
        <form ref={formRef} onSubmit={handleSubmit(updateNotification)}>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle className="flex justify-between items-center w-full">
                {isEditing ? (
                  <Input
                    {...register("notificationTitle")}
                    id="title"
                    defaultValue={notification.title}
                  />
                ) : (
                  <p>{notification.title}</p>
                )}
                <Button
                  className="ml-4"
                  onClick={toggleEditMode}
                  variant="outline"
                  type="button"
                >
                  {isEditing ? "Cancel" : "Update"}
                </Button>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <input type="hidden" {...register("notificationId")} />
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                {isEditing ? (
                  <>
                    <Textarea
                      {...register("notificationBody")}
                      id="body"
                      defaultValue={notification.body}
                    />
                  </>
                ) : (
                  <p>{notification.body}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {isEditing ? (
              <>
                <Button
                  type="submit"
                  className="bg-primary/30 hover:bg-primary"
                >
                  Save
                </Button>
              </>
            ) : null}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default NotificationEditCard;
