import { query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Wrapper for no-args queries that require an authenticated org_id (Clerk organization ID)
// It resolves the user's identity, ensures org_id exists, and passes it to the handler.
export function withOrgIdQuery<TResult>(def: {
  handler: (
    ctx: QueryCtx,
    orgId: Id<"podcasts">,
  ) => Promise<TResult> | TResult;
}) {
  return query({
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity?.org_id) {
        throw new Error("Not authenticated");
      }
      const orgId = identity.org_id as Id<"podcasts">;
      return def.handler(ctx, orgId);
    },
  });
}
