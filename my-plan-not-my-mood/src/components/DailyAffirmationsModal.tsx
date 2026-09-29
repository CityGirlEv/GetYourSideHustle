import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Mic,
  Heart,
  Wind,
  Shield,
  Sun,
  Zap,
  Moon,
} from 'lucide-react';
import {
  Affirmation,
  SessionType,
  SESSION_META,
  AFFIRMATION_CATEGORIES,
} from '../data/affirmations';
import { DailyAffirmationsExplainer, SessionExplainerCard } from './DailyAffirmationsExplainer';
import {
  getSessionAffirmations,
  getCurrentSessionType,
  recordSessionCompletion,
  recordReflectionSelection,
  getDailyCompletionStatus,
  DailyCompletionStatus,
} from '../lib/affirmations';
import { AppUser } from '../lib/userAuth';

interface DailyAffirmationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AppUser | null;
  defaultSessionType?: SessionType;
}

export const DailyAffirmationsModal: React.FC<DailyAffirmationsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  defaultSessionType,
}) => {
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType>(
    defaultSessionType || getCurrentSessionType()
  );
  const [sessionAffirmations, setSessionAffirmations] = useState<Affirmation[]>([]);
  const [currentAffIndex, setCurrentAffIndex] = useState<number>(0);
  const [phase, setPhase] = useState<'picker' | 'breath' | 'affirmation' | 'reflection' | 'completed'>('picker');
  const [breathCountdown, setBreathCountdown] = useState<number>(3);
  const [selectedReflectionId, setSelectedReflectionId] = useState<string | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyCompletionStatus>(() => getDailyCompletionStatus());
  const [voiceTrustAlert, setVoiceTrustAlert] = useState<string | null>(null);

  // Update session type when default changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const naturalType = defaultSessionType || getCurrentSessionType();
      setSelectedSessionType(naturalType);
      setDailyStatus(getDailyCompletionStatus());
      setPhase('picker');
      setSelectedReflectionId(null);
      setVoiceTrustAlert(null);
    }
  }, [isOpen, defaultSessionType]);

  // Handle breath cue timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'breath') {
      setBreathCountdown(3);
      timer = setInterval(() => {
        setBreathCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('affirmation');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase]);

  if (!isOpen) return null;

  const sessionMeta = SESSION_META[selectedSessionType];

  const handleStartSession = (type: SessionType) => {
    setSelectedSessionType(type);
    const items = getSessionAffirmations(type, currentUser?.id, 3);
    setSessionAffirmations(items);
    setCurrentAffIndex(0);
    setPhase('breath');
  };

  const handleNextAffirmation = () => {
    if (currentAffIndex < sessionAffirmations.length - 1) {
      setCurrentAffIndex((prev) => prev + 1);
    } else {
      // Affirmation micro-set finished -> move to optional 10-second reflection
      const updatedStatus = recordSessionCompletion(selectedSessionType);
      setDailyStatus(updatedStatus);
      setPhase('reflection');
    }
  };

  const handlePrevAffirmation = () => {
    if (currentAffIndex > 0) {
      setCurrentAffIndex((prev) => prev - 1);
    }
  };

  const handleSelectReflection = (item: Affirmation) => {
    setSelectedReflectionId(item.id);
    recordReflectionSelection(selectedSessionType, item, currentUser?.id);
    setTimeout(() => {
      setPhase('completed');
    }, 400);
  };

  const handleSkipReflection = () => {
    setPhase('completed');
  };

  const handleTriggerVoiceTrust = () => {
    setVoiceTrustAlert('Voice Trust Layer is architected and planned for the next release. You will be able to speak affirmations aloud with real-time coach feedback.');
    setTimeout(() => setVoiceTrustAlert(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border-4 border-[#1F1917] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-[#1F1917] text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C2410C] flex items-center justify-center text-white text-base shadow-sm">
              ✨
            </div>
            <div>
              <div className="font-serif font-black text-base sm:text-lg text-white tracking-tight uppercase">
                DAILY AFFIRMATIONS <span className="text-[#F59E0B]">SYSTEM</span>
              </div>
              <p className="text-[10px] font-mono text-amber-200/80 uppercase tracking-wider">
                Small enough to do every day. Powerful enough to matter.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Daily Affirmations"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Completion Tracker Strip */}
        <div className="bg-[#FFEDD5] border-b-2 border-[#1F1917] px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs font-mono font-bold text-[#1F1917]">
          <span className="uppercase tracking-wider text-[11px] text-[#C2410C] flex items-center gap-1.5 font-black">
            <CheckCircle2 className="w-4 h-4" /> Today's Affirmations:
          </span>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => handleStartSession('morning')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer text-[11px] ${
                dailyStatus.morning
                  ? 'bg-green-600 text-white font-black shadow-sm'
                  : selectedSessionType === 'morning' && phase !== 'picker'
                  ? 'bg-[#C2410C] text-white font-black'
                  : 'bg-white/80 hover:bg-white text-[#1F1917] border border-[#1F1917]/20'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Morning {dailyStatus.morning ? '✓' : '• Ready'}</span>
            </button>

            <button
              onClick={() => handleStartSession('midday')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer text-[11px] ${
                dailyStatus.midday
                  ? 'bg-green-600 text-white font-black shadow-sm'
                  : selectedSessionType === 'midday' && phase !== 'picker'
                  ? 'bg-[#C2410C] text-white font-black'
                  : 'bg-white/80 hover:bg-white text-[#1F1917] border border-[#1F1917]/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Midday {dailyStatus.midday ? '✓' : '• Ready'}</span>
            </button>

            <button
              onClick={() => handleStartSession('night')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer text-[11px] ${
                dailyStatus.night
                  ? 'bg-green-600 text-white font-black shadow-sm'
                  : selectedSessionType === 'night' && phase !== 'picker'
                  ? 'bg-[#C2410C] text-white font-black'
                  : 'bg-white/80 hover:bg-white text-[#1F1917] border border-[#1F1917]/20'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Night {dailyStatus.night ? '✓' : '• Ready'}</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto flex flex-col justify-center items-center text-center">
          {/* PHASE 1: SESSION PICKER */}
          {phase === 'picker' && (
            <div className="w-full max-w-xl space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C] font-mono text-[10px] font-black uppercase tracking-wider border border-[#C2410C]/30">
                  <Sparkles className="w-3.5 h-3.5" /> 20–30 SECOND RESET PROTOCOL
                </div>
                <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#1F1917] uppercase tracking-tight">
                  Choose Your Daily Micro-Set
                </h3>
                <p className="text-sm text-[#3F3832] font-sans">
                  "Start from who you are — not how you feel."
                </p>
              </div>

              <DailyAffirmationsExplainer />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* Morning Card */}
                <div
                  onClick={() => handleStartSession('morning')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left group hover:scale-[1.02] shadow-md ${
                    selectedSessionType === 'morning'
                      ? 'bg-gradient-to-br from-[#FFFBEB] to-amber-100 border-[#F59E0B] ring-2 ring-[#F59E0B]/50'
                      : 'bg-white border-[#1F1917] hover:bg-[#FFFBEB]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">☀️</span>
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                        dailyStatus.morning ? 'bg-green-600 text-white' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {dailyStatus.morning ? 'Completed' : '5am - 12pm'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-base text-[#1F1917] uppercase">
                        Morning Set
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-[#C2410C] uppercase tracking-wider">
                        Identity + Confidence
                      </p>
                    </div>
                    <p className="text-xs text-[#3F3832] leading-relaxed italic pt-1 border-t border-amber-200">
                      "{SESSION_META.morning.supportingCopy}"
                    </p>
                    <SessionExplainerCard type="morning" />
                  </div>
                  <button type="button" className="mt-4 w-full min-h-[44px] py-2 bg-[#EA580C] group-hover:bg-[#C2410C] text-white text-xs font-black uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1">
                    Begin Set <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Midday Card */}
                <div
                  onClick={() => handleStartSession('midday')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left group hover:scale-[1.02] shadow-md ${
                    selectedSessionType === 'midday'
                      ? 'bg-gradient-to-br from-[#FFF7ED] to-orange-100 border-[#C2410C] ring-2 ring-[#C2410C]/50'
                      : 'bg-white border-[#1F1917] hover:bg-[#FFF7ED]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">⚡</span>
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                        dailyStatus.midday ? 'bg-green-600 text-white' : 'bg-orange-200 text-orange-900'
                      }`}>
                        {dailyStatus.midday ? 'Completed' : '12pm - 6pm'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-base text-[#1F1917] uppercase">
                        Midday Set
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-[#C2410C] uppercase tracking-wider">
                        Boundaries + Truths
                      </p>
                    </div>
                    <p className="text-xs text-[#3F3832] leading-relaxed italic pt-1 border-t border-orange-200">
                      "{SESSION_META.midday.supportingCopy}"
                    </p>
                    <SessionExplainerCard type="midday" />
                  </div>
                  <button type="button" className="mt-4 w-full min-h-[44px] py-2 bg-[#EA580C] group-hover:bg-[#C2410C] text-white text-xs font-black uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1">
                    Begin Set <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Night Card */}
                <div
                  onClick={() => handleStartSession('night')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left group hover:scale-[1.02] shadow-md ${
                    selectedSessionType === 'night'
                      ? 'bg-gradient-to-br from-[#EEF2FF] to-indigo-100 border-[#4338CA] ring-2 ring-[#4338CA]/50'
                      : 'bg-white border-[#1F1917] hover:bg-[#EEF2FF]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🌙</span>
                      <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                        dailyStatus.night ? 'bg-green-600 text-white' : 'bg-indigo-200 text-indigo-900'
                      }`}>
                        {dailyStatus.night ? 'Completed' : '6pm - 5am'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-serif font-black text-base text-[#1F1917] uppercase">
                        Night Set
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-[#4338CA] uppercase tracking-wider">
                        Healing + Release + Faith
                      </p>
                    </div>
                    <p className="text-xs text-[#3F3832] leading-relaxed italic pt-1 border-t border-indigo-200">
                      "{SESSION_META.night.supportingCopy}"
                    </p>
                    <SessionExplainerCard type="night" />
                  </div>
                  <button type="button" className="mt-4 w-full min-h-[44px] py-2 bg-[#EA580C] group-hover:bg-[#4338CA] text-white text-xs font-black uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1">
                    Begin Set <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 2: REQUIRED BREATH CUE */}
          {phase === 'breath' && (
            <div className="space-y-8 animate-fadeIn max-w-md py-6">
              <div className="space-y-2">
                <span className="text-3xl">{sessionMeta.icon}</span>
                <h3 className="font-serif font-black text-xl sm:text-2xl text-[#1F1917] uppercase">
                  {sessionMeta.title}
                </h3>
                <p className="text-xs font-mono font-bold text-[#C2410C] uppercase tracking-wider">
                  {sessionMeta.theme}
                </p>
              </div>

              {/* Calming Breath Circle Pulse */}
              <div className="relative flex items-center justify-center my-4">
                <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-amber-200 via-orange-200 to-amber-100 animate-ping opacity-40 absolute" />
                <div className="w-32 h-32 rounded-full bg-white border-4 border-[#C2410C] shadow-2xl flex flex-col items-center justify-center relative z-10 animate-pulse">
                  <Wind className="w-8 h-8 text-[#C2410C] mb-1" />
                  <span className="font-serif font-black text-2xl text-[#1F1917]">{breathCountdown}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#1F1917] tracking-tight">
                  “Take a deep breath… now begin.”
                </h2>
                <p className="text-xs text-[#3F3832] font-mono uppercase tracking-widest">
                  {sessionMeta.supportingCopy}
                </p>
                <p className="text-sm text-[#3F3832] font-medium leading-relaxed max-w-md mx-auto pt-2" data-testid={`${selectedSessionType}-set-how-to-use`}>
                  {sessionMeta.howToUse}
                </p>
              </div>

              <button
                onClick={() => setPhase('affirmation')}
                className="px-6 py-2.5 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                Skip Countdown & Begin
              </button>
            </div>
          )}

          {/* PHASE 3: AFFIRMATION SEQUENCE (20–30s Micro-Set) */}
          {phase === 'affirmation' && sessionAffirmations.length > 0 && (
            <div className="w-full max-w-xl space-y-6 animate-fadeIn py-2 flex flex-col items-center justify-between min-h-[380px]">
              {/* Progress & Category Top Line */}
              <div className="w-full flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider border border-[#C2410C]/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  {sessionAffirmations[currentAffIndex]?.category}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black text-[#3F3832]">
                    {currentAffIndex + 1} of {sessionAffirmations.length}
                  </span>
                  <div className="flex gap-1.5">
                    {sessionAffirmations.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentAffIndex
                            ? 'w-6 bg-[#C2410C]'
                            : idx < currentAffIndex
                            ? 'w-2 bg-[#1F1917]'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Large Centered Affirmation Card */}
              <div className="my-auto py-6 px-4 sm:px-8 space-y-4 w-full">
                <div className="text-4xl text-[#C2410C] opacity-30 font-serif leading-none">“</div>
                <h2 className="font-serif font-black text-2xl sm:text-4xl lg:text-5xl text-[#1F1917] tracking-tight leading-snug drop-shadow-sm uppercase">
                  {sessionAffirmations[currentAffIndex]?.text}
                </h2>
                <div className="text-4xl text-[#C2410C] opacity-30 font-serif leading-none text-right">”</div>

                {sessionAffirmations[currentAffIndex]?.authorNote && (
                  <p className="text-xs font-sans text-[#3F3832] italic max-w-md mx-auto">
                    {sessionAffirmations[currentAffIndex].authorNote}
                  </p>
                )}
              </div>

              {/* Future Voice Trust Layer Anchor */}
              <div className="w-full flex flex-col items-center gap-2">
                <button
                  onClick={handleTriggerVoiceTrust}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-amber-50 text-[#3F3832] hover:text-[#1F1917] border border-[#1F1917]/20 text-[10px] font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                  title="Speak Affirmation Aloud with Coach Effect (Planned Feature)"
                >
                  <Mic className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Voice Trust Layer (Planned Feature — Speak Aloud)</span>
                </button>

                {voiceTrustAlert && (
                  <div className="text-xs font-sans font-bold text-[#C2410C] bg-[#FFEDD5] px-4 py-2 rounded-xl border border-[#C2410C]/30 animate-fadeIn">
                    {voiceTrustAlert}
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="w-full flex items-center justify-between pt-4 border-t border-[#E5DFD3]">
                <button
                  onClick={handlePrevAffirmation}
                  disabled={currentAffIndex === 0}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentAffIndex === 0
                      ? 'opacity-30 cursor-not-allowed text-gray-400'
                      : 'bg-white hover:bg-gray-100 text-[#1F1917] border-2 border-[#1F1917]'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                <button
                  onClick={handleNextAffirmation}
                  className="px-6 py-2.5 rounded-2xl bg-[#C2410C] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg border-2 border-[#1F1917]"
                >
                  {currentAffIndex === sessionAffirmations.length - 1 ? 'Finish & Reflect' : 'Next Affirmation'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PHASE 4: 10-SECOND REFLECTION */}
          {phase === 'reflection' && (
            <div className="w-full max-w-xl space-y-6 animate-fadeIn py-2">
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C] text-[10px] font-mono font-black uppercase tracking-wider border border-[#C2410C]/30">
                  <Heart className="w-3.5 h-3.5 text-[#C2410C]" /> 10-SECOND INTENTIONAL REFLECTION
                </div>
                <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#1F1917] uppercase tracking-tight">
                  Which affirmation hit you today?
                </h3>
                <p className="text-xs text-[#3F3832] font-sans">
                  Select the phrase that anchors your mindset right now to personalize your daily rotation.
                </p>
              </div>

              {/* Affirmation Option Cards */}
              <div className="space-y-2.5 pt-2">
                {sessionAffirmations.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectReflection(item)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between group hover:scale-[1.01] shadow-sm ${
                      selectedReflectionId === item.id
                        ? 'bg-[#C2410C] text-white border-[#1F1917] ring-2 ring-amber-300'
                        : 'bg-white hover:bg-[#FFEDD5] text-[#1F1917] border-[#1F1917]'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                        selectedReflectionId === item.id ? 'text-amber-200' : 'text-[#C2410C]'
                      }`}>
                        {item.category}
                      </span>
                      <p className="font-serif font-bold text-base sm:text-lg uppercase leading-snug">
                        “{item.text}”
                      </p>
                    </div>
                    <div className={`p-2 rounded-xl shrink-0 ${
                      selectedReflectionId === item.id ? 'bg-white text-[#C2410C]' : 'bg-gray-100 text-gray-400 group-hover:bg-[#C2410C] group-hover:text-white'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Skip Option (Zero guilt / zero friction) */}
              <div className="pt-3 flex items-center justify-center">
                <button
                  onClick={handleSkipReflection}
                  className="text-xs font-mono font-bold text-[#3F3832] hover:text-[#1F1917] hover:underline cursor-pointer px-4 py-2"
                >
                  Skip for now →
                </button>
              </div>
            </div>
          )}

          {/* PHASE 5: COMPLETED CELEBRATION */}
          {phase === 'completed' && (
            <div className="w-full max-w-md space-y-6 animate-fadeIn py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto text-3xl shadow-xl border-4 border-[#1F1917]">
                ✓
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-mono font-black uppercase tracking-wider">
                  SESSION COMPLETE • DISCIPLINE GROUNDED
                </div>
                <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#1F1917] uppercase tracking-tight">
                  You Are Anchored in the Plan
                </h3>
                <p className="text-xs sm:text-sm text-[#3F3832] leading-relaxed">
                  Your mood had its say. You followed the plan anyway. Keep moving with authority today.
                </p>
              </div>

              {/* Daily Progress Status */}
              <div className="bg-white border-2 border-[#1F1917] rounded-2xl p-4 shadow-sm space-y-2 text-left">
                <span className="text-[10px] font-mono font-black text-[#C2410C] uppercase tracking-wider">
                  Today's Protocol Progress
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                  <div className={`p-2 rounded-xl ${dailyStatus.morning ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-400'}`}>
                    ☀️ Morning {dailyStatus.morning ? '✓' : '•'}
                  </div>
                  <div className={`p-2 rounded-xl ${dailyStatus.midday ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-400'}`}>
                    ⚡ Midday {dailyStatus.midday ? '✓' : '•'}
                  </div>
                  <div className={`p-2 rounded-xl ${dailyStatus.night ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-400'}`}>
                    🌙 Night {dailyStatus.night ? '✓' : '•'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPhase('picker')}
                  className="flex-1 py-3 bg-white hover:bg-gray-100 text-[#1F1917] border-2 border-[#1F1917] font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                >
                  Explore Other Sets
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#C2410C] hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg border-2 border-[#1F1917]"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DailyAffirmationsModal;
