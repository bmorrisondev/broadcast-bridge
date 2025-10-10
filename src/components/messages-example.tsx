"use client";

import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../convex/_generated/dataModel";

export function MessagesExample() {
  const { isSignedIn } = useUser();
  const messages = useQuery(api.messages.getMessages);
  const createMessage = useMutation(api.messages.createMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const [newMessage, setNewMessage] = useState("");

  if (!isSignedIn) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <p className="text-center text-gray-600">Please sign in to see your messages.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await createMessage({ content: newMessage });
    setNewMessage("");
  }

  async function handleDelete(id: string) {
    await deleteMessage({ id: id as Id<"messages"> });
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Messages</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter a message..."
            className="flex-1 p-2 border rounded"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {messages === undefined ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-600">No messages yet. Add your first message!</p>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="flex justify-between items-center p-3 border rounded">
              <span>{message.content}</span>
              <button
                onClick={() => handleDelete(message._id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}