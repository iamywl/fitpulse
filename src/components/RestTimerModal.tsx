import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { AudioAlertService } from '../services/sound/AudioAlertService';
import { ThemeMode } from '../theme/pantone';
import { TdsBadge, TdsButton } from './tds';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-sm rounded-t-[28px] sm:rounded-3xl p-6 shadow-2xl border transition-all flex flex-col items-center text-center ${
          isLight
            ? 'bg-white border-slate-100 text-slate-900 shadow-slate-300/50'
            : 'bg-[#1C1C1E] border-[#2C2C2E] text-white shadow-2xl'
        }`}
      >
        {/* Top bar: sound toggle & close */}
        <div className="w-full flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={toggleMute}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-[#252528] hover:bg-[#333D4B] text-slate-300'
            }`}
            title={isMuted ? '음소거 해제' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#F04452]" /> : <Volume2 className="w-4 h-4 text-[#00BFA5]" />}
          </button>

          <TdsBadge variant="weak" color="blue" size="small">
            휴식 시간
          </TdsBadge>

          <button
            type="button"
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-[#252528] hover:bg-[#333D4B] text-slate-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Set Completion Title */}
        <div className="my-1">
          <p className={`text-xs font-semibold ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
            {exerciseName}
          </p>
          <h3 className={`text-base font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            #{completedSetNumber}세트 완료! 잠시 숨 고를게요 🧘
          </h3>
        </div>

        {/* Circular Countdown Display */}
        <div className="my-5 relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className={isLight ? 'stroke-slate-100' : 'stroke-[#2C2C2E]'}
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={
                secondsLeft <= 3 && secondsLeft > 0
                  ? 'stroke-[#F04452] transition-all'
                  : 'stroke-[#3182F6] transition-all'
              }
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
              className={`text-4xl font-bold font-mono-num tracking-tight ${
                secondsLeft <= 3 && secondsLeft > 0
                  ? 'text-[#F04452] animate-pulse'
                  : secondsLeft === 0
                  ? 'text-[#F04452] font-bold'
                  : isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {formatTime(secondsLeft)}
            </span>
            <span className={`text-xs font-medium mt-1 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
              {secondsLeft === 0 ? '다음 세트 시작할 시간이에요!' : '회복 중'}
            </span>
          </div>
        </div>

        {/* Quick Adjust Buttons */}
        <div className="flex items-center gap-2 mb-5">
          <button
            type="button"
            onClick={() => handleAdjustTime(-15)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#252528] hover:bg-[#333D4B] text-slate-300'
            }`}
          >
            -15초
          </button>
          <button
            type="button"
            onClick={() => handleAdjustTime(15)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#252528] hover:bg-[#333D4B] text-slate-300'
            }`}
          >
            +15초
          </button>
          <button
            type="button"
            onClick={() => handleAdjustTime(30)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isLight ? 'bg-blue-50 text-[#3182F6] hover:bg-blue-100' : 'bg-blue-950/40 text-[#3182F6] hover:bg-blue-900/50'
            }`}
          >
            +30초
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          <TdsButton
            variant="secondary"
            size="medium"
            fullWidth
            onClick={() => setIsRunning(!isRunning)}
          >
            <div className="flex items-center justify-center gap-1.5">
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? '일시정지' : '계속하기'}</span>
            </div>
          </TdsButton>

          <TdsButton
            variant="primary"
            size="medium"
            fullWidth
            onClick={onClose}
          >
            <span>다음 세트 시작</span>
          </TdsButton>
        </div>
      </div>
    </div>
  );
};
