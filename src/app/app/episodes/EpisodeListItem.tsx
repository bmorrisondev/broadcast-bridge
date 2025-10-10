export interface EpisodeListItemProps {
  title: string;
  pubDate?: string | number | Date | null;
  duration?: string | number | null;
  episodeNumber?: number | null;
}

export default function EpisodeListItem(props: EpisodeListItemProps) {
  const { title, pubDate, duration, episodeNumber } = props;

  function formatDuration(value: string | number | null | undefined): string | null {
    if (value === null || value === undefined || value === "") return null;

    // If it's a string with colons, try to normalize to H:M:S then render as Xh Ym Zs
    if (typeof value === "string" && value.includes(":")) {
      const parts = value.split(":").map((p) => p.trim());
      // Support S, M:S, H:M:S
      let h = 0, m = 0, s = 0;
      if (parts.length === 3) {
        h = Number(parts[0]) || 0;
        m = Number(parts[1]) || 0;
        s = Number(parts[2]) || 0;
      } else if (parts.length === 2) {
        m = Number(parts[0]) || 0;
        s = Number(parts[1]) || 0;
      } else if (parts.length === 1) {
        s = Number(parts[0]) || 0;
      }
      return buildHms(h, m, s);
    }

    // Otherwise parse as total seconds
    const totalSeconds = typeof value === "number" ? value : Number(value);
    if (!isFinite(totalSeconds)) return null;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return buildHms(h, m, s);
  }

  function buildHms(h: number, m: number, s: number): string {
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (h > 0 || m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
  }

  return (
    <li className="rounded border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-medium">{title}</div>
          {pubDate ? (
            <div className="text-sm text-muted-foreground">
              {new Date(pubDate).toLocaleString()}
            </div>
          ) : null}
        </div>
        <div className="text-right text-sm text-muted-foreground">
          {duration ? <div>{formatDuration(duration)}</div> : null}
          {typeof episodeNumber === "number" ? (
            <div>Episode #{episodeNumber}</div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
