import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface CopyRssButtonProps {
  rssUrl: string;
}

export default function CopyRssButton(props: CopyRssButtonProps) {
  const { rssUrl } = props;
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (!rssUrl) return;
    try {
      await navigator.clipboard.writeText(rssUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; ignore
    }
  }

  return (
    <Button variant="secondary" onClick={handleClick} disabled={!rssUrl}>
      {copied ? "Copied!" : "Copy RSS"}
    </Button>
  );
}
