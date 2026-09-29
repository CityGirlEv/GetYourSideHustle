import { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import {
  VSPW_REF_IMAGE_ACCEPT,
  VSPW_REF_IMAGE_MAX_BYTES,
  readVspwReferenceImage,
  type VspwReferenceImage,
} from "../../lib/vspw-wizard";

type Props = {
  label: string;
  value: VspwReferenceImage | null;
  onChange: (next: VspwReferenceImage | null) => void;
  testId?: string;
};

/** Start/end (or wardrobe) reference still upload for a VSPW scene. */
export function VspwReferenceImageField({ label, value, onChange, testId }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onPick = async (file: File | null | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const img = await readVspwReferenceImage(file);
      onChange(img);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      onChange(null);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="vspw-ref-image" data-testid={testId}>
      <div className="vspw-ref-image__label">{label}</div>
      {value ? (
        <div className="vspw-ref-image__preview-wrap">
          <img
            src={value.dataUrl}
            alt={value.name}
            className="vspw-ref-image__preview"
            data-testid={testId ? `${testId}-preview` : undefined}
          />
          <div className="vspw-ref-image__meta">
            <span title={value.name}>{value.name}</span>
            <span>{Math.max(1, Math.round(value.size / 1024))} KB</span>
          </div>
          <div className="vspw-ref-image__actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <Upload size={14} aria-hidden /> Replace
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setError("");
                onChange(null);
              }}
              disabled={busy}
              data-testid={testId ? `${testId}-remove` : undefined}
            >
              <Trash2 size={14} aria-hidden /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-outline vspw-ref-image__upload-btn"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          data-testid={testId ? `${testId}-upload` : undefined}
        >
          <ImagePlus size={16} aria-hidden /> {busy ? "Reading…" : "Upload reference image"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={VSPW_REF_IMAGE_ACCEPT}
        hidden
        onChange={(e) => void onPick(e.target.files?.[0])}
        data-testid={testId ? `${testId}-input` : undefined}
      />
      <p className="vspw-ref-image__hint">
        PNG, JPG, WEBP, or GIF · max {(VSPW_REF_IMAGE_MAX_BYTES / 1_000_000).toFixed(1)} MB (saved in
        this browser for the wizard)
      </p>
      {error ? (
        <p className="vspw-ref-image__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
