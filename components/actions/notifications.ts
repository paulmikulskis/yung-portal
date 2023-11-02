"use server";
import {
  CreateNotificationSchema,
  UpdateNotificationSchema,
} from "@/exports/data.types";
import prisma from "@/lib/storage/prisma";
import { Notification, NotificationStatus } from "@prisma/client";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import z from "zod";

export const markNotificationRead = async (formData: FormData) => {
  const notificationId = formData.get("notificationId") as string;
  const forceDelete = formData.get("forceDelete") === "true";
  const supabase = createServerActionClient({ cookies });
  const sesh = await supabase.auth.getSession();
  const user = sesh.data.session?.user;
  const userDb = await prisma.appUser.findUnique({
    where: {
      email: user?.email,
    },
  });
  if (!userDb) {
    return { message: "User not found", error: true };
  }
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
  });
  if (notification === null) {
    return {
      message: `Notification "${notificationId}" not found`,
      error: true,
    };
  }
  if (userDb.id !== notification?.receiverId) {
    return {
      message: `User not authorized to remove notification "${notification?.id}"`,
      error: true,
    };
  }
  if (forceDelete) {
    await prisma.notification.delete({
      where: {
        id: notification.id,
      },
    });
    revalidatePath(`/dashboard`);
    return { message: `Notification "${notification.id}" deleted` };
  }
  await prisma.notification.update({
    where: {
      id: notification.id,
    },
    data: {
      status: "READ",
    },
  });
  revalidatePath(`/dashboard`);
};

export const updateNotificationContents = async (
  updateData: z.infer<typeof UpdateNotificationSchema>
) => {
  const supabase = createServerActionClient({ cookies });
  const sesh = await supabase.auth.getSession();
  const user = sesh.data.session?.user;
  const userDb = await prisma.appUser.findUnique({
    where: {
      email: user?.email,
    },
  });

  if (!userDb) {
    return { message: "User not found", error: true };
  }
  const notification = await prisma.notification.findUnique({
    where: {
      id: updateData.notificationId,
    },
  });
  if (notification === null) {
    return {
      message: `Notification "${updateData.notificationId}" not found`,
      error: true,
    };
  }
  if (
    (userDb.id !== notification?.receiverId ||
      userDb.id !== notification?.allowedSignupsId) &&
    userDb.acctType !== "Platform"
  ) {
    return {
      message: `User not authorized to update notification "${notification?.id}"`,
      error: true,
    };
  }
  let notificationStatusParsed: NotificationStatus = "UNREAD";
  if (
    updateData.notificationStatus === "UNREAD" ||
    updateData.notificationStatus === "READ"
  ) {
    notificationStatusParsed = updateData.notificationStatus;
  }
  const data: {
    status: NotificationStatus;
    title?: string | undefined;
    body?: string | undefined;
  } = {
    status: notificationStatusParsed,
  };
  if (
    updateData.notificationTitle !== null &&
    updateData.notificationTitle !== undefined
  ) {
    data.title = updateData.notificationTitle;
  }
  if (
    updateData.notificationBody !== null &&
    updateData.notificationBody !== undefined
  ) {
    data.body = updateData.notificationBody;
  }
  const updatedNotification = await prisma.notification.update({
    where: {
      id: notification.id,
    },
    data,
  });
  revalidatePath(`/dashboard/admin/comms`);
  return {
    notification: updatedNotification,
    error: false,
    message: `successfully updated notification ${updatedNotification.id}`,
  };
};

export const createNoticationAction = async (
  createData: z.infer<typeof CreateNotificationSchema>
) => {
  const supabase = createServerActionClient({ cookies });
  const sesh = await supabase.auth.getSession();
  const user = sesh.data.session?.user;
  const userDb = await prisma.appUser.findUnique({
    where: {
      email: user?.email,
    },
  });
  if (!userDb) {
    return { message: "User not found", error: true };
  }
  if (userDb.acctType !== "Platform") {
    return {
      message: `User not authorized to create notification`,
      error: true,
    };
  }
  const receiverId = await prisma.appUser.findUnique({
    where: {
      email: createData.receiverEmail,
    },
  });
  const allowedSignupsId = await prisma.allowedSignups.findUnique({
    where: {
      email: createData.receiverEmail,
    },
  });
  if (!receiverId && !allowedSignupsId) {
    return {
      message: `Receiver "${createData.receiverEmail}" not found`,
      error: true,
    };
  }
  const notification = await prisma.notification.create({
    data: {
      receiverId: receiverId !== null ? receiverId.id : undefined,
      allowedSignupsId:
        allowedSignupsId !== null ? allowedSignupsId.id : undefined,
      title: createData.title,
      body: createData.body,
      status: "UNREAD",
      type: "USER",
      action: createData.action,
    },
  });
  revalidatePath(`/dashboard/admin/comms`);
  return {
    notification,
    error: false,
    message: `successfully created notification ${notification.id}`,
  };
};
