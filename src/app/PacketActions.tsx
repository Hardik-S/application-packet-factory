"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArtifactMetadata } from "../lib/packet";

type PacketActionsProps = {
  markdown: string;
  metadata: ArtifactMetadata;
};

export function PacketActions({ markdown, metadata }: PacketActionsProps) {
  const [message, setMessage] = useState("Local-only artifact actions. Nothing is sent.");

  const downloadUrl = useMemo(() => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    return URL.createObjectURL(blob);
  }, [markdown]);

  useEffect(() => () => URL.revokeObjectURL(downloadUrl), [downloadUrl]);

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    setMessage("Markdown copied for reviewer handoff.");
  }

  return (
    <div className="packetActions" aria-label="Review packet artifact actions">
      <div>
        <span className={`status ${metadata.status}`}>{metadata.status}</span>
        <p>{metadata.guidance}</p>
        <small>
          {metadata.filename} · {metadata.byteSize.toLocaleString()} bytes
        </small>
      </div>
      <div className="packetButtons">
        <button type="button" onClick={copyMarkdown}>
          Copy Markdown
        </button>
        <a href={downloadUrl} download={metadata.filename}>
          Download .md
        </a>
      </div>
      <small className="actionMessage" aria-live="polite">
        {message}
      </small>
    </div>
  );
}
