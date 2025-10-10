import { createWebhooksHandler } from '@brianmmdev/clerk-webhooks-handler';
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

type OrgPayload = {
  id: string;
  name?: string;
  image_url?: string;
  logo_url?: string;
};

const handler = httpAction(async (ctx, request) => {
  const webhooksHandler = createWebhooksHandler({
    secret: process.env.CLERK_WEBHOOK_SECRET,

    onOrganizationCreated: async (org: OrgPayload) => {
      // Create a podcast entry for the new organization
      await ctx.runMutation(internal.podcasts.createFromOrg, {
        orgId: String(org.id),
        title: org.name ?? "Untitled",
        // Clerk org payloads commonly provide image_url or logo_url
        imageUrl: org.image_url ?? org?.logo_url,
      });
    },

    onOrganizationUpdated: async () => {
      // No-op for now
    },

    onOrganizationDeleted: async () => {
      // No-op for now
    },
  });

  return webhooksHandler.POST(request);
});

const http = httpRouter();

http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: handler,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;