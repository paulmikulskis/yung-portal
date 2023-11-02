"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Car } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import BackArrowSmall from "@/exports/icons/back-arrow-small";
import { AllowedSignups, AppUser } from "@prisma/client";
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
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { SubmitHandler, useForm } from "react-hook-form";
import { CreateNotificationSchema } from "@/exports/data.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { createNoticationAction } from "@/components/actions/notifications";

const notificationActionTypes = {
  default: {
    label: "default notification",
    action: "ACKNOWLEDGE",
    description: `The user will simply click "Dismiss" to acknowledge the notification.`,
  },
  stripeOnboard: {
    label: "stripe onboard",
    action: "STRIPE_CONNECT_ONBOARD",
    description: `This notification will prompt the user to onboard with stripe.`,
  },
};

type NewNotificationCardProps = {
  dbUsers: (AppUser & { stripeStatus: string })[];
  allowedSignups: AllowedSignups[];
};

function NewNotificationCard(props: NewNotificationCardProps) {
  const form = useForm<z.infer<typeof CreateNotificationSchema>>({
    resolver: zodResolver(CreateNotificationSchema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = form;
  const [open, setOpen] = useState(false);
  const [toggleEntry, setToggleEntry] = useState(true);
  const [selectedNotificationType, setSelectedNotificationType] =
    useState<string>("default");
  const selectedNotificationTypeDetails =
    notificationActionTypes[
      selectedNotificationType as keyof typeof notificationActionTypes
    ];
  const [selectedEmailValue, setSelectedEmailValue] = useState<string | null>(
    null
  );
  const allUsers = [
    ...props.dbUsers,
    ...props.allowedSignups.filter((s) => !s.claimed),
  ];
  const selectedUser = allUsers.find(
    (user) => user.email === selectedEmailValue
  );
  if (toggleEntry) {
    return (
      <Button onClick={() => setToggleEntry(false)} className="w-full p-1">
        New Notification
      </Button>
    );
  }

  const createNotification: SubmitHandler<
    z.infer<typeof CreateNotificationSchema>
  > = async () => {
    const values = getValues();
    const { message, error, notification } = await createNoticationAction({
      ...values,
      receiverEmail: selectedEmailValue ?? values.receiverEmail,
    });
    if (error) {
      console.log(`ERROR: ${error}\n${message}`);
    } else {
      console.log(message);
    }
  };

  return (
    <Card className="w-full h-min">
      <CardHeader>
        <CardTitle>
          <div className="flex flex-row gap-4">
            <button onClick={() => setToggleEntry(true)}>
              <BackArrowSmall className="w-4 mr-2 text-muted-foreground hover:text-foreground" />
            </button>
            <p>Create new notification</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(createNotification)}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-4 items-center">
                <p className="w-1/4">Select user:</p>
                <div className="w-3/4">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                      >
                        {selectedEmailValue
                          ? `${selectedUser?.firstName} - (${selectedUser?.email})`
                          : "Search users..."}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="end">
                      <Command>
                        <CommandInput
                          placeholder="Search email..."
                          className="h-9"
                        />
                        <CommandEmpty>No Users found.</CommandEmpty>
                        <CommandGroup>
                          {allUsers.map((user) => (
                            <CommandItem
                              key={user.email}
                              value={user.email}
                              onSelect={(currentValue) => {
                                setSelectedEmailValue(
                                  currentValue === selectedEmailValue
                                    ? ""
                                    : currentValue
                                );
                                setOpen(false);
                              }}
                            >
                              {user.firstName} {user.lastName}: {user.email}
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedEmailValue === user.email
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Input
                type="hidden"
                value={selectedEmailValue ?? "bitch"}
                {...register("receiverEmail")}
              />
              <Input
                type="hidden"
                value={selectedNotificationTypeDetails.action}
                {...register("action")}
              />
              <Input
                type="text"
                placeholder="Notification title"
                {...register("title")}
              />
              <Textarea
                placeholder="Notification message"
                {...register("body")}
              />

              <div className="w-full flex flex-row gap-4 justify-around">
                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-sm">notification action</Label>
                  <Select
                    onValueChange={(v) => setSelectedNotificationType(v)}
                    value={selectedNotificationType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Notification Types</SelectLabel>
                        <SelectItem value="default">default</SelectItem>
                        <SelectItem value="stripeOnboard">
                          stripe onboard
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full flex flex-col gap-2">
                  <div className="flex flex-row gap-4 items-center">
                    <p className="text-sm text-muted-foreground">type:</p>
                    <p className="text-sm">
                      <i>{selectedNotificationTypeDetails.label}</i>
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedNotificationTypeDetails.description}
                  </p>
                </div>
              </div>
              <Button
                className="w-1/2 mt-8"
                type="submit"
                disabled={isSubmitting || selectedEmailValue === null}
              >
                Create
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default NewNotificationCard;
