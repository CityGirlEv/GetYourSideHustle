import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, FileText, FileVideo, Trash2, Upload } from "lucide-react";
import { BusyOverlay, WaitLabel } from "../WaitFeedback";
import { ApiError } from "../../lib/api";
import {
  canViewAttachmentInline,
  openAttachmentBlob,
  type AttachmentOpenMode,
} from "../../lib/gysh-attachments";
import { base64ToBlob, fileToBase64, formatFileSize, todayMMDDYY } from "../../lib/gysh-tasks";
import { newFileId } from "../../lib/gysh-task-files";
import {
  deleteSoftLaunchAttachmentRemote,
  fetchSoftLaunchAttachmentContent,
  isSoftLaunchMediaFile,
  isSoftLaunchPdfAttachment,
  isSoftLaunchVideoAttachment,
  SOFT_LAUNCH_MEDIA_ACCEPT,
  uploadSoftLaunchAttachment,
  type SoftLaunchItemAttachment,
} from "../../lib/soft-launch-attachments";

function MediaRow({
  att,
  onRemove,
}: {
  att: SoftLaunchItemAttachment;
  onRemove: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isVideo = isSoftLaunchVideoAttachment(att.mimeType, att.name);
  const isPdf = isSoftLaunchPdfAttachment(att.mimeType, att.name);
  const kindLabel = isPdf ? "PDF" : isVideo ? "Video" : "Image";

  const resolveBlob = async (): Promise<Blob> => {
    const remote = await fetchSoftLaunchAttachmentContent(att.id);
    if (!remote.contentBase64?.trim()) {
      throw new Error("File bytes are missing. Please re-upload.");
    }
    const blob = base64ToBlob(remote.contentBase64, remote.mimeType || att.mimeType);
    if (blob.size < 1) throw new Error("File decoded empty — re-upload.");
    return blob;
  };

  useEffect(() => {
    if (isPdf) return;
    let revoked: string | null = null;
    let cancelled = false;
    void (async () => {
      try {
        const blob = await resolveBlob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        revoked = url;
        setPreviewUrl(url);
      } catch {
        /* preview optional */
      }
    })();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [att.id, att.size, att.mimeType, isPdf]);

  const open = async (mode: AttachmentOpenMode) => {
    setBusy(true);
    try {
      const blob = await resolveBlob();
      const canView = canViewAttachmentInline(att.mimeType, att.name);
      openAttachmentBlob(blob, {
        name: att.name,
        mimeType: att.mimeType,
        mode: mode === "view" && !canView ? "download" : mode,
      });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Open failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="soft-launch-item-attachments__row"
      data-testid={`factory-attachment-${att.id}`}
    >
      {previewUrl && !isVideo && !isPdf ? (
        <img src={previewUrl} alt={att.name} className="soft-launch-item-attachments__thumb" />
      ) : previewUrl && isVideo ? (
        <video
          src={previewUrl}
          className="soft-launch-item-attachments__thumb"
          muted
          playsInline
          preload="metadata"
        />
      ) : isPdf ? (
        <div className="soft-launch-item-attachments__thumb soft-launch-item-attachments__thumb--empty">
          <FileText size={20} style={{ color: "var(--bronze)" }} />
        </div>
      ) : isVideo ? (
        <div className="soft-launch-item-attachments__thumb soft-launch-item-attachments__thumb--empty">
          <FileVideo size={20} style={{ color: "var(--bronze)" }} />
        </div>
      ) : (
        <div className="soft-launch-item-attachments__thumb soft-launch-item-attachments__thumb--empty" />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--charcoal)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={att.name}
        >
          {att.name}
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
          {formatFileSize(att.size)} · {kindLabel} · {att.addedAt}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-outline"
        style={{ padding: "4px 8px" }}
        onClick={() => void open("view")}
        disabled={busy}
        title="View"
      >
        <ExternalLink size={14} />
      </button>
      <button
        type="button"
        className="btn btn-outline"
        style={{ padding: "4px 8px" }}
        onClick={() => void open("download")}
        disabled={busy}
        title="Download"
      >
        <Download size={14} />
      </button>
      <button
        type="button"
        className="btn btn-outline"
        style={{ padding: "4px 8px", color: "#9B2F28" }}
        onClick={onRemove}
        title="Remove"
        data-testid={`factory-attachment-remove-${att.id}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function SoftLaunchItemAttachments({
  itemId,
  attachments,
  onChange,
}: {
  itemId: string;
  attachments: SoftLaunchItemAttachment[];
  onChange: (next: SoftLaunchItemAttachment[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setUploading(true);
    try {
      const next = [...attachments];
      for (const file of Array.from(files)) {
        if (!isSoftLaunchMediaFile(file)) {
          setError(`Skipped unsupported file: ${file.name}`);
          continue;
        }
        const id = newFileId();
        const contentBase64 = await fileToBase64(file);
        const saved = await uploadSoftLaunchAttachment({
          itemId,
          id,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          contentBase64,
          addedAt: todayMMDDYY(),
        });
        next.push(saved);
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (att: SoftLaunchItemAttachment) => {
    try {
      await deleteSoftLaunchAttachmentRemote(att.id);
    } catch {
      /* still drop from UI */
    }
    onChange(attachments.filter((a) => a.id !== att.id));
  };

  return (
    <div
      className="soft-launch-item-attachments"
      data-testid={`factory-attachments-${itemId}`}
      onClick={(e) => e.stopPropagation()}
    >
      <BusyOverlay active={uploading} message="Uploading file…" />
      <div className="soft-launch-item-attachments__heading">
        <strong>Files</strong>
        <span>Images, short videos, or PDFs (channel art, creatives, briefs)</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: "6px 10px", fontSize: "0.9375rem" }}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          data-testid={`factory-attachments-upload-${itemId}`}
        >
          {uploading ? (
            <WaitLabel>Uploading…</WaitLabel>
          ) : (
            <>
              <Upload size={14} /> Upload file
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={SOFT_LAUNCH_MEDIA_ACCEPT}
          style={{ display: "none" }}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <span style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
          PNG/JPG/WebP/PDF (max ~8MB) + MP4/WebM/MOV (max ~20MB)
        </span>
      </div>
      {error ? (
        <div style={{ fontSize: "0.9375rem", color: "#9B2F28" }}>{error}</div>
      ) : null}
      {attachments.length > 0 ? (
        <div className="soft-launch-item-attachments__list">
          {attachments.map((att) => (
            <MediaRow key={att.id} att={att} onRemove={() => void remove(att)} />
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-primary)", opacity: 0.8 }}>
          No files yet.
        </p>
      )}
    </div>
  );
}
