"use client";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EpisodeListItem from "./EpisodeListItem";
import PodcastHeader from "./PodcastHeader";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      if (data && data.podcast && data.podcast.isOnboarded != true) {
        setIsRedirecting(true);
        router.replace("/app/onboarding");
      } 
    }, 1000);
    return () => {
      clearTimeout(t);
      setIsLoading(false);
    }
  }, [data, router]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if(isRedirecting) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <p className="text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Episodes</h1>
      </div>

      {data?.episodes?.length === 0 ? (
        <div className="rounded border p-4 text-muted-foreground">
          No episodes yet.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Podcast header */}
          <PodcastHeader
            title={data?.podcast?.title}
            description={data?.podcast?.description ?? null}
            imageUrl={data?.podcast?.imageUrl ?? null}
          />

          {/* Episodes list */}
          {(() => {
            const episodes = (data?.episodes ?? []) as EpisodeItem[];
            return (
              <ul className="space-y-3">
                {episodes.map((ep) => (
                  <EpisodeListItem
                    key={ep._id}
                    id={ep._id}
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
