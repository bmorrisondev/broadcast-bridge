"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import CopyRssButton from "./episodes/CopyRssButton";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

function SubNav() {
  const pathname = usePathname();
  const data = useQuery(api.episodes.listByPodcast);
  const rssUrl =
    typeof window !== "undefined" && data?.podcast?.orgId
      ? `${window.location.origin}/feed/${data.podcast.orgId}.xml`
      : "";
  const linkBase = "/app";
  const items = [
    { href: `${linkBase}/episodes`, label: "Episodes" },
    { href: `${linkBase}/settings`, label: "Settings" },
  ];
  return (
    <div className="border-b">
      <nav className="flex w-full items-center gap-4 px-6">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 px-2 py-3 text-sm transition-colors ${
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          {pathname?.startsWith("/app/episodes") ? (
            <>
              {data?.podcast ? <CopyRssButton rssUrl={rssUrl} /> : null}
              <Link href={{ pathname: "/app/episodes/new" }}>
                <Button>Add episode</Button>
              </Link>
            </>
          ) : null}
        </div>
      </nav>
    </div>
  );
}

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
