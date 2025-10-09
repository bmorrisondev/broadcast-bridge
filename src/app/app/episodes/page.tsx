"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EpisodesPage() {
  const router = useRouter();
  const data = useQuery(api.episodes.listByPodcast);

  // Redirect to onboarding if there is no podcast set up yet
  useEffect(() => {
    if (data && data.podcast === null) {
      router.replace("/app/onboarding");
    }
  }, [data, router]);

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Episodes</h1>
        <Link href={{ pathname: "/app/episodes/new" }}>
          <Button>Add episode</Button>
        </Link>
      </div>

      {data === undefined ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : data.podcast === null ? (
        <p className="text-muted-foreground">Redirecting…</p>
      ) : data.episodes.length === 0 ? (
        <div className="rounded border p-4 text-muted-foreground">
          No episodes yet.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Podcast header */}
          <div className="flex items-center gap-4">
            {data.podcast?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.podcast.imageUrl}
                alt={data.podcast.title}
                className="h-16 w-16 rounded object-cover"
              />
            ) : null}
            <div>
              <div className="text-xl font-semibold">{data.podcast?.title}</div>
              {data.podcast?.description ? (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {data.podcast.description}
                </p>
              ) : null}
            </div>
          </div>

          {/* Episodes list */}
          <ul className="space-y-3">
            {data.episodes.map((ep) => (
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
        </div>
      )}
    </div>
  );
}
