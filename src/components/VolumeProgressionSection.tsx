import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { ArrowUpRight, ArrowDownRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VolumeProgressionSectionProps {
  workouts: WorkoutSession[];
  isMobileView?: boolean;
}

export const VolumeProgressionSection: React.FC<VolumeProgressionSectionProps> = ({
  workouts,
  isMobileView = false,
}) => {
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
      <div className="bg-[#121217] border border-[#23232D] rounded-3xl p-5 text-center text-slate-300">
        <Zap className="w-8 h-8 mx-auto mb-2 text-[#FFB703] opacity-80" />
        <p className="text-sm font-black text-white">볼륨 비교를 위해 최소 2개 이상의 운동 기록이 필요합니다.</p>
        <p className="text-xs text-slate-400 mt-1">상단 "샘플 로드"를 누르면 즉시 이전 세션 대비 볼륨 변화를 확인할 수 있습니다.</p>
      </div>
    );
  }

  const maxCompareVol = Math.max(comparison.currentVolume, comparison.previousVolume, 1);
  const currBarWidth = Math.min(100, Math.round((comparison.currentVolume / maxCompareVol) * 100));
  const prevBarWidth = Math.min(100, Math.round((comparison.previousVolume / maxCompareVol) * 100));

  return (
    <div className="bg-[#121217] border border-[#23232D] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Subtle Glow */}
      {comparison.isOverload && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4FF00]/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header */}
      <div className={`flex ${isMobileView ? 'flex-col' : 'flex-col sm:flex-row sm:items-center'} justify-between gap-3 mb-5 relative z-10`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-[#D4FF00]" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              지난번 대비 총 볼륨 증감 비교
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            점진적 과부하(Progressive Overload) 달성 여부를 직관적으로 검증합니다.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 self-start bg-[#0A0A0E] p-1 rounded-xl border border-[#23232D]">
          <button
            onClick={() => setFilterSameRoutine(true)}
            className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
              filterSameRoutine
                ? 'bg-[#D4FF00] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            동일 부위 비교
          </button>
          <button
            onClick={() => setFilterSameRoutine(false)}
            className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${
              !filterSameRoutine
                ? 'bg-[#D4FF00] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            직전 세션 비교
          </button>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className={`grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'} gap-4 mb-5 relative z-10`}>
        {/* Main Growth Metric Card */}
        <div className={`${isMobileView ? '' : 'md:col-span-5'} bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-4 flex flex-col justify-between`}>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">총 볼륨 성장률</span>
            <div className="flex items-baseline flex-wrap gap-2 mt-1.5">
              <span
                className={`text-2xl sm:text-3xl font-black font-mono-num tracking-tight ${
                  comparison.isOverload ? 'text-[#D4FF00]' : 'text-[#FF3B56]'
                }`}
              >
                {comparison.volumeDelta > 0
                  ? `+${comparison.volumeDelta.toLocaleString()}`
                  : comparison.volumeDelta.toLocaleString()}{' '}
                <span className="text-base font-bold text-slate-300">kg</span>
              </span>
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

          <div className="mt-4 pt-3 border-t border-[#1F1F2A] flex items-center justify-between gap-2">
            {comparison.isOverload ? (
              <div className="flex items-center gap-1.5 text-xs text-[#D4FF00] font-black">
                <CheckCircle2 className="w-4 h-4 text-[#D4FF00] flex-shrink-0" />
                <span>점진적 과부하 달성! (근성장 자극 성공)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#FF3B56] font-black">
                <AlertCircle className="w-4 h-4 text-[#FF3B56] flex-shrink-0" />
                <span>볼륨 유지 또는 디로딩(회복) 구간</span>
              </div>
            )}
            {comparison.isOverload && (
              <button
                onClick={triggerCelebrate}
                className="text-xs px-2.5 py-1 rounded-xl bg-[#D4FF00]/15 hover:bg-[#D4FF00]/25 text-[#D4FF00] font-black border border-[#D4FF00]/30 transition-all flex items-center gap-1 flex-shrink-0"
              >
                🎉 축하
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bars Comparison */}
        <div className={`${isMobileView ? '' : 'md:col-span-7'} bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-4 flex flex-col justify-center gap-3.5`}>
          {/* Current Session Bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-extrabold text-white flex items-center gap-1.5 truncate max-w-[200px]">
                <span className="w-2 h-2 rounded-full bg-[#D4FF00] flex-shrink-0 shadow-[0_0_6px_#D4FF00]" />
                이번 세션 ({currentSession.date.slice(5)})
              </span>
              <span className="font-mono-num font-black text-[#D4FF00] text-sm">
                {VolumeService.formatKg(comparison.currentVolume)}
              </span>
            </div>
            <div className="h-3.5 w-full bg-[#181820] rounded-full overflow-hidden p-0.5 border border-[#23232D]">
              <div
                className="h-full bg-gradient-to-r from-[#A3E635] to-[#D4FF00] rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(212,255,0,0.5)]"
                style={{ width: `${currBarWidth}%` }}
              />
            </div>
          </div>

          {/* Previous Session Bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-slate-400 flex items-center gap-1.5 truncate max-w-[200px]">
                <span className="w-2 h-2 rounded-full bg-slate-600 flex-shrink-0" />
                지난 세션 ({previousSession.date.slice(5)})
              </span>
              <span className="font-mono-num font-bold text-slate-300 text-sm">
                {VolumeService.formatKg(comparison.previousVolume)}
              </span>
            </div>
            <div className="h-3.5 w-full bg-[#181820] rounded-full overflow-hidden p-0.5 border border-[#23232D]">
              <div
                className="h-full bg-slate-600 rounded-full transition-all duration-700"
                style={{ width: `${prevBarWidth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exercise-by-Exercise Breakdown */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
          종목별 세부 볼륨 증감 내역
        </h3>

        <div className={`grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-2.5`}>
          {comparison.exerciseDiffs.map(ex => (
            <div
              key={ex.exerciseName}
              className="bg-[#0A0A0E] border border-[#23232D] rounded-xl p-3 hover:border-slate-600 transition-all"
            >
              <div className="flex justify-between items-center gap-2 mb-2">
                <span className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[200px]">
                  {ex.exerciseName}
                </span>
                <span
                  className={`text-xs font-black font-mono-num px-2 py-0.5 rounded-full flex-shrink-0 ${
                    ex.diff > 0
                      ? 'bg-[#D4FF00] text-black shadow-sm'
                      : ex.diff < 0
                      ? 'bg-[#FF3B56] text-white shadow-sm'
                      : 'bg-[#181820] text-slate-400'
                  }`}
                >
                  {ex.diff > 0 ? `+${ex.diff} kg` : `${ex.diff} kg`}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-[#1F1F2A]">
                <span>지난번: <strong className="text-slate-300 font-mono-num">{VolumeService.formatKg(ex.prevVol)}</strong></span>
                <span className="text-slate-600 font-bold">→</span>
                <span>이번: <strong className="text-[#D4FF00] font-mono-num">{VolumeService.formatKg(ex.currVol)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
