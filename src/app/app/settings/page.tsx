"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

interface SettingsFormState {
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
  imageFile?: File | null;
}

export default function SettingsPage() {
  const existing = useQuery(api.podcasts.getCurrent);
  const generateUploadUrl = useMutation(api.podcasts.generateUploadUrl);
  const upsertForOrg = useMutation(api.podcasts.upsertForOrg);

  const initialState: SettingsFormState = useMemo(
    () => ({
      title: existing?.title ?? "",
      description: existing?.description ?? "",
      websiteUrl: existing?.websiteUrl ?? "",
      language: existing?.language ?? "",
      copyright: existing?.copyright ?? "",
      author: existing?.author ?? "",
      ownerName: existing?.ownerName ?? "",
      ownerEmail: existing?.ownerEmail ?? "",
      category: existing?.category ?? "",
      explicit: existing?.explicit ?? false,
      imageFile: null,
    }),
    [existing]
  );

  const [form, setForm] = useState<SettingsFormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialState);
  }, [initialState]);

  function handleChange<K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadImageIfNeeded(): Promise<string | undefined> {
    if (!form.imageFile) return undefined;
    const uploadUrl = await generateUploadUrl({});
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": form.imageFile.type || "application/octet-stream",
      },
      body: form.imageFile,
    });
    if (!result.ok) {
      throw new Error("Image upload failed");
    }
    const { storageId } = (await result.json()) as { storageId: string };
    return storageId;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const imageFileId = await uploadImageIfNeeded();
      await upsertForOrg({
        title: form.title,
        description: form.description || undefined,
        websiteUrl: form.websiteUrl || undefined,
        language: form.language || undefined,
        copyright: form.copyright || undefined,
        author: form.author || undefined,
        ownerName: form.ownerName || undefined,
        ownerEmail: form.ownerEmail || undefined,
        category: form.category || undefined,
        explicit: !!form.explicit,
        imageFileId: imageFileId as Id<"_storage"> | undefined,
      });
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  if (existing === undefined) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="flex items-center gap-2">
          <Button form="settings-form" type="submit" disabled={saving || !form.title}>
            {saving ? "Saving…" : saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input
              className="w-full rounded border bg-background px-3 py-2 text-sm outline-none focus:ring"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Your podcast title"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              className="w-full rounded border bg-background px-3 py-2 text-sm outline-none focus:ring"
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="A short description of your podcast"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Website URL</label>
              <input
                className="w-full rounded border bg-background px-3 py-2 text-sm outline-none focus:ring"
                value={form.websiteUrl || ""}
                onChange={(e) => handleChange("websiteUrl", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Language</label>
              <input
                className="w-full rounded border bg-background px-3 py-2 text-sm outline-none focus:ring"
                value={form.language || ""}
                onChange={(e) => handleChange("language", e.target.value)}
                placeholder="en-US"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Copyright</label>
              <input
                className="w-full rounded border bg-background px-3 py-2 text-sm outline-none focus:ring"
                value={form.copyright || ""}
                onChange={(e) => handleChange("copyright", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Author</label>
              <input
                className="w-full rounded border bg-background px-3 py-2 text-sm outline-none focus:ring"
                value={form.author || ""}
                onChange={(e) => handleChange("author", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Owner name</label>
              <input
                className="w-full rounded border bg-background px-3 py-2 text-sm outline-none focus:ring"
                value={form.ownerName || ""}
                onChange={(e) => handleChange("ownerName", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Owner email</label>
              <input
                type="email"
                className="w-full rounded border bg-background px-3 py-2 text-sm outline-none focus:ring"
                value={form.ownerEmail || ""}
                onChange={(e) => handleChange("ownerEmail", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <input
                className="w-full rounded border bg-background px-3 py-2 text-sm outline-none focus:ring"
                value={form.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="Technology, Business, …"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="explicit"
                type="checkbox"
                className="h-4 w-4"
                checked={!!form.explicit}
                onChange={(e) => handleChange("explicit", e.target.checked)}
              />
              <label htmlFor="explicit" className="text-sm">Explicit content</label>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Cover image</label>
            <div className="flex items-center gap-3">
              {existing?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={existing.imageUrl} alt="Cover" className="h-16 w-16 rounded object-cover" />
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleChange("imageFile", e.target.files?.[0] ?? null)}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Uploading a new image will replace the current cover.</p>
          </div>
        </section>
      </form>
    </div>
  );
}
