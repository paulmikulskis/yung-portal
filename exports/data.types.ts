import z from "zod";

export const UpdateNotificationSchema = z.object({
  notificationId: z.string(),
  notificationTitle: z.string().optional(),
  notificationBody: z.string().optional(),
  notificationStatus: z.enum(["UNREAD", "READ"]).optional(),
});

export const CreateNotificationSchema = z.object({
  receiverEmail: z.string(),
  title: z.string(),
  body: z.string(),
  action: z.enum(["ACKNOWLEDGE", "STRIPE_CONNECT_ONBOARD"]),
});

export const NotificationSchema = z.object({
  id: z.string().nullable().default(null),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().nullable().optional(),
  receiver: z.object({
    id: z.string(),
  }),
  title: z.string(),
  status: z.enum(["UNREAD", "READ"]),
  type: z.enum(["SYSTEM"]),
  action: z.enum(["ACKNOWLEDGE"]),
  actionData: z.record(z.unknown()).optional(),
  body: z.string(),
  data: z.string().nullable().optional(),
  href: z.string().nullable().optional(),
});

export const AccountStateSchema = z.object({
  stripeJourney: z
    .enum([
      "NONE",
      "STRIPE_CONNECT_ONBOARD",
      "STRIPE_CONNECT_ONBOARD_ERROR",
      "STRIPE_CONNECT_ONBOARD_SUCCESS",
      "STRIPE_CONNECT_ONBOARD_INFO",
    ])
    .default("NONE"),
});
export type AccountState = z.infer<typeof AccountStateSchema>;

export type Notification = z.infer<typeof NotificationSchema>;

export type SupabaseFileNode = {
  id: string | null;
  name: string;
  folder: boolean;
  metadata: {
    eTag: string | null;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
  } | null;
  created_at: Date | null;
  updated_at: Date | null;
  last_accessed_at: Date | null;
  children: SupabaseFileNode[] | null;
};

export type FileTreeNodes = Record<
  string,
  { name: string; type: "file" | "dir" }[]
>;
