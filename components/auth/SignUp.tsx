"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { SignUpSchema } from "@/exports/auth.types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Label } from "../ui/label";
import { AllowedSignups, AppUser } from "@prisma/client";

type SignUpProps = {
  expectedUsers?: AllowedSignups[];
};

const SignUp = (props: SignUpProps) => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [enteredEmail, setEnteredEmail] = useState("");
  const [signUpState, setSignUpState] = useState(-1);
  const [signInError, setSignInError] = useState("");
  const [foundUser, setFoundUser] = useState<AllowedSignups | null>(null);
  const usse =
    foundUser === null &&
    props.expectedUsers?.find((u) => u.email === enteredEmail);
  if (usse) {
    setFoundUser(usse);
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      firstName: foundUser?.firstName ? foundUser.firstName : undefined,
      lastName: foundUser?.lastName ? foundUser.lastName : undefined,
      businessName: foundUser?.businessName
        ? foundUser.businessName
        : undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof SignUpSchema>) {
    setSignInError("");
    if (!props.expectedUsers?.find((u) => u.email === values.email)) {
      setSignInError("You are not authorized to use this app");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          firstName: values.firstName,
          lastName: values.lastName,
          businessName: values.businessName,
        },
      },
    });
    if (error) {
      setSignInError(error.message);
      console.log(
        `SUPABASE ERROR, unable to 'signUp':\n ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
    } else {
      setSignUpState(1);
    }
  }

  return (
    <div className="w-80">
      {signUpState === 1 ? (
        <div className="flex flex-col gap-4">
          <p className="text-green-500 text-sm">
            {"You're almost there!  Check your email for a confirmation link."}
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              router.push("/auth/login");
            }}
          >
            back to login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-2 pt-8 flex flex-col gap-4">
            {signInError && (
              <p className="text-red-500 text-sm">{signInError}</p>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email")}
                name="email"
                placeholder="shrek@farfaraway.com"
                onChange={(e) => {
                  if (foundUser !== null) {
                    setFoundUser(null);
                    reset({
                      ...getValues(),
                      firstName: undefined,
                      lastName: undefined,
                      businessName: undefined,
                    });
                  }
                  setEnteredEmail(e.target.value);
                }}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                defaultValue={foundUser?.firstName as string}
                {...register("firstName")}
                name="firstName"
                placeholder="Xavier"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                defaultValue={foundUser?.lastName as string}
                {...register("lastName")}
                name="lastName"
                placeholder="Butler"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <div className="flex flex-row items-center gap-2 mb-2">
                <Label htmlFor="businessName">Business</Label>
                <Label
                  htmlFor="businessName"
                  className="text-muted-foreground font-light"
                >
                  (optional)
                </Label>
              </div>
              <Input
                defaultValue={foundUser?.businessName as string}
                {...register("businessName")}
                name="businessName"
                placeholder="Coca-Cola"
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm">
                  {errors.businessName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                {...register("password")}
                type="password"
                name="password"
                placeholder="Password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
              <Input
                {...register("confirmPassword")}
                type="password"
                name="confirmPassword"
                className="mt-3"
                placeholder="One more time..."
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
          <hr className="my-4" />
          <div className="p-2">
            <div className="flex flex-col gap-2 justify-between">
              <Button variant="secondary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "signing up..." : "Sign up now"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default SignUp;
