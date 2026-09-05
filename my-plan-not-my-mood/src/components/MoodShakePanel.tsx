import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Lock, RefreshCw, Timer, Zap } from 'lucide-react';
import type { MoodOption } from '../data/moods';
import {
  MOOD_SHAKE_EXERCISE_LABEL,
  MOOD_SHAKE_GAME_LABEL,
  MOOD_SHAKE_GAME_SECONDS,
  MOOD_SHAKE_LOCK_LABEL,
  MOOD_SHAKE_START_LABEL,
  MOOD_SHAKE_TIPS_LABEL,
  MOOD_SHAKE_UNLOCK_LABEL,
  moodShakePlay,
  scoreShakeTaps,
  shakeTilesForMood,
  shuffleShakeTiles,
  type ShakeTile,
  type ShakeTileKind,
} from '../lib/moodShake';

type MoodShakePanelProps = {
  mood: MoodOption;
  hasMembershipAccess?: boolean;
  onUnlock?: () => void;
};

type GamePhase = 'idle' | 'running' | 'done';

export const MoodShakePanel: React.FC<MoodShakePanelProps> = ({
  mood,
  hasMembershipAccess = false,
  onUnlock,
}) => {
  const play = moodShakePlay(mood.id);
  const [doneSteps, setDoneSteps] = useState<Record<number, boolean>>({});
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(MOOD_SHAKE_GAME_SECONDS);
  const [tiles, setTiles] = useState<ShakeTile[]>([]);
  const [taps, setTaps] = useState<ShakeTileKind[]>([]);
  const [caught, setCaught] = useState<string[]>([]);

  useEffect(() => {
    setDoneSteps({});
    setPhase('idle');
    setSecondsLeft(MOOD_SHAKE_GAME_SECONDS);
    setTiles([]);
    setTaps([]);
    setCaught([]);
  }, [mood.id]);

  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setPhase('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const planCount = play?.game.planMoves.length ?? 0;
  const trapCount = play?.game.moodTraps.length ?? 0;
  const score = useMemo(() => scoreShakeTaps(taps, planCount, trapCount), [taps, planCount, trapCount]);

  if (!play) return null;

  const startRound = () => {
    setTiles(shuffleShakeTiles(shakeTilesForMood(mood.id)));
    setTaps([]);
    setCaught([]);
    setSecondsLeft(MOOD_SHAKE_GAME_SECONDS);
    setPhase('running');
  };

  const handleTile = (tile: ShakeTile) => {
    if (phase !== 'running' || caught.includes(tile.id)) return;
    setCaught((prev) => [...prev, tile.id]);
    setTaps((prev) => [...prev, tile.kind]);
  };

  const toggleStep = (index: number) => {
    setDoneSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div
      className="max-w-5xl mx-auto bg-white border-2 border-[#1F1917] rounded-3xl overflow-hidden shadow-2xl text-left animate-fadeIn my-4 grid grid-cols-1 md:grid-cols-2"
      data-testid="mood-shake-panel"
    >
      <div className="bg-[#FAF8F5] p-6 border-b md:border-b-0 md:border-r border-[#E5DFD3] space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-3xl" aria-hidden="true">
            {mood.emoji}
          </span>
          <span className="text-[10px] font-mono font-black px-3 py-1 rounded-xl bg-[#C2410C] text-white uppercase tracking-wider">
            Mood detected: {mood.label}
          </span>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C2410C] font-mono mb-2">
            {MOOD_SHAKE_TIPS_LABEL}
          </h4>
          <ul className="space-y-2">
            {play.tips.map((tip) => (
              <li
                key={tip}
                className="text-sm text-[#1F1917] font-medium leading-relaxed pl-3 border-l-4 border-[#C2410C]"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-6 sm:p-8 flex flex-col gap-5">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#1F1917]">{mood.responseTitle}</h3>
          <p className="text-xs sm:text-sm text-[#2D2623] font-medium leading-relaxed mt-2">{mood.brandResponse}</p>
        </div>

        <div className="bg-[#FFEDD5] border-2 border-[#C2410C] rounded-2xl p-4 shadow-sm">
          <h4 className="text-xs font-black text-[#C2410C] uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#C2410C]" /> Today&apos;s single play
          </h4>
          <p className="text-xs sm:text-sm text-[#1F1917] font-black leading-relaxed">{mood.actionStep}</p>
        </div>

        {hasMembershipAccess ? (
          <div className="space-y-4" data-testid="mood-shake-member">
            <div className="rounded-2xl border-2 border-[#1F1917] bg-[#FAF8F5] p-4 space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9A6B3D] font-mono">
                {MOOD_SHAKE_EXERCISE_LABEL}: {play.exercise.title}
              </h4>
              <ol className="space-y-2">
                {play.exercise.steps.map((step, index) => (
                  <li key={step}>
                    <button
                      type="button"
                      onClick={() => toggleStep(index)}
                      className={`w-full min-h-[44px] text-left px-3 py-2 rounded-xl border-2 text-xs font-bold flex items-center gap-2 cursor-pointer ${
                        doneSteps[index]
                          ? 'bg-[#C2410C] text-white border-[#1F1917]'
                          : 'bg-white text-[#1F1917] border-[#E5DFD3]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      {index + 1}. {step}
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border-2 border-[#1F1917] bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C2410C] font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> {MOOD_SHAKE_GAME_LABEL}: {play.game.title}
                </h4>
                {phase === 'running' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-black text-[#C2410C]">
                    <Timer className="w-3.5 h-3.5" /> {secondsLeft}s
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-[#3F3832] font-medium">{play.game.howTo}</p>
              {phase === 'idle' ? (
                <button
                  type="button"
                  onClick={startRound}
                  className="w-full min-h-[44px] rounded-xl bg-[#C2410C] text-white font-black text-xs uppercase tracking-wider border-2 border-[#1F1917] cursor-pointer"
                  data-testid="mood-shake-start"
                >
                  {MOOD_SHAKE_START_LABEL}
                </button>
              ) : null}
              {phase === 'running' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="mood-shake-board">
                  {tiles.map((tile) => {
                    const used = caught.includes(tile.id);
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        disabled={used}
                        onClick={() => handleTile(tile)}
                        className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-xs font-black uppercase tracking-wide cursor-pointer ${
                          used
                            ? tile.kind === 'plan'
                              ? 'bg-[#10B981] text-white border-[#1F1917] opacity-80'
                              : 'bg-[#9A3412] text-white border-[#1F1917] opacity-80'
                            : 'bg-[#FAF8F5] text-[#1F1917] border-[#1F1917] hover:bg-[#FFEDD5]'
                        }`}
                      >
                        {tile.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {phase === 'done' ? (
                <div className="space-y-3" data-testid="mood-shake-score">
                  <p className="text-sm font-black text-[#1F1917]">
                    {score.perfect ? 'Clean round. The plan won.' : `Score ${score.score} — plan hits ${score.planHits}, mood traps ${score.trapHits}.`}
                  </p>
                  <button
                    type="button"
                    onClick={startRound}
                    className="w-full min-h-[44px] rounded-xl bg-white text-[#1F1917] font-black text-xs uppercase tracking-wider border-2 border-[#1F1917] cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Play again
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl border-2 border-dashed border-[#C2410C] bg-[#FFEDD5] p-4 space-y-3"
            data-testid="mood-shake-locked"
          >
            <p className="text-xs font-bold text-[#1F1917] leading-relaxed inline-flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-[#C2410C]" />
              {MOOD_SHAKE_LOCK_LABEL}
            </p>
            <button
              type="button"
              onClick={onUnlock}
              className="w-full min-h-[44px] rounded-xl bg-[#C2410C] text-white font-black text-xs uppercase tracking-wider border-2 border-[#1F1917] cursor-pointer"
            >
              {MOOD_SHAKE_UNLOCK_LABEL}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodShakePanel;
