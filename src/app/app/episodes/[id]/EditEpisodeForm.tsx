'use client'

import React from 'react'
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

interface Props {
  id: Id<"episodes"> 
}

function EditEpisodeForm({ id }: Props) {
  const router = useRouter();
  const episode = useQuery(api.episodes.getById, { id });
  const update = useMutation(api.episodes.update);
  const remove = useMutation(api.episodes.remove);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string>("");
  const [pubDateInput, setPubDateInput] = useState<string>("");
  const [explicit, setExplicit] = useState(false);
  const [duration, setDuration] = useState<string>("");
  const [episodeNumber, setEpisodeNumber] = useState<string>("");
  const [seasonNumber, setSeasonNumber] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (episode === undefined || episode === null) return;
    setTitle(episode.title ?? "");
    setDescription(episode.description ?? "");
    setExplicit(Boolean(episode.explicit));
    setDuration(episode.duration ?? "");
    setEpisodeNumber(
      typeof episode.episodeNumber === "number" ? String(episode.episodeNumber) : ""
    );
    setSeasonNumber(
      typeof episode.seasonNumber === "number" ? String(episode.seasonNumber) : ""
    );
    setKeywords((episode.keywords ?? []).join(", "));
    const pd = episode.pubDate ? new Date(episode.pubDate).toISOString() : "";
    setPubDateInput(pd);
  }, [episode]);

  async function onSave() {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      const pubMs = pubDateInput ? Date.parse(pubDateInput) : undefined;
      const episodeNumberNum = episodeNumber ? Number(episodeNumber) : undefined;
      const seasonNumberNum = seasonNumber ? Number(seasonNumber) : undefined;
      await update({
        id,
        title,
        description: description || undefined,
        pubDate: isFinite(pubMs ?? NaN) ? (pubMs as number) : undefined,
        explicit,
        duration: duration || undefined,
        episodeNumber: isFinite(episodeNumberNum ?? NaN)
          ? (episodeNumberNum as number)
          : undefined,
        seasonNumber: isFinite(seasonNumberNum ?? NaN)
          ? (seasonNumberNum as number)
          : undefined,
        keywords:
          keywords.trim().length > 0
            ? keywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
            : undefined,
      });
      router.replace("/app/episodes");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSaving(false);
    } 
  }

  function onRequestDelete() {
    setShowConfirm(true);
  }

  function onCancelDelete() {
    setShowConfirm(false);
  }

  async function onConfirmDelete() {
    if (!id) return;
    setDeleting(true);
    setError(null);
    try {
      await remove({ id });
      router.replace("/app/episodes");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  if (episode === undefined) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (episode === null) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <div className="rounded border p-4">
          <div className="text-lg font-semibold">Episode not found</div>
          <div className="text-sm text-muted-foreground mt-1">
            It may have been removed or you may not have access.
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push("/app/episodes")}>Back to Episodes</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Edit Episode</h1>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={onRequestDelete}>Delete</Button>
          <Button onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full rounded border px-3 py-2 bg-background"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Episode title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full rounded border px-3 py-2 bg-background min-h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Episode description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Publish Date (ISO)</label>
            <input
              className="w-full rounded border px-3 py-2 bg-background"
              value={pubDateInput}
              onChange={(e) => setPubDateInput(e.target.value)}
              placeholder="e.g. 2025-01-01T12:00:00.000Z"
            />
          </div>
          <div className="flex items-center gap-2 mt-6 md:mt-0">
            <input
              id="explicit"
              type="checkbox"
              className="h-4 w-4"
              checked={explicit}
              onChange={(e) => setExplicit(e.target.checked)}
            />
            <label htmlFor="explicit" className="text-sm">Explicit</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <input
              className="w-full rounded border px-3 py-2 bg-background"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 01:23:45 or 5025"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Episode #</label>
            <input
              className="w-full rounded border px-3 py-2 bg-background"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
              placeholder="e.g. 12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Season #</label>
            <input
              className="w-full rounded border px-3 py-2 bg-background"
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(e.target.value)}
              placeholder="e.g. 2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
          <input
            className="w-full rounded border px-3 py-2 bg-background"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. tech, news, interview"
          />
        </div>
      </div>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={onCancelDelete} />
          <div className="relative z-10 w-full max-w-sm rounded-md border bg-background p-5 shadow-lg">
            <div className="text-lg font-semibold">Delete episode?</div>
            <div className="mt-1 text-sm text-muted-foreground">
              This action cannot be undone. The audio file will also be removed.
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={onCancelDelete} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onConfirmDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default EditEpisodeForm