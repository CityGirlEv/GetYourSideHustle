import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1F1917]/75 backdrop-blur-sm" onClick={onClose} />

      {/* 2-Column Desktop Modal Container */}
      <div className="relative bg-white border-2 border-[#1F1917] rounded-3xl max-w-3xl w-full text-[#1F1917] shadow-2xl z-10 font-sans overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-[#3F3832] hover:text-[#1F1917] bg-white/80 p-1.5 rounded-full border border-[#1F1917] cursor-pointer shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Left Column: Image Box */}
        <div className="relative bg-[#FAF8F5] p-6 border-b md:border-b-0 md:border-r border-[#E5DFD3] flex flex-col justify-center items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] border border-[#C2410C]/40 text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> 7-DAY RESET KIT
          </div>
          <p className="text-[11px] font-mono font-bold text-[#3F3832] mt-3 uppercase tracking-tight">
            Included: Printable PDF Tracker + Daily Reset Guide
          </p>
        </div>

        {/* Desktop Right Column: Form Box */}
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          {!isSubmitted ? (
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-[#1F1917] mb-2 font-serif">
                7 DAYS OF PLAN &gt; MOOD
              </h3>

              <p className="text-xs text-[#3F3832] mb-6 leading-relaxed font-medium">
                Unlock the free 7-Day Starter PDF Printable Tracker + Daily Mindset Reset Email Series. Define your single priority play and build consistent follow-through.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Your Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="angela@example.com"
                    className="w-full bg-[#FAF8F5] border border-[#1F1917] rounded-xl px-3 py-2 text-xs text-[#1F1917] font-bold focus:border-[#C2410C] focus:outline-none shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#1F1917] mb-1">Your Single Priority Goal for 7 Days</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Walk 30 mins daily / Finish business plan"
                    className="w-full bg-[#FAF8F5] border border-[#1F1917] rounded-xl px-3 py-2 text-xs text-[#1F1917] font-bold focus:border-[#C2410C] focus:outline-none shadow-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg border border-[#1F1917]"
                >
                  Claim Free 7-Day Starter Kit
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-[#10B981] text-white border-2 border-[#1F1917] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-[#1F1917] font-serif">Starter Kit Dispatched!</h3>
              <p className="text-xs text-[#3F3832] leading-relaxed font-medium">
                We sent your 7-Day Tracker Printable PDF to <strong className="text-[#1F1917]">{email}</strong>. Check your inbox to begin Day 1.
              </p>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#FAF8F5] hover:bg-[#FFEDD5] text-[#1F1917] font-bold text-xs uppercase rounded-xl border border-[#1F1917] cursor-pointer shadow-sm"
              >
                Back To Store
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
