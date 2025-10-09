import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Original messages table for demo purposes
  messages: defineTable({
    content: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Podcasts table
  podcasts: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    feedUrl: v.string(),
    websiteUrl: v.optional(v.string()),
    language: v.optional(v.string()),
    copyright: v.optional(v.string()),
    author: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    category: v.optional(v.string()),
    explicit: v.boolean(),
    imageUrl: v.optional(v.string()),
    lastUpdated: v.number(), // timestamp
  })
    .index("by_feedUrl", ["feedUrl"])
    .index("by_author", ["author"])
    .index("by_category", ["category"]),

  // Episodes table
  episodes: defineTable({
    podcastId: v.id("podcasts"),
    title: v.string(),
    description: v.optional(v.string()),
    pubDate: v.optional(v.number()), // timestamp
    guid: v.optional(v.string()),
    audioUrl: v.string(),
    audioType: v.optional(v.string()),
    audioLength: v.optional(v.number()), // in seconds
    duration: v.optional(v.string()), // e.g., "45:30"
    episodeNumber: v.optional(v.number()),
    seasonNumber: v.optional(v.number()),
    explicit: v.boolean(),
    keywords: v.optional(v.array(v.string())),
    // Convex file storage reference
    audioFileId: v.optional(v.id("_storage")), // Reference to uploaded file in Convex
  })
    .index("by_podcast", ["podcastId"])
    .index("by_guid", ["guid"])
    .index("by_pubDate", ["pubDate"])
    .index("by_episode_number", ["podcastId", "episodeNumber"])
    .index("by_season_episode", ["podcastId", "seasonNumber", "episodeNumber"]),
});
