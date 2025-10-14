"use client";

import { PropsWithChildren } from "react";
import { useClerk } from "@clerk/nextjs";
import SubNav from "./SubNav";

export default function AppLayout({ children }: PropsWithChildren) {
  const { loaded } = useClerk()

  if(!loaded) {
    return (
      <div className="flex w-full items-center justify-center py-12">
        <svg
          className="size-6 animate-spin text-muted-foreground"
          viewBox="0 0 24 24"
          aria-label="Loading"
          role="status"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col">
      <SubNav />
      <main className="mx-auto w-full max-w-5xl px-6 py-6">{children}</main>
    </div>
  );
}
