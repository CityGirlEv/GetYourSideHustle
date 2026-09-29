import React from 'react';
import { shouldWatermarkThumb } from '../lib/imageWatermark';
import { ImageWatermark } from './ImageWatermark';

interface UploadThumbProps {
  src?: string;
  alt: string;
  contain?: boolean;
  fill?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

/** Medium or large mockup/logo preview — never a blank or broken tile. */
export const UploadThumb: React.FC<UploadThumbProps> = ({
  src,
  alt,
  contain = true,
  fill = false,
  size = 'md',
  onClick,
}) => {
  if (!src) return null;
  const mini = size === 'xs';
  const small = size === 'sm';
  const medium = size === 'md';
  const watermark = shouldWatermarkThumb(size, fill);
  const box = `relative overflow-hidden rounded-2xl bg-[#FAF8F5] border border-[#E5DFD3] shrink-0 ${
    fill
      ? `w-full ${medium || small || mini ? 'aspect-square' : 'aspect-[4/5]'}`
      : mini
        ? 'w-11 h-11'
        : small
          ? 'w-24 h-24 sm:w-28 sm:h-28'
          : medium
            ? 'w-36 h-36 sm:w-40 sm:h-40'
            : 'w-48 h-48 sm:w-64 sm:h-64'
  }`;
  const image = (
    <span className={box}>
      <img
        src={src}
        alt={onClick ? '' : alt}
        width={fill ? 640 : mini ? 44 : small ? 112 : medium ? 160 : 256}
        height={fill ? 640 : mini ? 44 : small ? 112 : medium ? 160 : 256}
        decoding="async"
        className={`pointer-events-none w-full h-full ${
          contain ? 'object-contain object-center' : 'object-cover object-center'
        }`}
      />
      {watermark ? <ImageWatermark compact={mini || small} /> : null}
    </span>
  );
  if (!onClick) return image;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${alt}`}
      data-testid="upload-thumb-open"
      className={`shrink-0 rounded-2xl cursor-pointer min-h-[44px] min-w-[44px] p-0 border-0 bg-transparent ${
        fill ? 'w-full' : ''
      }`}
    >
      {image}
    </button>
  );
};
