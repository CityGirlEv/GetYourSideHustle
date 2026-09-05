import React from 'react';
import { MUNTIES_WATERMARK_PATH } from '../lib/imageWatermark';

export const ImageWatermark: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <img
    src={MUNTIES_WATERMARK_PATH}
    alt=""
    aria-hidden="true"
    draggable={false}
    data-testid="munties-image-watermark"
    className={`pointer-events-none select-none absolute inset-0 m-auto object-contain mix-blend-multiply opacity-[0.16] ${
      compact ? 'w-[48%] max-w-[6.5rem]' : 'w-[40%] max-w-[11rem]'
    }`}
  />
);
