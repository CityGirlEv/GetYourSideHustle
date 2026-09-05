import React, { useState, useEffect } from 'react';
import { Sparkles, Sun, Zap, Moon, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { SessionType, SESSION_META } from '../data/affirmations';
import { getDailyCompletionStatus, getCurrentSessionType, DailyCompletionStatus } from '../lib/affirmations';

interface DailyAffirmationsWidgetProps {
  onOpenAffirmations: (sessionType?: SessionType) => void;
  hasMembershipAccess?: boolean;
  onOpenJoin?: () => void;
  membershipsVisible?: boolean;
}

export const DailyAffirmationsWidget: React.FC<DailyAffirmationsWidgetProps> = ({
  onOpenAffirmations,
  hasMembershipAccess = false,
  onOpenJoin,
  membershipsVisible = false,
}) => {
  const [dailyStatus, setDailyStatus] = useState<DailyCompletionStatus>(() =>
    getDailyCompletionStatus()
  );
  const currentSession = getCurrentSessionType();
  const meta = SESSION_META[currentSession];

  useEffect(() => {
    setDailyStatus(getDailyCompletionStatus());
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-gradient-to-r from-[#1F1917] via-[#2D2623] to-[#1F1917] text-white border-4 border-[#C2410C] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Headline & Session Overview */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2410C] text-white text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> NON-NEGOTIABLE DAILY AFFIRMATIONS
            </div>

            <h3 className="font-serif font-black text-2xl sm:text-3xl text-white tracking-tight uppercase leading-tight">
              Start From Who You Are — <span className="text-[#F59E0B] italic">Not How You Feel</span>
            </h3>

            <p className="text-xs sm:text-sm text-white font-sans leading-relaxed max-w-xl">
              Take 20–30 seconds for your daily micro-set. Reset your mindset, establish boundaries, and anchor in your divine truth.
            </p>

            {/* Daily Status Ticker */}
            <div className="pt-2 flex items-center gap-3 flex-wrap text-xs font-mono font-bold">
              <span className="text-amber-400 font-black uppercase tracking-wider text-[11px]">
                Today’s Protocol:
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 ${
                  dailyStatus.morning ? 'bg-green-600/90 text-white font-black' : 'bg-white/10 text-gray-400'
                }`}>
                  ☀️ Morning {dailyStatus.morning ? '✓' : '•'}
                </span>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 ${
                  dailyStatus.midday ? 'bg-green-600/90 text-white font-black' : 'bg-white/10 text-gray-400'
                }`}>
                  ⚡ Midday {dailyStatus.midday ? '✓' : '•'}
                </span>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 ${
                  dailyStatus.night ? 'bg-green-600/90 text-white font-black' : 'bg-white/10 text-gray-400'
                }`}>
                  🌙 Night {dailyStatus.night ? '✓' : '•'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Launch Card */}
          <div className="lg:col-span-5 bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm space-y-4 text-center lg:text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[9px] font-mono text-[#F59E0B] uppercase tracking-widest font-black block">
                  Current Recommended Set
                </span>
                <h4 className="font-serif font-black text-lg text-white uppercase flex items-center gap-2">
                  <span>{meta.icon}</span> {meta.title}
                </h4>
              </div>
              <span className="text-[10px] font-mono bg-white/20 text-white px-2 py-0.5 rounded uppercase">
                {meta.optimalHours}
              </span>
            </div>

            <p className="text-xs text-amber-100/90 italic font-sans">
              "{meta.supportingCopy}"
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => (hasMembershipAccess ? onOpenAffirmations(currentSession) : onOpenJoin?.())}
                className="flex-1 py-3 px-4 bg-[#C2410C] hover:bg-[#EA580C] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                {hasMembershipAccess ? (
                  <>
                    Begin {meta.title} (30s)
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Join to Unlock
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {membershipsVisible && (
              <button
                onClick={() => (hasMembershipAccess ? onOpenAffirmations() : onOpenJoin?.())}
                className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-white/20 inline-flex items-center gap-1.5"
              >
                {hasMembershipAccess ? 'All Sets' : 'View Membership'}
              </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default DailyAffirmationsWidget;
