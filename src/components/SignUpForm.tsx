"use client";

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export default function SignUp({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [requiresOrg, setRequiresOrg] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return;
    }

    await signUp.password({
      emailAddress: email as string,
      password: password as string,
    });

    await signUp.verifications.sendEmailCode();
    setIsVerifying(true);
  };

  const handleOtpSubmit = async () => {
    if (!otpCode) {
      return;
    }
    await signUp.verifications.verifyEmailCode({
      code: otpCode,
    });

    console.log("signup", signUp);
    console.log("signUp.status", signUp.status);

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: () => {
          router.push("/onboarding");
        },
      });
    }
  };

  if(isVerifying) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-xl">Verifying your email</h2>
          <p>Check your email for a verification code.</p>
          <div className="flex flex-col gap-2 items-center">
            <InputOTP maxLength={6} value={otpCode} onChange={(value) => setOtpCode(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={handleOtpSubmit}>Verify</Button>
          </div>
        </div>
      </div>
    )
  }

  if(requiresOrg) {
    return (
      <div>
        org form
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div>
        <div className="text-center">
          <h2 className="text-xl">Create an account</h2>
        </div>
        <div>
          <form action={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={fetchStatus === "fetching"}
                >
                  Sign up
                </Button>
              </div>
              <div id="clerk-captcha" />
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/sign-in" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}