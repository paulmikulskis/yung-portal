"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { ExpectedSignupSchema } from "@/exports/auth.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import z from "zod";
import { createNewExpectedSignup } from "../../actions/users";

function NewUserCard() {
  const form = useForm<z.infer<typeof ExpectedSignupSchema>>({
    resolver: zodResolver(ExpectedSignupSchema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = form;

  const formRef = React.useRef<HTMLFormElement>(null);
  const handleDeployClick = () => {
    if (formRef.current && !isSubmitting) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  const handleSubmitNewExpectedUser: SubmitHandler<
    z.infer<typeof ExpectedSignupSchema>
  > = async () => {
    const values = getValues();
    console.log(JSON.stringify(values, null, 2));
    const { message, error } = await createNewExpectedSignup(values);
    if (error) {
      console.log(`ERROR: ${message}`);
    } else {
      reset();
    }
  };
  // set by the "value" props in the SelectContent
  // this can be either "regular" or "admin"
  const [accountTypeSelect, setAccountTypeSelect] = React.useState<
    string | null
  >(null);
  const [selectStripeConnectOnboard, setSelectStripeConnectOnboard] =
    React.useState<boolean | null>(null);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardDescription>
          Add some details so the platform can expect the new client when
          signing up
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleSubmitNewExpectedUser)}
          ref={formRef}
        >
          <CardContent>
            <div className="grid w-full items-center gap-6">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register("email")}
                  name="email"
                  placeholder="shrek@farfaraway.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          setAccountTypeSelect(val);
                          field.onChange(val);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger id="accountType">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent position="popper">
                          <SelectItem value="regular">regular user</SelectItem>
                          <SelectItem value="admin">super admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <div className="flex flex-row items-center gap-2">
                  <Label htmlFor="firstName">First name </Label>
                  <Label
                    htmlFor="firstName"
                    className="text-muted-foreground font-light"
                  >
                    (optional)
                  </Label>
                </div>
                <Input
                  {...register("firstName")}
                  name="firstName"
                  placeholder={`${
                    accountTypeSelect === "regular"
                      ? "Ranjan"
                      : accountTypeSelect === "admin"
                      ? "Parth"
                      : "Gangadhar"
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <div className="flex flex-row items-center gap-2">
                  <Label htmlFor="firstName">Last name </Label>
                  <Label
                    htmlFor="lastName"
                    className="text-muted-foreground font-light"
                  >
                    (optional)
                  </Label>
                </div>
                <Input
                  {...register("lastName")}
                  name="lastName"
                  placeholder={`${
                    accountTypeSelect === "regular"
                      ? "Mishra"
                      : accountTypeSelect === "admin"
                      ? "(The Mighty) Nagraj"
                      : "Shaktimaan"
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
              {accountTypeSelect === "regular" && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex flex-row items-center gap-2">
                      <Label htmlFor="businessName">Business name </Label>
                      <Label
                        htmlFor="businessName"
                        className="text-muted-foreground font-light"
                      >
                        (optional)
                      </Label>
                    </div>
                    <Input
                      {...register("businessName")}
                      name="businessName"
                      placeholder="ESS Analysis"
                    />
                    {errors.businessName && (
                      <p className="text-red-500 text-sm">
                        {errors.businessName.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <FormField
                      control={form.control}
                      name="stripeConnectOnboard"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 ">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Enlist this user for Stripe Connect onboarding
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button type="submit" onClick={() => handleDeployClick()}>
              Deploy
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default NewUserCard;
