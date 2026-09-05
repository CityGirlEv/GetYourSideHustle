import React from 'react';
import { X, TestTube, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

interface BetaWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpAsBetaTester: () => void;
}

export const BetaWelcomeModal: React.FC<BetaWelcomeModalProps> = ({
  isOpen,
  onClose,
  onSignUpAsBetaTester,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4" data-testid="beta-welcome-modal">
      <div className="absolute inset-0 bg-[#1F1917]/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#FAF8F5] border-4 border-[#C2410C] rounded-3xl p-6 sm:p-8 max-w-md w-full text-[#1F1917] shadow-2xl z-10 font-sans space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#3F3832] hover:text-[#1F1917] p-1 rounded-full border border-[#1F1917] cursor-pointer"
          aria-label="Close alpha welcome"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] font-mono font-black text-xs uppercase tracking-wider border border-[#C2410C]/30">
            <Sparkles className="w-3.5 h-3.5" /> We Are In Alpha
          </div>
          <div className="flex justify-center">
            <Logo variant="seal-only" size="lg" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight font-serif text-[#1F1917]">
            We Are In Alpha
          </h3>
          <p className="text-base sm:text-lg text-[#1F1917] font-black leading-snug uppercase tracking-tight">
            When we get to Beta, can we count on you?
          </p>
          <p
            className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-[#C2410C] animate-pulse drop-shadow-sm"
            data-testid="beta-welcome-perks"
          >
            Perks Involved!!
          </p>
        </div>

        <div
          className="bg-[#FFEDD5] border-2 border-[#C2410C] rounded-2xl px-4 py-4 text-center space-y-3"
          data-testid="beta-welcome-cta"
        >
          <p className="text-sm sm:text-base text-[#1F1917] font-semibold leading-relaxed">
            Want first dibs when we hit Beta?
          </p>
          <button
            type="button"
            onClick={onSignUpAsBetaTester}
            className="w-full py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer border-2 border-[#FDBA74] flex items-center justify-center gap-2"
            data-testid="beta-welcome-signup-button"
          >
            <TestTube className="w-4 h-4" /> Count Me In for Beta
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 text-xs font-bold uppercase tracking-wider text-[#3F3832] hover:text-[#1F1917] cursor-pointer"
        >
          Continue to the site
        </button>
      </div>
    </div>
  );
};
