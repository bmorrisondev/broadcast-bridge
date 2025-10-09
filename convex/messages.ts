import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all messages for the authenticated user
export const getMessages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .collect();
  },
});

// Create a new message
export const createMessage = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, { content }) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("messages", {
      content,
      userId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const message = await ctx.db.get(id);
    
    if (!message || message.userId !== identity.subject) {
      throw new Error("Message not found or not authorized");
    }

    return await ctx.db.delete(id);
  },
});