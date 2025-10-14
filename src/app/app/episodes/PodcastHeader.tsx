"use client";

import { JSX } from "react";

interface Props {
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
}

export default function PodcastHeader(props: Props): JSX.Element {
  const { title, description, imageUrl } = props;
  return (
    <div className="flex items-center gap-4">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={title ?? "Podcast image"} className="h-16 w-16 rounded object-cover" />
      ) : null}
      <div>
        <div className="text-xl font-semibold">{title}</div>
        {description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
