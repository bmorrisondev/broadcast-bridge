"use client";

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

export default function SignIn({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return;
    }

		// Initiate the sign in process using the provided username and password
    await signIn.password({
      identifier: email as string,
      password: password as string,
    });
    console.log(signIn);

		// Once the process completes and the status is updated, finalize the session
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: () => {
	        // Redirect to a protected route
          router.push("/onboarding");
        },
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div>
        <div className="text-center">
          <h2 className="text-xl">Welcome back</h2>
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
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}