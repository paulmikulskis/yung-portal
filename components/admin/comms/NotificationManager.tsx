"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AllowedSignups, AppUser, Notification } from "@prisma/client";
import NotificationDataWrapper from "./NotificationDataWrapper";

type NotificationManagerProps = {
  dbUsers: (AppUser & { stripeStatus: string })[];
  allowedSignups: AllowedSignups[];
};

export function NotificationManager(props: NotificationManagerProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | null>(null);
  const [activeNotifications, setActiveNotifications] = React.useState<
    Notification[] | null
  >(null);
  const allUsers = [
    ...props.dbUsers,
    ...props.allowedSignups.filter((s) => !s.claimed),
  ];
  const selectedUser = allUsers.find((user) => user.email === value);
  return (
    <div className="flex flex-col gap-4 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? `${selectedUser?.firstName} - (${selectedUser?.email})`
              : "Search users..."}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="end">
          <Command>
            <CommandInput placeholder="Search email..." className="h-9" />
            <CommandEmpty>No Users found.</CommandEmpty>
            <CommandGroup>
              {allUsers.map((user) => (
                <CommandItem
                  key={user.email}
                  value={user.email}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {user.firstName} {user.lastName}: {user.email}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === user.email ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="w-full">
        {value !== null ? (
          <NotificationDataWrapper searchEmail={value} />
        ) : (
          <div className="flex flex-col">
            <p className="text-sm text-gray-500">No user selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
