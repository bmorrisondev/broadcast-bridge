"use client";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EpisodeListItem from "./EpisodeListItem";

type EpisodeItem = {
  _id: string;
  title: string;
  pubDate?: string | number | Date | null;
  duration?: string | number | null;
  episodeNumber?: number | null;
};

export default function EpisodesPage() {
  const router = useRouter();
  const data = useQuery(api.episodes.listByPodcast);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (data && data.podcast === null) {
        setIsRedirecting(true);
        router.replace("/app/onboarding");
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [data, router]);

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Episodes</h1>
      </div>

      {data === undefined ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : isRedirecting ? (
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
          {(() => {
            const episodes = (data.episodes ?? []) as EpisodeItem[];
            return (
              <ul className="space-y-3">
                {episodes.map((ep) => (
                  <EpisodeListItem
                    key={ep._id}
                    title={ep.title}
                    pubDate={ep.pubDate}
                    duration={ep.duration}
                    episodeNumber={ep.episodeNumber}
                  />
                ))}
              </ul>
            );
          })()}
        </div>
      )}
    </div>
  );
}
