import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { ArrowUpRight, ArrowDownRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

import { ThemeMode } from '../theme/pantone';

interface VolumeProgressionSectionProps {
  workouts: WorkoutSession[];
  isMobileView?: boolean;
  themeMode?: ThemeMode;
}

export const VolumeProgressionSection: React.FC<VolumeProgressionSectionProps> = ({
  workouts,
  isMobileView = false,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';
  const [filterSameRoutine, setFilterSameRoutine] = useState<boolean>(true);

  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workouts]);

  const currentSession = sortedWorkouts[0];

  const previousSession = useMemo(() => {
    if (!currentSession || sortedWorkouts.length < 2) return null;

    if (filterSameRoutine) {
      const currTitlePrefix = currentSession.title.split(' ')[0];
      const matched = sortedWorkouts.slice(1).find(w => w.title.includes(currTitlePrefix));
      if (matched) return matched;
    }

    return sortedWorkouts[1];
  }, [sortedWorkouts, currentSession, filterSameRoutine]);

  const comparison = useMemo(() => {
    if (!currentSession || !previousSession) return null;

    const comp = VolumeService.compareVolume(currentSession, previousSession);

    const exerciseDiffs = currentSession.exercises.map(currEx => {
      const currExVol = VolumeService.calculateExerciseVolume(currEx);
      const prevEx = previousSession.exercises.find(pe => pe.exerciseId === currEx.exerciseId);
      const prevExVol = prevEx ? VolumeService.calculateExerciseVolume(prevEx) : 0;
      const exDiff = currExVol - prevExVol;
      const exPercent = prevExVol > 0 ? (exDiff / prevExVol) * 100 : 0;

      return {
        exerciseName: currEx.exerciseName,
        category: currEx.category,
        currVol: currExVol,
        prevVol: prevExVol,
        diff: exDiff,
        percent: Math.round(exPercent * 10) / 10,
      };
    });

    return {
      ...comp,
      exerciseDiffs,
    };
  }, [currentSession, previousSession]);

  const triggerCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4FF00', '#38BDF8', '#FFFFFF']
    });
  };

  if (!currentSession || !previousSession || !comparison) {
    return (
      <div
        className={`border rounded-3xl p-6 text-center transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-700 shadow-sm'
            : 'bg-[#121217] border-[#23232D] text-slate-300 shadow-xl'
        }`}
      >
        <Zap className="w-8 h-8 mx-auto mb-2 text-[#FFB703] opacity-80" />
        <p className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
          볼륨 비교를 위해 최소 2개 이상의 운동 기록이 필요합니다.
        </p>
        <p className={`text-xs mt-1 max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          오늘 운동을 완료하거나, 상단의 <strong>[샘플]</strong> 버튼을 누르면 즉시 1개월 치 데이터와 점진적 과부하 그래프를 체험할 수 있습니다.
        </p>
      </div>
    );
  }

  const maxCompareVol = Math.max(comparison.currentVolume, comparison.previousVolume, 1);
  const currBarWidth = Math.min(100, Math.round((comparison.currentVolume / maxCompareVol) * 100));
  const prevBarWidth = Math.min(100, Math.round((comparison.previousVolume / maxCompareVol) * 100));

  return (
    <div
      className={`border rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-100'
          : 'bg-[#121217] border-[#272732] text-white shadow-2xl'
      }`}
    >
      {/* Subtle Glow */}
      {comparison.isOverload && !isLight && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4FF00]/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header */}
      <div className={`flex ${isMobileView ? 'flex-col' : 'flex-col sm:flex-row sm:items-center'} justify-between gap-3 mb-5 relative z-10`}>
        <div>
          <div className="flex items-center gap-2">
            <Zap className={`w-5 h-5 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`} />
            <h2 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              점진적 과부하 볼륨 분석
            </h2>
          </div>
        </div>

        {/* Filter Toggle */}
        <div
          className={`flex items-center gap-1.5 self-start p-1 rounded-xl border transition-colors ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'
          }`}
        >
          <button
            onClick={() => setFilterSameRoutine(true)}
            className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
              filterSameRoutine
                ? 'bg-[#D4FF00] text-black shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            동일 부위 비교
          </button>
          <button
            onClick={() => setFilterSameRoutine(false)}
            className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
              !filterSameRoutine
                ? 'bg-[#D4FF00] text-black shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            직전 세션 비교
          </button>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className={`grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'} gap-4 mb-5 relative z-10`}>
        {/* Main Growth Metric Card */}
        <div
          className={`${isMobileView ? '' : 'md:col-span-5'} border rounded-2xl p-4 flex flex-col justify-between transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'
          }`}
        >
          <div>
            <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              총 볼륨 성장률
            </span>
            <div className="flex items-baseline flex-wrap gap-2 mt-1.5">
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono-num tracking-tight ${
                    comparison.isOverload
                      ? isLight ? 'text-lime-700' : 'text-[#D4FF00]'
                      : isLight ? 'text-rose-600' : 'text-[#FF3B56]'
                  }`}
                >
                  {comparison.volumeDelta > 0
                    ? `+${comparison.volumeDelta.toLocaleString()}`
                    : comparison.volumeDelta.toLocaleString()}
                </span>
                <span className={`text-sm font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>kg</span>
              </div>
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                  comparison.isOverload
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : 'bg-[#FF3B56] text-white shadow-sm'
                }`}
              >
                {comparison.isOverload ? (
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                )}
                <span>
                  {comparison.percentDelta > 0
                    ? `+${comparison.percentDelta.toFixed(1)}%`
                    : `${comparison.percentDelta.toFixed(1)}%`}
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${isLight ? 'border-slate-200' : 'border-[#1F1F2A]'}`}>
            {comparison.isOverload ? (
              <div className={`flex items-center gap-1.5 text-xs font-black ${isLight ? 'text-lime-800' : 'text-[#D4FF00]'}`}>
                <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`} />
                <span>점진적 과부하 달성! (근성장 자극 성공)</span>
              </div>
            ) : (
              <div className={`flex items-center gap-1.5 text-xs font-black ${isLight ? 'text-rose-700' : 'text-[#FF3B56]'}`}>
                <AlertCircle className="w-4 h-4 text-[#FF3B56] flex-shrink-0" />
                <span>볼륨 유지 또는 디로딩(회복) 구간</span>
              </div>
            )}
            {comparison.isOverload && (
              <button
                onClick={triggerCelebrate}
                className={`text-xs px-2.5 py-1 rounded-xl font-black border transition-all flex items-center gap-1 flex-shrink-0 ${
                  isLight
                    ? 'bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100'
                    : 'bg-[#D4FF00]/15 hover:bg-[#D4FF00]/25 text-[#D4FF00] border-[#D4FF00]/30'
                }`}
              >
                🎉 축하
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bars Comparison */}
        <div
          className={`${isMobileView ? '' : 'md:col-span-7'} border rounded-2xl p-4 flex flex-col justify-center gap-3.5 transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'
          }`}
        >
          {/* Current Session Bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className={`font-extrabold flex items-center gap-1.5 truncate max-w-[200px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isLight ? 'bg-lime-600' : 'bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]'}`} />
                이번 세션 ({currentSession.date.slice(5)})
              </span>
              <span className={`font-mono-num font-black text-sm ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
                {VolumeService.formatKg(comparison.currentVolume)}
              </span>
            </div>
            <div className={`h-3.5 w-full rounded-full overflow-hidden p-0.5 border ${
              isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#181820] border-[#23232D]'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isLight
                    ? 'bg-gradient-to-r from-lime-500 to-green-600'
                    : 'bg-gradient-to-r from-[#A3E635] to-[#D4FF00] shadow-[0_0_10px_rgba(212,255,0,0.5)]'
                }`}
                style={{ width: `${currBarWidth}%` }}
              />
            </div>
          </div>

          {/* Previous Session Bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className={`font-bold flex items-center gap-1.5 truncate max-w-[200px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isLight ? 'bg-slate-400' : 'bg-slate-600'}`} />
                지난 세션 ({previousSession.date.slice(5)})
              </span>
              <span className={`font-mono-num font-bold text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                {VolumeService.formatKg(comparison.previousVolume)}
              </span>
            </div>
            <div className={`h-3.5 w-full rounded-full overflow-hidden p-0.5 border ${
              isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#181820] border-[#23232D]'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${isLight ? 'bg-slate-400' : 'bg-slate-600'}`}
                style={{ width: `${prevBarWidth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exercise-by-Exercise Breakdown */}
      <div>
        <h3 className={`text-xs font-black uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          종목별 세부 볼륨 증감 내역
        </h3>

        <div className={`grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-2.5`}>
          {comparison.exerciseDiffs.map(ex => (
            <div
              key={ex.exerciseName}
              className={`border rounded-xl p-3 transition-all ${
                isLight
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm'
                  : 'bg-[#0A0A0E] border-[#23232D] hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center gap-2 mb-2">
                <span className={`font-extrabold text-xs sm:text-sm truncate max-w-[200px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {ex.exerciseName}
                </span>
                <span
                  className={`text-xs font-black font-mono-num px-2 py-0.5 rounded-full flex-shrink-0 ${
                    ex.diff > 0
                      ? 'bg-[#D4FF00] text-black shadow-sm'
                      : ex.diff < 0
                      ? 'bg-[#FF3B56] text-white shadow-sm'
                      : isLight ? 'bg-slate-200 text-slate-700' : 'bg-[#181820] text-slate-400'
                  }`}
                >
                  {ex.diff > 0 ? `+${ex.diff} kg` : `${ex.diff} kg`}
                </span>
              </div>

              <div className={`flex items-center justify-between text-[11px] pt-1.5 border-t ${isLight ? 'border-slate-200 text-slate-500' : 'border-[#1F1F2A] text-slate-400'}`}>
                <span>지난번: <strong className={`font-mono-num ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{VolumeService.formatKg(ex.prevVol)}</strong></span>
                <span className={isLight ? 'text-slate-400 font-bold' : 'text-slate-600 font-bold'}>→</span>
                <span>이번: <strong className={`font-mono-num ${isLight ? 'text-lime-700 font-bold' : 'text-[#D4FF00]'}`}>{VolumeService.formatKg(ex.currVol)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

