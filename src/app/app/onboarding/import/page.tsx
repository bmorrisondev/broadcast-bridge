"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";

type ParsedItem = {
  guid?: string;
  title?: string;
  description?: string;
  pubDate?: number;
  enclosureUrl: string;
  enclosureType?: string;
  enclosureLength?: number;
  duration?: string;
  explicit?: boolean;
  imported?: boolean;
};

export default function ImportPodcastPage() {
  const upsertPodcast = useAction(api.import.upsertPodcastFromFeed);
  const fetchItems = useAction(api.import.startImportFromFeed);
  const importOne = useAction(api.import.importEpisodeFromItem);

  const [feedUrl, setFeedUrl] = useState<string>("");
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [podcastBusy, setPodcastBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [podcastImported, setPodcastImported] = useState<boolean>(false);
  const [importingIndex, setImportingIndex] = useState<number | null>(null);
  const [autoImporting, setAutoImporting] = useState<boolean>(false);

  async function handleUpsertPodcast() {
    if (!feedUrl.trim()) return;
    setPodcastBusy(true);
    setError(null);
    try {
      await upsertPodcast({ feedUrl: feedUrl.trim() });
      setPodcastImported(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to import podcast info");
    } finally {
      setPodcastBusy(false);
    }
  }

  async function handleStartImport() {
    if (!feedUrl.trim()) return;
    if (!podcastImported) {
      setError("Import podcast info first");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = (await fetchItems({ feedUrl: feedUrl.trim() })) as ParsedItem[];
      // Preserve imported flags across reloads within this page by matching on guid or enclosureUrl
      setItems((prev) => {
        const importedMap = new Map<string, boolean>();
        for (const p of prev) {
          const key = p.guid || p.enclosureUrl;
          importedMap.set(key, p.imported === true);
        }
        return res.map((r) => {
          const key = r.guid || r.enclosureUrl;
          const wasImported = importedMap.get(key) === true;
          return { ...r, imported: wasImported } as ParsedItem;
        });
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load feed");
    } finally {
      setBusy(false);
    }
  }

  async function handleImportIndex(idx: number) {
    if (idx < 0 || idx >= items.length) return;
    // Prevent importing an item that's already been marked as imported locally
    if (items[idx]?.imported) return;
    setImportingIndex(idx);
    setError(null);
    try {
      const it = items[idx];
      await importOne({
        guid: it.guid,
        title: it.title,
        description: it.description,
        pubDate: it.pubDate,
        enclosureUrl: it.enclosureUrl,
        enclosureType: it.enclosureType,
        enclosureLength: it.enclosureLength,
        duration: it.duration,
        explicit: it.explicit ?? false,
      });
      // Mark as imported locally
      setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, imported: true } : p)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to import episode");
    } finally {
      setImportingIndex(null);
    }
  }

  async function handleAutoImportAll() {
    if (!podcastImported || items.length === 0) return;
    setAutoImporting(true);
    try {
      for (let i = 0; i < items.length; i++) {
        if (!items[i]?.imported) {
          await handleImportIndex(i);
        }
      }
    } finally {
      setAutoImporting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Import from RSS</h1>
        <p className="text-sm text-muted-foreground">Step 1: Import podcast info. Step 2: Load and import episodes. Keep this page open while importing.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          type="url"
          placeholder="https://example.com/feed.xml"
          className="w-full rounded border px-3 py-2"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
        />
        <Button type="button" variant="default" disabled={podcastBusy || !feedUrl.trim()} onClick={handleUpsertPodcast}>
          {podcastBusy ? "Importing…" : podcastImported ? "Re-import podcast info" : "Import podcast info"}
        </Button>
        <Button type="button" variant="secondary" disabled={busy || !feedUrl.trim() || !podcastImported} onClick={handleStartImport}>
          {busy ? "Loading…" : items.length ? "Reload items" : "Load items"}
        </Button>
        <Button
          type="button"
          disabled={
            busy ||
            !!importingIndex ||
            autoImporting ||
            items.length === 0 ||
            !podcastImported ||
            items.every((it) => it.imported)
          }
          onClick={handleAutoImportAll}
        >
          {autoImporting || importingIndex !== null
            ? "Importing…"
            : items.every((it) => it.imported)
            ? "All imported"
            : "Start import"}
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="max-h-96 overflow-auto rounded border">
          <table className="w-full text-xs">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2">Title</th>
                <th className="text-left p-2">Pub date</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t, i) => {
                const title = t.title || t.guid || t.enclosureUrl;
                const pd = typeof t.pubDate === "number" ? new Date(t.pubDate).toLocaleString() : "";
                const importing = importingIndex === i;
                const alreadyImported = t.imported === true;
                return (
                  <tr key={`${t.guid || t.enclosureUrl}-${i}`} className="border-t">
                    <td className="p-2 truncate max-w-[24rem]">{title}</td>
                    <td className="p-2">{pd}</td>
                    <td className="p-2">
                      <Button size="sm" disabled={!!importingIndex || alreadyImported} onClick={() => handleImportIndex(i)}>
                        {importing ? "Importing…" : alreadyImported ? "Imported" : "Import"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {error ? (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      ) : null}
    </div>
  );
}
