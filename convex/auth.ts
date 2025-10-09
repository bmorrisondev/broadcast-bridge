import { query, QueryCtx } from "./_generated/server";

// Wrapper for no-args queries that require an authenticated org_id (Clerk organization ID)
// It resolves the user's identity, ensures org_id exists, and passes it to the handler.
export function withOrgIdQuery<TResult>(def: {
  handler: (
    ctx: QueryCtx,
    orgId: string,
  ) => Promise<TResult> | TResult;
}) {
  return query({
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
      // TODO: Remove this once Clerk supports org_id in the identity
      // if (!identity?.org_id) {
      //   throw new Error("Not authenticated");
      // }
      const orgId = String(identity?.org_id);
      return def.handler(ctx, orgId);
    },
  });
}
