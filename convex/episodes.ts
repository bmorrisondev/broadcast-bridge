import { withOrgIdQuery } from "./auth";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const listByPodcast = withOrgIdQuery({
  handler: async (ctx, orgId) => {
    // Look up the podcast by external org id
    const podcast = await ctx.db
      .query("podcasts")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .first();

    // If the podcast doesn't exist yet, return null podcast and empty episodes.
    // The client should redirect to onboarding in this case.
    if (!podcast) {
      return { podcast: null, episodes: [] as unknown[] } as const;
    }

    // Fetch episodes for this podcast using the index
    const episodes = await ctx.db
      .query("episodes")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withIndex("by_podcast", (q: any) => q.eq("podcastId", podcast._id))
      .collect();

    // Sort by pubDate desc (fallback to creation time)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = episodes.sort((a: any, b: any) => {
      const ad = a.pubDate ?? 0;
      const bd = b.pubDate ?? 0;
      if (ad === bd) return (b._creationTime ?? 0) - (a._creationTime ?? 0);
      return bd - ad;
    });

    return { podcast, episodes: sorted } as const;
  },
});

// Fetch a single episode by id (must belong to the caller's org's podcast)
export const getById = query({
  args: { id: v.id("episodes") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    // if (!identity?.org_id) throw new Error("Not authenticated");

    const episode = await ctx.db.get(id);
    if (!episode) return null;

    const podcast = await ctx.db.get(episode.podcastId as Id<"podcasts">);
    if (!podcast) return null;

    if (String(podcast.orgId) !== String(identity?.org_id)) {
      throw new Error("Not authorized");
    }

    return episode;
  },
});

// Update basic editable fields on an episode
export const update = mutation({
  args: {
    id: v.id("episodes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    pubDate: v.optional(v.number()),
    explicit: v.optional(v.boolean()),
    duration: v.optional(v.string()),
    episodeNumber: v.optional(v.number()),
    seasonNumber: v.optional(v.number()),
    keywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.org_id) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const episode = await ctx.db.get(id);
    if (!episode) throw new Error("Episode not found");

    const podcast = await ctx.db.get(episode.podcastId as Id<"podcasts">);
    if (!podcast || String(podcast.orgId) !== String(identity.org_id)) {
      throw new Error("Not authorized");
    }

    // Remove undefined fields so we only patch provided values
    const toPatch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) toPatch[k] = v;
    }

    if (Object.keys(toPatch).length === 0) return id;

    await ctx.db.patch(id, toPatch);
    return id;
  },
});

// Delete an episode (and associated audio file if present)
export const remove = mutation({
  args: { id: v.id("episodes") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.org_id) throw new Error("Not authenticated");

    const episode = await ctx.db.get(id);
    if (!episode) throw new Error("Episode not found");

    const podcast = await ctx.db.get(episode.podcastId as Id<"podcasts">);
    if (!podcast || String(podcast.orgId) !== String(identity.org_id)) {
      throw new Error("Not authorized");
    }

    // Delete stored audio file if exists
    const audioFileId = (episode as { audioFileId?: Id<"_storage"> }).audioFileId;
    if (audioFileId) {
      try {
        await ctx.storage.delete(audioFileId);
      } catch {
        // ignore storage deletion errors
      }
    }

    await ctx.db.delete(id);
    return true as const;
  },
});

// Generate a temporary upload URL for Convex Storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.org_id) throw new Error("Not authenticated");
    const url = await ctx.storage.generateUploadUrl();
    return url;
  },
});

// Create a new episode associated with the caller's organization (podcast)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    pubDate: v.optional(v.number()),
    guid: v.optional(v.string()),
    explicit: v.boolean(),
    duration: v.optional(v.string()),
    episodeNumber: v.optional(v.number()),
    seasonNumber: v.optional(v.number()),
    keywords: v.optional(v.array(v.string())),
    audioType: v.optional(v.string()),
    audioLength: v.optional(v.number()),
    audioFileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.org_id) throw new Error("Not authenticated");
    const externalOrgId = String(identity.org_id);
    const podcast = await ctx.db
      .query("podcasts")
      .withIndex("by_orgId", (q) => q.eq("orgId", externalOrgId))
      .first();
    if (!podcast) throw new Error("No podcast configured for organization");
    const podcastId: Id<"podcasts"> = podcast._id as Id<"podcasts">;

    // Generate a (time-limited) URL for convenience; clients should refresh when needed
    const audioUrl = await ctx.storage.getUrl(args.audioFileId);

    const episodeId = await ctx.db.insert("episodes", {
      podcastId,
      title: args.title,
      description: args.description,
      pubDate: args.pubDate,
      guid: args.guid,
      audioUrl: audioUrl ?? "",
      audioType: args.audioType,
      audioLength: args.audioLength,
      duration: args.duration,
      episodeNumber: args.episodeNumber,
      seasonNumber: args.seasonNumber,
      explicit: args.explicit,
      keywords: args.keywords,
      audioFileId: args.audioFileId,
    });

    return episodeId;
  },
});

// Public feed query by organization id (no auth).
// Returns the podcast and its episodes sorted by most recent first.
export const publicFeed = query({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    const podcast = await ctx.db
      .query("podcasts")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .first();

    if (!podcast) return { podcast: null, episodes: [] as unknown[] } as const;

    const episodes = await ctx.db
      .query("episodes")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withIndex("by_podcast", (q: any) => q.eq("podcastId", podcast._id))
      .collect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = episodes.sort((a: any, b: any) => {
      const ad = a.pubDate ?? 0;
      const bd = b.pubDate ?? 0;
      if (ad === bd) return (b._creationTime ?? 0) - (a._creationTime ?? 0);
      return bd - ad;
    });

    return { podcast, episodes: sorted } as const;
  },
});
