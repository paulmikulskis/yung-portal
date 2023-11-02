"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import z from "zod";
import { UpdatePasswordSchema } from "@/exports/auth.types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IconContext } from "react-icons";
import BackArrowSmall from "@/exports/icons/back-arrow-small";
import { Label } from "../ui/label";

const Forgot = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [forgotPassword, setForgotPassword] = useState(-1);
  const [resetError, setResetError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof UpdatePasswordSchema>>({
    resolver: zodResolver(UpdatePasswordSchema),
  });

  async function onSubmit(values: z.infer<typeof UpdatePasswordSchema>) {
    setResetError("");
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });
    if (error) {
      setResetError(error.message);
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

  return (
    <div className="w-80">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-2 pt-8 flex flex-col gap-2">
          {resetError && <p className="text-red-500 text-sm">{resetError}</p>}
          <Label htmlFor="email">Your new password:</Label>
          <Input
            {...register("password")}
            type="password"
            name="password"
            placeholder="something less sneaky?"
            className=""
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
          <Input
            {...register("confirmPassword")}
            type="password"
            name="confirmPassword"
            placeholder="one more time..."
            className=""
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <hr className="my-4" />
        <Button variant="secondary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "resetting" : "Reset Password"}
        </Button>
      </form>
    </div>
  );
};

export default Forgot;
