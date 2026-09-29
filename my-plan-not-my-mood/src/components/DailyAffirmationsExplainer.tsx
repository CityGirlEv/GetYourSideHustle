import React from 'react';
import {
  DAILY_AFFIRMATIONS_SYSTEM,
  SESSION_META,
  SESSION_TYPES,
  type SessionType,
} from '../data/affirmations';

export function DailyAffirmationsExplainer({
  variant = 'full',
  className = '',
}: {
  variant?: 'full' | 'compact';
  className?: string;
}) {
  const compact = variant === 'compact';

  return (
    <div
      id="daily-affirmations-explainer"
      data-testid="daily-affirmations-explainer"
      className={`text-left ${className}`}
    >
      <div
        className={
          compact
            ? 'space-y-2'
            : 'rounded-2xl border-2 border-[#1F1917] bg-white p-4 sm:p-5 space-y-3'
        }
      >
        <h3
          className={
            compact
              ? 'font-serif font-black text-sm text-white uppercase tracking-tight'
              : 'font-serif font-black text-base sm:text-lg text-[#1F1917] uppercase tracking-tight'
          }
        >
          {DAILY_AFFIRMATIONS_SYSTEM.heading}
        </h3>
        <p
          className={
            compact
              ? 'text-xs sm:text-sm text-white/90 leading-relaxed'
              : 'text-sm text-[#3F3832] font-medium leading-relaxed'
          }
          data-testid="daily-affirmations-what-it-does"
        >
          {DAILY_AFFIRMATIONS_SYSTEM.whatItDoes}
        </p>
        <p
          className={
            compact
              ? 'text-[10px] font-mono font-black uppercase tracking-wider text-amber-300'
              : 'text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]'
          }
        >
          {DAILY_AFFIRMATIONS_SYSTEM.howToUseHeading}
        </p>
        <ol
          className={
            compact
              ? 'list-decimal list-inside space-y-1 text-xs text-white/85 leading-relaxed'
              : 'list-decimal list-inside space-y-1.5 text-sm text-[#3F3832] font-medium leading-relaxed'
          }
          data-testid="daily-affirmations-how-to-use"
        >
          {DAILY_AFFIRMATIONS_SYSTEM.howToUseSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      {compact ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
          {SESSION_TYPES.map((type) => (
            <SessionExplainerCard key={type} type={type} variant="compact" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SessionExplainerCard({
  type,
  variant = 'full',
}: {
  type: SessionType;
  variant?: 'full' | 'compact';
}) {
  const meta = SESSION_META[type];
  const compact = variant === 'compact';

  return (
    <article
      id={`${type}-set`}
      data-testid={`${type}-set-explainer`}
      className={
        compact
          ? 'rounded-xl border border-white/20 bg-white/10 p-3 text-left space-y-1.5'
          : 'space-y-2'
      }
    >
      <p
        className={
          compact
            ? 'text-[9px] font-mono font-black uppercase tracking-wider text-amber-300'
            : 'text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]'
        }
      >
        What it does
      </p>
      <p
        className={
          compact
            ? 'text-[11px] text-white/90 leading-relaxed'
            : 'text-xs text-[#3F3832] leading-relaxed'
        }
      >
        {meta.whatItDoes}
      </p>
      <p
        className={
          compact
            ? 'text-[9px] font-mono font-black uppercase tracking-wider text-amber-300 pt-1'
            : 'text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C] pt-1'
        }
      >
        How to use it
      </p>
      <p
        className={
          compact
            ? 'text-[11px] text-white/90 leading-relaxed'
            : 'text-xs text-[#3F3832] leading-relaxed'
        }
      >
        {meta.howToUse}
      </p>
    </article>
  );
}
