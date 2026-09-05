import React, { useState, useEffect } from 'react';
import { QUOTE_BAR_TRAILING_SPACE } from '../lib/headerClearance';

interface QuotePhrase {
  emoji: string;
  trailingEmoji?: string;
  segments: string[];
}

const ROTATING_PHRASES: QuotePhrase[] = [
  {
    emoji: '😴',
    trailingEmoji: '👖',
    segments: ['My mood wanted pajamas.', 'My plan wanted pants.', 'Pants won.'],
  },
  {
    emoji: '⏰',
    segments: ['Snooze button', 'is not a business strategy.'],
  },
  {
    emoji: '💪',
    segments: ['I felt like quitting.', "I planned like I didn't."],
  },
  {
    emoji: '🔥',
    trailingEmoji: '📋',
    segments: ['Hot flash at 2pm.', 'Deadline at 3pm.', "Plan didn't care."],
  },
  {
    emoji: '📱',
    trailingEmoji: '💸',
    segments: ['Mood: send a meme.', 'Plan: send the invoice.'],
  },
  {
    emoji: '📵',
    segments: ['Procrastination called.', 'I sent it to voicemail.'],
  },
  {
    emoji: '🫠',
    trailingEmoji: '📅',
    segments: ['My feelings had a meeting.', 'My calendar had the real one.'],
  },
];

function AlternatingPhrase({ phrase }: { phrase: QuotePhrase }) {
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-2.5 leading-snug">
      <span className="mr-0.5 text-lg sm:text-xl lg:text-2xl drop-shadow-sm" aria-hidden="true">
        {phrase.emoji}
      </span>
      {phrase.segments.map((segment, index) => (
        <span
          key={`${phrase.emoji}-${index}`}
          className={`font-serif font-black tracking-tight ${
            index % 2 === 0
              ? 'text-[#1F1917] not-italic'
              : 'text-[#C2410C] italic'
          }`}
        >
          {segment}
        </span>
      ))}
      {phrase.trailingEmoji && (
        <span className="ml-0.5 text-lg sm:text-xl lg:text-2xl drop-shadow-sm" aria-hidden="true">
          {phrase.trailingEmoji}
        </span>
      )}
    </span>
  );
}

export const HeaderQuoteBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentPhrase = ROTATING_PHRASES[phraseIndex];

  return (
    <div
      className={`w-full px-2 sm:px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-1.5 ${QUOTE_BAR_TRAILING_SPACE} bg-[#FAF8F5] flex justify-center ${className}`}
      aria-live="polite"
      data-testid="header-quote-bar"
    >
      <div className="max-w-3xl sm:max-w-4xl w-full bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border-2 border-[#E09A5A] px-3 sm:px-5 py-2 sm:py-2 rounded-2xl sm:rounded-full text-sm sm:text-base lg:text-lg shadow-md text-center">
        <AlternatingPhrase phrase={currentPhrase} />
      </div>
    </div>
  );
};

export default HeaderQuoteBar;
