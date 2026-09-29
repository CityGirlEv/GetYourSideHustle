import React from 'react';
import { Map, Sparkles } from 'lucide-react';
import {
  MOOD_AREA_HREF,
  MOOD_HERO_BUBBLES_HREF,
  MOOD_HOW_IT_WORKS_HREF,
  MOOD_WORKFLOW_MAP_HREF,
  MOOD_WORKFLOW_STEPS,
  moodButtonCatalog,
} from '../lib/moodWorkflow';

export function MoodWorkflowMap({
  variant = 'full',
}: {
  variant?: 'full' | 'compact';
}) {
  const compact = variant === 'compact';
  const moods = moodButtonCatalog();

  return (
    <section
      id={compact ? 'mood-how-it-works' : 'mood-workflow'}
      data-testid={compact ? 'mood-how-it-works' : 'mood-workflow-map'}
      className={
        compact
          ? 'text-left rounded-2xl border-2 border-[#1F1917] bg-white p-4 space-y-3'
          : 'bg-white border-2 border-[#1F1917] rounded-3xl p-5 sm:p-8 space-y-5'
      }
    >
      <div className="flex items-start gap-2">
        {compact ? (
          <Sparkles className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
        ) : (
          <Map className="w-5 h-5 text-[#C2410C] shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 space-y-1">
          <h2
            className={
              compact
                ? 'text-sm font-black uppercase font-serif text-[#1F1917]'
                : 'text-xl font-black uppercase font-serif text-[#1F1917]'
            }
          >
            {compact ? 'How What’s Your Mood works' : 'Mood workflow map — How What’s Your Mood works'}
          </h2>
          <p className="text-sm text-[#3F3832] font-medium leading-relaxed">
            Click a mood bubble. Home scrolls to the mood area. You get shake-it tips and one play for that mood — not a
            shirt. Reset and pick another. Members also get a 3-move reset and a 20-second Plan vs Mood round.
          </p>
        </div>
      </div>

      <ol className="space-y-3" data-testid="mood-workflow-steps">
        {MOOD_WORKFLOW_STEPS.map((step) => (
          <li key={step.n} className="rounded-2xl border-2 border-[#E5DFD3] bg-[#FAF8F5] p-3 sm:p-4 space-y-1.5">
            <a
              href={step.href}
              className="inline-flex min-h-[44px] items-center text-sm font-black text-[#C2410C] hover:text-[#9A3412] underline-offset-2 hover:underline"
            >
              {step.n}) {step.label}
            </a>
            <p className="text-sm text-[#3F3832] font-medium leading-relaxed">{step.detail}</p>
          </li>
        ))}
      </ol>

      <div className="space-y-2">
        <p className="text-[10px] font-mono font-black uppercase tracking-wider text-[#C2410C]">The six mood buttons</p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2" data-testid="mood-workflow-button-list">
          {moods.map((mood) => (
            <li key={mood.id}>
              <a
                href={MOOD_AREA_HREF}
                className="min-h-[44px] w-full px-2 py-2 rounded-xl border-2 border-[#1F1917] bg-white text-[#1F1917] text-[11px] font-black uppercase tracking-wide inline-flex items-center justify-center gap-1"
              >
                <span aria-hidden="true">{mood.emoji}</span>
                {mood.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {!compact ? (
        <p className="text-xs text-[#3F3832] font-medium">
          Deep links:{' '}
          <a className="text-[#C2410C] font-bold underline-offset-2 hover:underline" href={MOOD_HOW_IT_WORKS_HREF}>
            Home how-it-works
          </a>
          {' · '}
          <a className="text-[#C2410C] font-bold underline-offset-2 hover:underline" href={MOOD_HERO_BUBBLES_HREF}>
            Hero bubbles
          </a>
          {' · '}
          <a className="text-[#C2410C] font-bold underline-offset-2 hover:underline" href={MOOD_AREA_HREF}>
            Mood area
          </a>
          {' · '}
          <a className="text-[#C2410C] font-bold underline-offset-2 hover:underline" href={MOOD_WORKFLOW_MAP_HREF}>
            This map
          </a>
        </p>
      ) : null}
    </section>
  );
}
