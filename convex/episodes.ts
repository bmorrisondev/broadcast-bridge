import { withOrgIdQuery } from "./auth";

export const listByPodcast = withOrgIdQuery({
  handler: async (ctx, orgId) => {
    // Fetch by podcast using the index, then sort by pubDate desc (fallback to creation time)
    const episodes = await ctx.db
      .query("episodes")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withIndex("by_podcast", (q: any) => q.eq("podcastId", orgId))
      .collect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return episodes.sort((a: any, b: any) => {
      const ad = a.pubDate ?? 0;
      const bd = b.pubDate ?? 0;
      if (ad === bd) return (b._creationTime ?? 0) - (a._creationTime ?? 0);
      return bd - ad;
    });
  },
});
