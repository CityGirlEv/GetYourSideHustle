import React from 'react';

export const RotatingPedestal: React.FC<{
  src?: string;
  alt: string;
  onClick?: () => void;
}> = ({ src, alt, onClick }) => {
  if (!src) return null;
  const image = (
    <img src={src} alt={onClick ? '' : alt} decoding="async" className="pedestal-image" />
  );
  return (
    <div className="pedestal-stage" data-testid="rotating-pedestal">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label={`View ${alt}`}
          className="pedestal-figure"
          data-testid="rotating-pedestal-open"
        >
          {image}
        </button>
      ) : (
        <div className="pedestal-figure">{image}</div>
      )}
      <div className="pedestal-turntable" aria-hidden="true">
        <div className="pedestal-disc" />
        <div className="pedestal-ring" />
      </div>
      <div className="pedestal-stem" aria-hidden="true" />
    </div>
  );
};
