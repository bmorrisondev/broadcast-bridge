import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type ParsedItem = {
  guid?: string;
  title?: string;
  description?: string;
  pubDate?: number;
  enclosureUrl: string;
  enclosureType?: string;
  enclosureLength?: number;
  duration?: string;
  explicit?: boolean;
};

function parseRssRegex(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const tagText = (block: string, tag: string): string | undefined => {
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
    return m ? m[1].trim() : undefined;
  };
  const enclosureRegex = /<enclosure[^>]*>/i;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[0];
    const encTag = block.match(enclosureRegex)?.[0];
    const enclosureUrl = encTag?.match(/url=\"([^\"]+)\"/i)?.[1];
    if (!enclosureUrl) continue;
    const enclosureType = encTag?.match(/type=\"([^\"]+)\"/i)?.[1];
    const lengthStr = encTag?.match(/length=\"([^\"]+)\"/i)?.[1];
    const pubDateStr = tagText(block, "pubDate");
    const pubDate = pubDateStr ? Date.parse(pubDateStr) : undefined;
    const itunesExplicit = (tagText(block, "itunes:explicit") || "").toLowerCase();
    const explicit = itunesExplicit === "true" || itunesExplicit === "yes" ? true : undefined;
    items.push({
      guid: tagText(block, "guid"),
      title: tagText(block, "title"),
      description: tagText(block, "description"),
      pubDate,
      enclosureUrl,
      enclosureType,
      enclosureLength: lengthStr ? Number(lengthStr) : undefined,
      duration: tagText(block, "itunes:duration") || tagText(block, "duration"),
      explicit,
    });
  }
  return items;
}

type FeedMeta = {
  title: string;
  description?: string;
  websiteUrl?: string;
  language?: string;
  copyright?: string;
  author?: string;
  ownerName?: string;
  ownerEmail?: string;
  category?: string;
  explicit: boolean;
  imageUrl?: string;
};

function parseFeedMeta(xml: string): FeedMeta {
  const tagText = (tag: string): string | undefined => {
    const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i"));
    return m ? m[1].trim() : undefined;
  };
  const attrFrom = (tag: string, attr: string): string | undefined => {
    const m = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"[^>]*>`, "i"));
    return m ? m[1] : undefined;
  };
  const title = tagText("title") || "Untitled";
  const description = tagText("description");
  const websiteUrl = tagText("link");
  const language = tagText("language");
  const copyright = tagText("copyright");
  const author = tagText("itunes:author");
  const ownerName = tagText("itunes:owner")?.match(/<itunes:name[^>]*>([\s\S]*?)<\/itunes:name>/i)?.[1]?.trim();
  const ownerEmail = tagText("itunes:owner")?.match(/<itunes:email[^>]*>([\s\S]*?)<\/itunes:email>/i)?.[1]?.trim();
  const category = attrFrom("itunes:category", "text") || tagText("category");
  const explicitText = (tagText("itunes:explicit") || "").toLowerCase();
  const explicit = explicitText === "true" || explicitText === "yes" || explicitText === "explicit";
  const imageHref = attrFrom("itunes:image", "href");
  const imageTagUrl = xml.match(/<image[^>]*>[\s\S]*?<url[^>]*>([\s\S]*?)<\/url>[\s\S]*?<\/image>/i)?.[1]?.trim();
  const imageUrl = imageHref || imageTagUrl;
  return { title, description, websiteUrl, language, copyright, author, ownerName, ownerEmail, category, explicit, imageUrl };
}

// Return parsed feed items for client-driven import
export const startImportFromFeed = action({
  args: { feedUrl: v.string() },
  handler: async (ctx, { feedUrl }): Promise<ParsedItem[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.org_id) throw new Error("Not authenticated");
    const res = await fetch(feedUrl, { method: "GET" });
    if (!res.ok) throw new Error(`Failed to fetch feed (${res.status})`);
    const xml = await res.text();
    return parseRssRegex(xml);
  },
});

// Upsert the podcast (Step 1) from feed metadata for the authenticated org
export const upsertPodcastFromFeed = action({
  args: { feedUrl: v.string() },
  handler: async (ctx, { feedUrl }): Promise<Id<"podcasts">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.org_id) throw new Error("Not authenticated");
    const res = await fetch(feedUrl, { method: "GET" });
    if (!res.ok) throw new Error(`Failed to fetch feed (${res.status})`);
    const xml = await res.text();
    const meta = parseFeedMeta(xml);
    const id = await ctx.runMutation(api.podcasts.upsertFromFeed, meta);
    return id as Id<"podcasts">;
  },
});

export const importEpisodeFromItem = action({
  args: {
    guid: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    pubDate: v.optional(v.number()),
    enclosureUrl: v.string(),
    enclosureType: v.optional(v.string()),
    enclosureLength: v.optional(v.number()),
    duration: v.optional(v.string()),
    explicit: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<Id<"episodes">> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.org_id) throw new Error("Not authenticated");
    const orgId = String(identity.org_id);
    // Find podcast by org via internal query (actions cannot access db directly)
    const podcast = await ctx.runQuery(api.import._getPodcastForOrg, { orgId });
    if (!podcast) throw new Error("No podcast configured for organization");

    // Download enclosure and store in Convex
    const res = await fetch(args.enclosureUrl);
    if (!res.ok) throw new Error(`Failed to fetch enclosure (${res.status})`);
    const blob = await res.blob();
    const audioFileId = await ctx.storage.store(blob);
    const audioUrl = (await ctx.storage.getUrl(audioFileId)) || "";

    // Insert episode via internal mutation
    const episodeId: Id<"episodes"> = await ctx.runMutation(api.import._insertEpisode, {
      podcastId: podcast._id as Id<"podcasts">,
      title: args.title || "Untitled",
      description: args.description,
      pubDate: args.pubDate,
      guid: args.guid,
      audioUrl,
      audioType: args.enclosureType,
      audioLength: args.enclosureLength,
      duration: args.duration,
      explicit: args.explicit ?? false,
      audioFileId,
    });

    return episodeId as Id<"episodes">;
  },
});

// Internal helpers for action
export const _getPodcastForOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    const podcast = await ctx.db
      .query("podcasts")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .first();
    return podcast ?? null;
  },
});

export const _insertEpisode = mutation({
  args: {
    podcastId: v.id("podcasts"),
    title: v.string(),
    description: v.optional(v.string()),
    pubDate: v.optional(v.number()),
    guid: v.optional(v.string()),
    audioUrl: v.string(),
    audioType: v.optional(v.string()),
    audioLength: v.optional(v.number()),
    duration: v.optional(v.string()),
    explicit: v.boolean(),
    audioFileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("episodes", {
      podcastId: args.podcastId,
      title: args.title,
      description: args.description,
      pubDate: args.pubDate,
      guid: args.guid,
      audioUrl: args.audioUrl,
      audioType: args.audioType,
      audioLength: args.audioLength,
      duration: args.duration,
      explicit: args.explicit,
      keywords: undefined,
      audioFileId: args.audioFileId,
      episodeNumber: undefined,
      seasonNumber: undefined,
    });
    return id as Id<"episodes">;
  },
});
