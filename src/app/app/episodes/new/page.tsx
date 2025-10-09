"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import type { Id } from "../../../../../convex/_generated/dataModel";

interface FormState {
  title: string;
  description: string;
  pubDate: string; // ISO input value
  explicit: boolean;
  duration: string;
  episodeNumber?: number;
  seasonNumber?: number;
  keywords: string; // comma-separated
}

export default function NewEpisodePage() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.episodes.generateUploadUrl);
  const createEpisode = useMutation(api.episodes.create);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    pubDate: "",
    explicit: false,
    duration: "",
    episodeNumber: undefined,
    seasonNumber: undefined,
    keywords: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return form.title.trim().length > 0 && !!file;
  }, [form.title, file]);

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      // 1) get upload URL
      const uploadUrl = await generateUploadUrl();

      // 2) upload file directly to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!result.ok) {
        throw new Error(`Upload failed (${result.status})`);
      }
      const { storageId } = (await result.json()) as { storageId: string };

      // 3) create episode record
      const pubDateMs = form.pubDate ? new Date(form.pubDate).getTime() : undefined;
      const keywords = form.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      await createEpisode({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        pubDate: pubDateMs,
        guid: undefined,
        explicit: !!form.explicit,
        duration: form.duration || undefined,
        episodeNumber: typeof form.episodeNumber === "number" ? form.episodeNumber : undefined,
        seasonNumber: typeof form.seasonNumber === "number" ? form.seasonNumber : undefined,
        keywords: keywords.length ? keywords : undefined,
        audioType: file.type || undefined,
        audioLength: undefined,
        audioFileId: storageId as Id<"_storage">,
      });

      router.push("/app/episodes");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Episode</h1>
      </div>

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
            <label className="block text-sm font-medium">Publish date</label>
            <input
              type="datetime-local"
              className="w-full rounded border px-3 py-2"
              value={form.pubDate}
              onChange={(e) => onChange("pubDate", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Duration (e.g. 45:30)</label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2"
              value={form.duration}
              onChange={(e) => onChange("duration", e.target.value)}
              placeholder="MM:SS or HH:MM:SS"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Episode #</label>
            <input
              type="number"
              className="w-full rounded border px-3 py-2"
              value={form.episodeNumber ?? ""}
              onChange={(e) =>
                onChange(
                  "episodeNumber",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              min={0}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium">Season #</label>
            <input
              type="number"
              className="w-full rounded border px-3 py-2"
              value={form.seasonNumber ?? ""}
              onChange={(e) =>
                onChange(
                  "seasonNumber",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
              min={0}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
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
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Keywords (comma-separated)</label>
          <input
            type="text"
            className="w-full rounded border px-3 py-2"
            value={form.keywords}
            onChange={(e) => onChange("keywords", e.target.value)}
            placeholder="tech, news, interview"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Audio file</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {error ? (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!isValid || submitting}>
            {submitting ? "Saving…" : "Save episode"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}