"use client";
import { AllowedSignups, AppUser } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { formatISO } from "date-fns";

export const userDataTableColumns: ColumnDef<
  AppUser & { stripeStatus: string }
>[] = [
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Account Type",
    accessorKey: "acctType",
  },
  {
    header: "Organization",
    accessorKey: "organization",
    cell: ({ row }) => {
      const result = row.getValue("organization");
      return <div className="w-full text-center">{`${result ?? "-"}`}</div>;
    },
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const result = formatISO(row.getValue("createdAt"), {
        representation: "date",
      });
      return <div>{result}</div>;
    },
  },
  {
    header: "Stripe Status",
    accessorKey: "stripeStatus",
  },
];

type AllowedColumns = AllowedSignups & { stripeEnlist: boolean };

export const allowedSignupsColumns: ColumnDef<AllowedColumns>[] = [
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Account Type",
    accessorKey: "accountType",
  },
  {
    header: "Business Name",
    accessorKey: "businessName",
    cell: ({ row }) => {
      const result = row.getValue("businessName");
      return <div className="w-full text-center">{`${result ?? "-"}`}</div>;
    },
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const result = formatISO(row.getValue("createdAt"), {
        representation: "date",
      });
      return <div>{result}</div>;
    },
  },
  {
    header: "Stripe Enlist?",
    accessorKey: "stripeEnlist",
  },
];
