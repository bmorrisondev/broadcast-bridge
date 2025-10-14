"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import CopyRssButton from "./episodes/CopyRssButton";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@clerk/nextjs";

export default function SubNav() {
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
        <OrganizationSwitcher afterSelectOrganizationUrl={"/app/episodes"} />
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
