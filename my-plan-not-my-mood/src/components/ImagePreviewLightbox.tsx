import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { applyImagePreviewDisplaySize, fullResolutionImageUrl, type ImagePreview } from '../lib/imagePreview';

export const ImagePreviewLightbox: React.FC<{
  preview: ImagePreview | null;
  onClose: () => void;
}> = ({ preview, onClose }) => {
  const [fullSrc, setFullSrc] = useState(preview?.src ?? '');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const fitImage = useCallback(() => {
    const img = imgRef.current;
    const frame = frameRef.current;
    if (!img || !frame || !img.naturalWidth) return;
    applyImagePreviewDisplaySize(
      img,
      frame.clientWidth,
      frame.clientHeight,
      typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    );
  }, []);

  useEffect(() => {
    if (!preview) {
      setFullSrc('');
      return;
    }

    setFullSrc(preview.src);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', fitImage);

    let live = true;
    let created: string | undefined;
    void fullResolutionImageUrl(preview.id, preview.src).then((url) => {
      if (!live || !url) return;
      if (url.startsWith('blob:') && url !== preview.src) created = url;
      setFullSrc(url);
    });

    return () => {
      live = false;
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', fitImage);
      if (created) URL.revokeObjectURL(created);
    };
  }, [preview, onClose, fitImage]);

  if (!preview) return null;

  return (
    <div
      className="fixed inset-0 z-[10050] bg-[#1F1917]/80 flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={preview.name}
      data-testid="image-preview-lightbox"
      onClick={onClose}
    >
      <div
        className="relative w-[88vw] h-[88vh] max-w-[88vw] max-h-[88vh] rounded-2xl border-2 border-[#1F1917] bg-[#FAF8F5] p-3 sm:p-4 shadow-[0_18px_48px_rgba(31,25,23,0.35)] flex flex-col gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 shrink-0">
          <p className="min-w-0 flex-1 text-sm font-black uppercase tracking-wide text-[#1F1917] truncate">
            {preview.name}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center rounded-xl bg-white text-[#1F1917] border-2 border-[#1F1917] cursor-pointer"
            aria-label="Close image preview"
            data-testid="image-preview-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {fullSrc ? (
          <div
            ref={frameRef}
            className="min-h-0 flex-1 w-full overflow-hidden rounded-xl bg-white flex items-center justify-center"
          >
            <img
              ref={imgRef}
              src={fullSrc}
              alt={preview.alt}
              decoding="async"
              fetchPriority="high"
              onLoad={fitImage}
              className="max-w-full max-h-full w-auto h-auto object-contain object-center [image-rendering:auto] [image-rendering:high-quality]"
              data-testid="image-preview-full"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ImagePreviewLightbox;
