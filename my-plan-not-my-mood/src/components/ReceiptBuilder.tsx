import React, { useState } from 'react';
import { Flame, Download, Share2, CheckSquare, Sparkles } from 'lucide-react';
import { HOME_RECEIPTS_HEADING, homeReceiptsTitleDisplay } from '../lib/homePillars';
import { FancySectionHeading } from './FancySectionHeading';

export const ReceiptBuilder: React.FC = () => {
  const [mood, setMood] = useState('Exhausted & Overwhelmed');
  const [planExecuted, setPlanExecuted] = useState('Completed 30-min workout & sent 5 proposals');
  const [winner, setWinner] = useState<'PLAN' | 'MOOD'>('PLAN');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section id="receipts" className="pt-4 pb-12 sm:pt-5 sm:pb-16 bg-[#F6F0E6]">
      <div
        className="w-full px-8 sm:px-16 py-1"
        data-testid="receipts-section-separator"
        aria-hidden="true"
      >
        <div className="h-px w-full max-w-6xl mx-auto bg-[#E8C49A]" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FFEDD5] border border-[#C2410C]/40 text-[#C2410C] text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
            <Flame className="w-4 h-4 text-[#C2410C]" />
            Social Accountability Engine
          </div>
          <FancySectionHeading
            title={HOME_RECEIPTS_HEADING}
            display={homeReceiptsTitleDisplay(HOME_RECEIPTS_HEADING)}
            testId="receipts-heading"
            align="center"
          />
          <p className="text-[#3F3832] max-w-xl mx-auto text-sm mt-3 font-medium">
            Generate your daily digital receipt to log your follow-through and share your victory with the community.
          </p>
        </div>

        {/* 2-Column Desktop Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Desktop Left Column: Log Input Form Box */}
          <form onSubmit={handleGenerate} className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-[#1F1917] border-b border-[#E5DFD3] pb-3 mb-4 font-mono uppercase tracking-wider flex items-center justify-between">
                <span>LOG YOUR DAILY RECEIPT</span>
                <Sparkles className="w-4 h-4 text-[#C2410C]" />
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#1F1917] font-mono font-bold mb-1.5 uppercase">Today's Initial Mood</label>
                  <input
                    type="text"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g. Tired, Unmotivated, Stressed"
                    className="w-full bg-[#FAF8F5] border border-[#1F1917] text-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#1F1917] font-mono font-bold mb-1.5 uppercase">Today's Executed Plan</label>
                  <textarea
                    value={planExecuted}
                    onChange={(e) => setPlanExecuted(e.target.value)}
                    placeholder="e.g. Went to gym, finished essay, paid bills"
                    rows={3}
                    className="w-full bg-[#FAF8F5] border border-[#1F1917] text-[#1F1917] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:border-[#C2410C] focus:outline-none shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#1F1917] font-mono font-bold mb-2 uppercase">What Won Today?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setWinner('PLAN')}
                      className={`py-3 px-3 rounded-xl border-2 text-xs font-black font-mono transition-all cursor-pointer ${
                        winner === 'PLAN'
                          ? 'bg-[#C2410C] text-white border-[#1F1917] shadow-lg scale-105'
                          : 'bg-[#FAF8F5] text-[#1F1917] border-[#E5DFD3] hover:border-[#1F1917]'
                      }`}
                    >
                      ☑ THE PLAN
                    </button>
                    <button
                      type="button"
                      onClick={() => setWinner('MOOD')}
                      className={`py-3 px-3 rounded-xl border-2 text-xs font-black font-mono transition-all cursor-pointer ${
                        winner === 'MOOD'
                          ? 'bg-[#EA580C] text-white border-[#FDBA74] shadow-lg scale-105'
                          : 'bg-[#FAF8F5] text-[#1F1917] border-[#E5DFD3] hover:border-[#1F1917]'
                      }`}
                    >
                      ☐ THE MOOD
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg border border-[#1F1917] mt-4"
            >
              Generate Digital Receipt
            </button>
          </form>

          {/* Desktop Right Column: Social Receipt Preview & Action Box */}
          <div className="bg-white border-2 border-[#1F1917] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between shadow-xl">
            <div className="w-full max-w-[300px] bg-[#FAF8F5] border-2 border-[#1F1917] rounded-2xl p-6 shadow-2xl font-mono text-xs text-[#1F1917] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#1F1917] pb-3">
                <div className="flex items-center gap-1.5 font-black text-[#C2410C] text-sm">
                  <CheckSquare className="w-4 h-4" /> RECEIPT
                </div>
                <div className="text-[10px] font-extrabold text-[#3F3832]">{new Date().toLocaleDateString()}</div>
              </div>

              <div>
                <span className="text-[10px] text-[#3F3832] font-bold uppercase block">TODAY'S MOOD:</span>
                <span className="text-[#1F1917] font-black">{mood}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#3F3832] font-bold uppercase block">EXECUTED PLAN:</span>
                <span className="text-[#1F1917] font-bold">{planExecuted}</span>
              </div>

              <div className="bg-[#FFEDD5] border-2 border-[#C2410C] p-3.5 rounded-xl text-center shadow-sm">
                <span className="text-[10px] text-[#C2410C] font-black uppercase block mb-1">VICTORY DETERMINATION</span>
                {winner === 'PLAN' ? (
                  <span className="text-[#C2410C] font-black text-base uppercase flex items-center justify-center gap-1">
                    ✓ THE PLAN WON
                  </span>
                ) : (
                  <span className="text-[#1F1917] font-black text-sm uppercase">
                    MOOD WON TODAY — REGROUP TOMORROW
                  </span>
                )}
              </div>

              <div className="text-[9px] text-[#3F3832] font-bold text-center border-t border-[#E5DFD3] pt-3 tracking-widest uppercase">
                #MYPLANNOTMYMOOD • MYPLANNOTMYMOOD.COM
              </div>
            </div>

            {/* Social Share Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full max-w-[300px]">
              <button
                onClick={() => alert('Receipt graphic downloaded for Instagram Story!')}
                className="w-full py-2.5 bg-[#FAF8F5] hover:bg-[#FFEDD5] text-[#1F1917] font-bold text-xs rounded-xl border border-[#1F1917] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" /> Download Graphic
              </button>
              <button
                onClick={() => alert('Copied receipt text to clipboard!')}
                className="w-full py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md border border-[#1F1917]"
              >
                <Share2 className="w-4 h-4" /> Share #WhatWonToday
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReceiptBuilder;
