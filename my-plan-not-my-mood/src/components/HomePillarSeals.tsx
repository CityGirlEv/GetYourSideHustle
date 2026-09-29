import React from 'react';

function SealFrame({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className="h-10 w-10 sm:h-12 sm:w-12 drop-shadow-[0_6px_12px_rgba(184,137,58,0.4)]"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-gold`} x1="8" y1="2" x2="72" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF6D6" />
          <stop offset="28%" stopColor="#E8C57A" />
          <stop offset="62%" stopColor="#C4A050" />
          <stop offset="100%" stopColor="#7A5418" />
        </linearGradient>
        <radialGradient id={`${id}-fill`} cx="38" cy="28" r="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFDF6" />
          <stop offset="55%" stopColor="#F8E7C2" />
          <stop offset="100%" stopColor="#E3C48A" />
        </radialGradient>
        <radialGradient id={`${id}-icon`} cx="40" cy="42" r="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#7A2E0E" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" floodColor="#C4A050" floodOpacity="0.45" />
        </filter>
      </defs>
      <circle cx="40" cy="40" r="37.2" fill={`url(#${id}-gold)`} />
      <circle cx="40" cy="40" r="33.4" fill={`url(#${id}-fill)`} />
      <circle cx="40" cy="40" r="31.2" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.35" />
      <circle cx="40" cy="40" r="28.4" fill="none" stroke="#8A6A32" strokeWidth="0.45" strokeDasharray="1.4 1.7" opacity="0.55" />
      <ellipse cx="32" cy="26" rx="16" ry="9" fill="#FFFFFF" opacity="0.28" />
      <path
        d="M40 6.2 L42.4 11.2 H47.8 L43.5 14.4 L45.1 19.6 L40 16.7 L34.9 19.6 L36.5 14.4 L32.2 11.2 H37.6 Z"
        fill={`url(#${id}-gold)`}
        stroke="#7A5418"
        strokeWidth="0.35"
      />
      <g filter={`url(#${id}-glow)`}>{children}</g>
    </svg>
  );
}

function MindsetMark({ id }: { id: string }) {
  return (
    <g>
      <path
        fill={`url(#${id}-icon)`}
        d="M27 31.2 h26 a3.2 3.2 0 0 1 3.2 3.2 v18.4 a3.2 3.2 0 0 1 -3.2 3.2 H27 a3.2 3.2 0 0 1 -3.2 -3.2 V34.4 a3.2 3.2 0 0 1 3.2 -3.2 z"
      />
      <path fill={`url(#${id}-gold)`} d="M33.2 31.2 v-3.6 a6.8 6.8 0 0 1 13.6 0 v3.6 h-2.6 v-3.6 a4.2 4.2 0 0 0 -8.4 0 v3.6 z" />
      <path fill="#FFF8EC" d="M38.6 39.4 h2.8 v8.2 h-2.8 z" />
      <path fill="#FFF8EC" d="M35.2 44.2 h9.6 v2.6 h-9.6 z" />
    </g>
  );
}

function ToolsMark({ id }: { id: string }) {
  return (
    <g>
      <circle cx="34" cy="38" r="7.1" fill={`url(#${id}-icon)`} />
      <circle cx="48" cy="44" r="7.1" fill={`url(#${id}-icon)`} />
      <circle cx="34" cy="38" r="2.4" fill="#FFF8EC" />
      <circle cx="48" cy="44" r="2.4" fill="#FFF8EC" />
      <path fill={`url(#${id}-gold)`} d="M38.8 40.6 l3.8 2.1 -1.1 2 -3.8 -2.1 z" />
      <path fill={`url(#${id}-gold)`} d="M29.4 32.8 l-4.1 -4.1 1.9 -1.9 4.1 4.1 z" />
      <path fill={`url(#${id}-gold)`} d="M52.4 48.6 l4.1 4.1 -1.9 1.9 -4.1 -4.1 z" />
    </g>
  );
}

function ResourcesMark({ id }: { id: string }) {
  return (
    <g>
      <path
        fill={`url(#${id}-icon)`}
        d="M40 24.4 c7.2 0 12.8 5.6 12.8 12.6 0 9.6 -12.8 19.2 -12.8 19.2 S27.2 46.6 27.2 37 c0 -7 5.6 -12.6 12.8 -12.6 z"
      />
      <circle cx="40" cy="38.2" r="4.1" fill="#FFF8EC" />
      <circle cx="40" cy="38.2" r="1.7" fill={`url(#${id}-gold)`} />
    </g>
  );
}

function EncouragementMark({ id }: { id: string }) {
  return (
    <g>
      <path
        fill={`url(#${id}-icon)`}
        d="M40 56.2 C28.4 48.2 23.2 41.2 23.2 34.4 c0 -5.2 4 -9 9.1 -9 3.1 0 5.9 1.6 8.1 4.1 2.2 -2.5 5 -4.1 8.1 -4.1 5.1 0 9.1 3.8 9.1 9 0 6.8 -5.2 13.8 -17.6 21.8 z"
      />
      <path fill="#FFF8EC" opacity="0.35" d="M31 33.4 c0 -2.6 1.8 -4.4 4.2 -4.4 1.6 0 2.9 0.8 4.1 2.2 0.2 0.3 0.7 0.3 0.9 0 1.2 -1.4 2.5 -2.2 4.1 -2.2" />
    </g>
  );
}

function StrongerMark({ id }: { id: string }) {
  return (
    <g>
      <path
        fill={`url(#${id}-icon)`}
        d="M26 32.2 C30.2 28.8 35 28.2 40 32.2 C45 28.2 49.8 28.8 54 32.2 v18.6 a2.4 2.4 0 0 1 -2.4 2.4 H28.4 a2.4 2.4 0 0 1 -2.4 -2.4 z"
      />
      <path fill={`url(#${id}-gold)`} d="M38.6 33.4 h2.8 v17.4 h-2.8 z" />
      <path fill="#FFF8EC" d="M29.4 36.2 h4.2 v2.2 h-4.2 z" />
      <path fill="#FFF8EC" d="M46.4 36.2 h4.2 v2.2 h-4.2 z" />
    </g>
  );
}

const MARKS = [MindsetMark, ToolsMark, ResourcesMark, EncouragementMark, StrongerMark];

export function HomePillarSeal({ index }: { index: number }) {
  const id = `pillar-seal-${index}`;
  const Mark = MARKS[index] ?? MindsetMark;
  return (
    <SealFrame id={id}>
      <Mark id={id} />
    </SealFrame>
  );
}
