import React, { useState } from 'react';
import { MOOD_OPTIONS, MoodOption } from '../data/moods';
import { Sparkles, RefreshCw } from 'lucide-react';
import { MoodShakePanel } from './MoodShakePanel';

interface MoodToolProps {
  onOpenJoin?: () => void;
  onOpenChallenge: () => void;
  hasMembershipAccess?: boolean;
}

export const MoodTool: React.FC<MoodToolProps> = ({
  onOpenJoin,
  hasMembershipAccess = false,
}) => {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);

  return (
    <section id="mood-tool-standalone" className="py-16 bg-[#F6F0E6] border-y border-[#E5DFD3]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEDD5] border border-[#C2410C]/30 text-[#C2410C] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Signature Interactive Feature
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1F1917] uppercase tracking-tight">
            WHAT&apos;S YOUR MOOD TODAY?
          </h2>
          <p className="text-[#524B45] max-w-xl mx-auto text-sm mt-2 font-medium">
            Select how you feel. Get tips to shake it, then a member reset — not a shirt.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-10">
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = selectedMood?.id === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood)}
                className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[44px] ${
                  isSelected
                    ? 'bg-[#C2410C] text-white border-[#C2410C] font-extrabold shadow-lg shadow-[#C2410C]/25 scale-105'
                    : 'bg-white border-[#E5DFD3] text-[#1F1917] hover:border-[#C2410C] hover:bg-[#FAF8F5] shadow-sm'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs tracking-wider uppercase font-mono font-bold">
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>

        {selectedMood ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setSelectedMood(null)}
              className="absolute -top-2 right-0 z-10 min-h-[44px] px-3 text-xs text-[#3F3832] hover:text-[#1F1917] inline-flex items-center gap-1 cursor-pointer font-mono font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <MoodShakePanel
              mood={selectedMood}
              hasMembershipAccess={hasMembershipAccess}
              onUnlock={onOpenJoin}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#3F3832] font-mono border border-dashed border-[#E5DFD3] rounded-2xl bg-white">
            Click any mood above to get shake-it tips
          </div>
        )}
      </div>
    </section>
  );
};
