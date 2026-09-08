import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { AudioAlertService } from '../services/sound/AudioAlertService';
import { ThemeMode } from '../theme/pantone';

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSeconds?: number;
  completedSetNumber?: number;
  exerciseName?: string;
  themeMode?: ThemeMode;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  isOpen,
  onClose,
  initialSeconds = 90,
  completedSetNumber = 1,
  exerciseName = '운동',
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(AudioAlertService.getIsMuted());

  // Reset when opened with new initialSeconds
  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(initialSeconds);
      setIsRunning(true);
    }
  }, [isOpen, initialSeconds]);

  // Audio mute state sync
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    AudioAlertService.setMuted(next);
  };

  // Timer interval & sound trigger
  useEffect(() => {
    if (!isOpen || !isRunning) return;

    if (secondsLeft <= 0) {
      AudioAlertService.playRestFinished();
      setIsRunning(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          AudioAlertService.playRestFinished();
          setIsRunning(false);
          return 0;
        }
        // Beep tick on last 3, 2, 1 seconds
        if (prev <= 4 && prev > 1) {
          AudioAlertService.playCountdownTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isRunning, secondsLeft]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.max(0, ((initialSeconds - secondsLeft) / (initialSeconds || 1)) * 100));
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAdjustTime = (delta: number) => {
    setSecondsLeft(prev => Math.max(0, prev + delta));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border transition-colors flex flex-col items-center text-center ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200'
            : 'bg-[#121217] border-[#272732] text-white shadow-2xl'
        }`}
      >
        {/* Top bar: sound toggle & close */}
        <div className="w-full flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-xl transition-colors ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#181820] hover:bg-[#23232D] text-slate-300'
            }`}
            title={isMuted ? '음소거 해제' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#22C55E]" />}
          </button>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                isLight ? 'bg-lime-100 text-lime-800' : 'bg-[#D4FF00]/15 text-[#D4FF00] border border-[#D4FF00]/30'
              }`}
            >
              REST TIMER
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#181820] hover:bg-[#23232D] text-slate-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Set Completion Badge */}
        <div className="my-1">
          <p className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {exerciseName}
          </p>
          <h3 className={`text-base font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
            #{completedSetNumber}세트 완료! 휴식 시작
          </h3>
        </div>

        {/* Big Circular / Boxed Countdown Display */}
        <div className="my-4 relative w-48 h-48 flex items-center justify-center">
          {/* Circular SVG progress */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className={isLight ? 'stroke-slate-100' : 'stroke-[#1c1c24]'}
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={secondsLeft <= 3 && secondsLeft > 0 ? 'stroke-rose-500 transition-all' : isLight ? 'stroke-lime-600 transition-all' : 'stroke-[#D4FF00] transition-all'}
              strokeWidth="7"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl font-black font-mono-num tracking-tight ${
                secondsLeft <= 3 && secondsLeft > 0
                  ? 'text-rose-500 animate-ping-once'
                  : secondsLeft === 0
                  ? 'text-rose-500 font-extrabold'
                  : isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {formatTime(secondsLeft)}
            </span>
            <span className={`text-[11px] font-bold mt-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              {secondsLeft === 0 ? '다음 세트 준비!' : '휴식 중'}
            </span>
          </div>
        </div>

        {/* Quick Adjust Buttons */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleAdjustTime(-15)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#181820] text-slate-300 border-[#272732]'
            }`}
          >
            -15초
          </button>
          <button
            type="button"
            onClick={() => handleAdjustTime(15)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#181820] text-slate-300 border-[#272732]'
            }`}
          >
            +15초
          </button>
          <button
            type="button"
            onClick={() => handleAdjustTime(30)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              isLight ? 'bg-lime-50 text-lime-800 border-lime-300' : 'bg-[#181820] text-[#D4FF00] border-[#272732]'
            }`}
          >
            +30초
          </button>
        </div>

        {/* Bottom Play / Pause / Next Set CTA */}
        <div className="w-full grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className={`py-3 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-[#181820] hover:bg-[#23232D] text-white border-[#272732]'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>계속 진행</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 rounded-2xl text-xs font-black bg-[#D4FF00] hover:bg-[#C5EB00] text-black shadow-md shadow-[#D4FF00]/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <span>다음 세트 시작</span>
          </button>
        </div>
      </div>
    </div>
  );
};
