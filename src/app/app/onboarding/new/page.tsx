"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@clerk/nextjs";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface FormState {
  title: string;
  description: string;
  websiteUrl: string;
  language: string;
  copyright: string;
  author: string;
  ownerName: string;
  ownerEmail: string;
  category: string;
  explicit: boolean;
  imageUrl: string;
}

export default function NewPodcastPage() {
  const router = useRouter();
  const existing = useQuery(api.podcasts.getCurrent);
  const upsert = useMutation(api.podcasts.upsertForOrg);
  const genImageUploadUrl = useMutation(api.podcasts.generateUploadUrl);
  const { organization } = useOrganization();

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    websiteUrl: "",
    language: "",
    copyright: "",
    author: "",
    ownerName: "",
    ownerEmail: "",
    category: "",
    explicit: false,
    imageUrl: "",
  });
  const [loadedFromExisting, setLoadedFromExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loadedFromExisting && existing) {
      setForm((prev) => ({
        ...prev,
        title: existing.title ?? "",
        description: existing.description ?? "",
        websiteUrl: existing.websiteUrl ?? "",
        language: existing.language ?? "",
        copyright: existing.copyright ?? "",
        author: existing.author ?? "",
        ownerName: existing.ownerName ?? "",
        ownerEmail: existing.ownerEmail ?? "",
        category: existing.category ?? "",
        explicit: existing.explicit ?? false,
        imageUrl: existing.imageUrl ?? "",
      }));
      setLoadedFromExisting(true);
    }
  }, [existing, loadedFromExisting]);

  // Prefill title from active Clerk organization if no existing podcast
  useEffect(() => {
    if (!loadedFromExisting && !existing && organization?.name) {
      setForm((prev) => ({ ...prev, title: prev.title || organization.name! }));
    }
  }, [organization?.name, existing, loadedFromExisting]);

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = useMemo(() => {
    return form.title.trim().length > 0;
  }, [form.title]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      // Upload new cover image if provided
      let imageFileId: Id<"_storage"> | undefined = undefined;
      if (imageFile) {
        const uploadUrl = await genImageUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": imageFile.type || "application/octet-stream" },
          body: imageFile,
        });
        if (!res.ok) throw new Error(`Image upload failed (${res.status})`);
        const { storageId } = (await res.json()) as { storageId: string };
        imageFileId = storageId as Id<"_storage">;
      }

      await upsert({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
        language: form.language.trim() || undefined,
        copyright: form.copyright.trim() || undefined,
        author: form.author.trim() || undefined,
        ownerName: form.ownerName.trim() || undefined,
        ownerEmail: form.ownerEmail.trim() || undefined,
        category: form.category.trim() || undefined,
        explicit: !!form.explicit,
        imageFileId,
        isOnboarded: true,
      });
      router.replace("/app/episodes");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Create podcast</h1>
        <p className="text-sm text-muted-foreground">Provide details about your podcast. You can edit these later.</p>
      </div>

      {existing === undefined && !loadedFromExisting ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2"
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="min-h-28 w-full rounded border px-3 py-2"
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Website URL</label>
              <input
                type="url"
                className="w-full rounded border px-3 py-2"
                value={form.websiteUrl}
                onChange={(e) => onChange("websiteUrl", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Language</label>
              <input
                type="text"
                className="w-full rounded border px-3 py-2"
                value={form.language}
                onChange={(e) => onChange("language", e.target.value)}
                placeholder="en-us"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Copyright</label>
              <input
                type="text"
                className="w-full rounded border px-3 py-2"
                value={form.copyright}
                onChange={(e) => onChange("copyright", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Author</label>
              <input
                type="text"
                className="w-full rounded border px-3 py-2"
                value={form.author}
                onChange={(e) => onChange("author", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Owner name</label>
              <input
                type="text"
                className="w-full rounded border px-3 py-2"
                value={form.ownerName}
                onChange={(e) => onChange("ownerName", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Owner email</label>
              <input
                type="email"
                className="w-full rounded border px-3 py-2"
                value={form.ownerEmail}
                onChange={(e) => onChange("ownerEmail", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Category</label>
              <input
                type="text"
                className="w-full rounded border px-3 py-2"
                value={form.category}
                onChange={(e) => onChange("category", e.target.value)}
                placeholder="Technology, News, …"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium">Cover image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imageUrl}
                  alt="Current cover"
                  className="mt-2 h-20 w-20 rounded object-cover"
                />
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="explicit"
              type="checkbox"
              className="h-4 w-4"
              checked={form.explicit}
              onChange={(e) => onChange("explicit", e.target.checked)}
            />
            <label htmlFor="explicit" className="text-sm font-medium">
              Explicit content
            </label>
          </div>

          {error ? (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!isValid || submitting}>
              {submitting ? "Saving…" : existing ? "Save changes" : "Create podcast"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
