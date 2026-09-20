import React, { useState, useEffect } from 'react';
import { QUOTE_BAR_TRAILING_SPACE } from '../lib/headerClearance';

interface QuotePhrase {
  emoji: string;
  trailingEmoji?: string;
  segments: string[];
}

const ROTATING_PHRASES: QuotePhrase[] = [
  {
    emoji: '🔥',
    trailingEmoji: '📋',
    segments: ['Hot flash at 2pm.', 'Deadline at 3pm.', "Plan didn't care."],
  },
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
      <span className="mr-0.5 text-base sm:text-lg lg:text-xl" aria-hidden="true">
        {phrase.emoji}
      </span>
      {phrase.segments.map((segment, index) => (
        <span
          key={`${phrase.emoji}-${index}`}
          className={`font-serif tracking-tight ${
            index % 2 === 0
              ? 'text-[#7C2D12] not-italic font-black'
              : 'text-[#C2410C] italic font-black'
          }`}
        >
          {segment}
        </span>
      ))}
      {phrase.trailingEmoji && (
        <span className="ml-0.5 text-base sm:text-lg lg:text-xl" aria-hidden="true">
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
      className={`w-full min-w-0 overflow-x-hidden px-2 sm:px-3 ${QUOTE_BAR_TRAILING_SPACE} bg-[#C2410C] flex justify-center ${className}`}
      aria-live="polite"
      data-testid="header-quote-bar"
    >
      <p className="max-w-5xl w-full min-w-0 rounded-full bg-[#FFEDD5] border-2 border-[#FDBA74] px-2 sm:px-6 py-0.5 text-center text-[11px] sm:text-base lg:text-lg text-[#9A3412] shadow-[0_4px_12px_rgba(31,25,23,0.18)]">
        <AlternatingPhrase phrase={currentPhrase} />
      </p>
    </div>
  );
};

export default HeaderQuoteBar;
