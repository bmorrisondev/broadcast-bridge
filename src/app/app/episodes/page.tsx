"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";

export default function EpisodesPage() {
  const episodes = useQuery(
    api.episodes.listByPodcast
  );

  if (!episodes) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Episodes</h1>
        </div>
        <p className="text-muted-foreground">Select a podcast to view its episodes.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Episodes</h1>
        <Link href={{ pathname: "/app/episodes/new" }}>
          <Button>Add episode</Button>
        </Link>
      </div>

      {episodes === undefined ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : episodes.length === 0 ? (
        <div className="rounded border p-4 text-muted-foreground">
          No episodes yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {episodes.map((ep) => (
            <li key={ep._id} className="rounded border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-medium">{ep.title}</div>
                  {ep.pubDate ? (
                    <div className="text-sm text-muted-foreground">
                      {new Date(ep.pubDate).toLocaleString()}
                    </div>
                  ) : null}
                  {ep.description ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {ep.description}
                    </p>
                  ) : null}
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {ep.duration ? <div>Duration: {ep.duration}</div> : null}
                  {typeof ep.episodeNumber === "number" ? (
                    <div>Episode #{ep.episodeNumber}</div>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
