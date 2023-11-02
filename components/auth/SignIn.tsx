"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import z from "zod";
import { SignInSchema, ForgotPasswordSchema } from "@/exports/auth.types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IconContext } from "react-icons";
import BackArrowSmall from "@/exports/icons/back-arrow-small";
import { AllowedSignups } from "@prisma/client";

type SignInProps = {
  expectedUsers?: AllowedSignups[];
};

const SignIn = (props: SignInProps) => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [forgotPassword, setForgotPassword] = useState(-1);
  const [signInError, setSignInError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
  } = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
  });

  const fpForm = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  async function onSubmit(values: z.infer<typeof SignInSchema>) {
    if (!props.expectedUsers?.find((u) => u.email === values.email)) {
      setSignInError("You are not authorized to use this app");
      return;
    }
    setSignInError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setSignInError(error.message);
      console.log(
        `SUPABASE ERROR, unable to 'signInWithPassword':\n ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
    } else {
      router.push("/dashboard");
    }
  }

  async function onForgotPassword(
    values: z.infer<typeof ForgotPasswordSchema>
  ) {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) {
      console.log(
        `SUPABASE ERROR, unable to 'resetPasswordForEmail':\n ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
    } else {
      setForgotPassword(0);
      fpForm.reset();
    }
  }

  return (
    <div className="w-80">
      {forgotPassword === -1 ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-2 pt-8 flex flex-col gap-2">
            {signInError && (
              <p className="text-red-500 text-sm">{signInError}</p>
            )}
            <Input
              {...register("email")}
              name="email"
              placeholder="shrek@farfaraway.com"
              className=""
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
            <Input
              {...register("password")}
              type="password"
              name="password"
              placeholder="Password"
              className=""
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <hr className="my-4" />
          <div className="p-2">
            <div className="flex flex-col gap-2 justify-between">
              <Button variant="secondary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "logging in..." : "Sign in"}
              </Button>
              <p className="text-muted-foreground mt-4">
                {"Don't have an account with us yet?"}
              </p>
              <a
                href="/auth/signup"
                className="text-muted-foreground hover:underline w-full text-center hover:text-green-600"
              >
                Sign up here
              </a>
              <Button
                onClick={() => setForgotPassword(1)}
                variant="link"
                className="mt-4 text-xs text-muted-foreground hover:underline w-full text-center hover:text-red-600"
              >
                Forgot password
              </Button>
            </div>
          </div>
        </form>
      ) : forgotPassword === 1 ? (
        <div className="flex flex-col">
          <button onClick={() => setForgotPassword(-1)}>
            <BackArrowSmall className="w-4 ml-[-0.75rem] text-muted-foreground hover:text-foreground" />
          </button>
          <form
            onSubmit={fpForm.handleSubmit(onForgotPassword)}
            name="forgot-password"
            id="forgot-password"
          >
            <div className="p-2 flex flex-col gap-2">
              <Input
                {...fpForm.register("email")}
                name="email"
                placeholder="your email"
                className="m-2"
              />
              {fpForm.formState.errors.email && (
                <p className="text-red-500 text-sm">
                  {fpForm.formState.errors.email?.message}
                </p>
              )}
              <hr className="my-2" />
              <div className="flex flex-col gap-2 justify-between m-2">
                <Button
                  variant="secondary"
                  type="submit"
                  form="forgot-password"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "submitting..." : "Send reset link"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <p>Awesome! Check your email</p>
      )}
    </div>
  );
};

export default SignIn;
