import z from "zod";
import prisma from "@/lib/storage/prisma";

export const SignInSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  })
  .refine((data) => data.email.length > 5, {
    message: "Email must be longer than 5 characters",
    path: ["email"],
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const UpdatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});

export const SignUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    businessName: z
      .string()
      .min(2, "Business name must be at least 2 characters long")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const ExpectedSignupSchema = z.object({
  email: z.string().email(),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters long")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .optional(),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters long")
    .optional(),
  stripeConnectOnboard: z.boolean().default(false).optional(),
  accountType: z.enum(["regular", "admin"]).default("regular"),
});
