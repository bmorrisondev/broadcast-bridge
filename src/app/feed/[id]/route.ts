import { api } from "../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export const dynamic = "force-dynamic";

function xmlEscape(input: string | undefined | null) {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface EpisodeItem {
  _id: string;
  _creationTime: number;
  title: string;
  description?: string;
  pubDate?: number;
  guid?: string;
  audioUrl?: string;
  audioType?: string;
  audioLength?: number;
  duration?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  explicit: boolean;
  keywords?: string[];
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const rawId = resolvedParams.id;
  const orgId = rawId.endsWith(".xml") ? rawId.replace(/\.xml$/i, "") : rawId;

  const { podcast, episodes } = await fetchQuery(api.episodes.publicFeed, {
    orgId,
  });

  if (!podcast) {
    return new Response("Feed not found", { status: 404 });
  }

  const url = new URL(req.url);
  const siteOrigin = `${url.protocol}//${url.host}`;

  const channelLink = podcast.websiteUrl || siteOrigin;
  const imageUrl = podcast.imageUrl || `${siteOrigin}/favicon.ico`;

  const lastBuildDate = new Date(
    podcast.lastUpdated || Date.now()
  ).toUTCString();

  const channel = `
    <channel>
      <title>${xmlEscape(podcast.title)}</title>
      <link>${xmlEscape(channelLink)}</link>
      <description>${xmlEscape(podcast.description || "")}</description>
      <language>${xmlEscape(podcast.language || "en-us")}</language>
      <copyright>${xmlEscape(podcast.copyright || "")}</copyright>
      <lastBuildDate>${lastBuildDate}</lastBuildDate>
      <itunes:author>${xmlEscape(podcast.author || podcast.ownerName || "")}</itunes:author>
      <itunes:summary>${xmlEscape(podcast.description || "")}</itunes:summary>
      <itunes:explicit>${podcast.explicit ? "yes" : "no"}</itunes:explicit>
      <itunes:owner>
        <itunes:name>${xmlEscape(podcast.ownerName || "")}</itunes:name>
        <itunes:email>${xmlEscape(podcast.ownerEmail || "")}</itunes:email>
      </itunes:owner>
      ${podcast.category ? `<itunes:category text="${xmlEscape(podcast.category)}" />` : ""}
      <itunes:image href="${xmlEscape(imageUrl)}" />
      ${episodes
        .map((ep: EpisodeItem) => {
          const pub = new Date((ep.pubDate as number) || ep._creationTime).toUTCString();
          const guid = ep.guid || String(ep._id);
          const enclosureAttrs = ep.audioUrl
            ? ` url="${xmlEscape(ep.audioUrl)}"${
                typeof ep.audioLength === "number" ? ` length="${ep.audioLength}"` : ""
              }${ep.audioType ? ` type="${xmlEscape(ep.audioType)}"` : ""}`
            : "";
          const keywords = Array.isArray(ep.keywords) ? ep.keywords.join(", ") : "";
          return `
        <item>
          <title>${xmlEscape(ep.title)}</title>
          <description><![CDATA[${ep.description || ""}]]></description>
          <link>${xmlEscape(channelLink)}</link>
          <guid isPermaLink="false">${xmlEscape(guid)}</guid>
          <pubDate>${pub}</pubDate>
          ${enclosureAttrs ? `<enclosure${enclosureAttrs} />` : ""}
          ${ep.duration ? `<itunes:duration>${xmlEscape(ep.duration)}</itunes:duration>` : ""}
          <itunes:explicit>${ep.explicit ? "yes" : "no"}</itunes:explicit>
          ${typeof ep.episodeNumber === "number" ? `<itunes:episode>${ep.episodeNumber}</itunes:episode>` : ""}
          ${typeof ep.seasonNumber === "number" ? `<itunes:season>${ep.seasonNumber}</itunes:season>` : ""}
          ${keywords ? `<itunes:keywords>${xmlEscape(keywords)}</itunes:keywords>` : ""}
        </item>`;
        })
        .join("")}
    </channel>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
${channel}
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}