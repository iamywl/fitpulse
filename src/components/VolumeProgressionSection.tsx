import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { ArrowUpRight, ArrowDownRight, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { TdsBadge } from './tds/TdsBadge';
import { TdsButton } from './tds/TdsButton';
import confetti from 'canvas-confetti';

interface VolumeProgressionSectionProps {
  workouts: WorkoutSession[];
  onLoadSampleData?: () => void;
  isMobileView?: boolean;
  themeMode?: 'dark' | 'light';
}

export const VolumeProgressionSection: React.FC<VolumeProgressionSectionProps> = ({
  workouts,
  onLoadSampleData,
  isMobileView = false,
  themeMode = 'light',
}) => {
  const isDark = themeMode === 'dark';
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
      colors: ['#3182F6', '#00BFA5', '#00C73C', '#FF9F00']
    });
  };

  if (!currentSession || !previousSession || !comparison) {
    return (
      <div
        className={`rounded-3xl p-6 text-center transition-all ${
          isDark
            ? 'bg-[#1C1C1E] border border-[#2C2C2E] text-white'
            : 'bg-white border border-slate-200 shadow-sm text-[#191F28]'
        }`}
      >
        <Zap className="w-8 h-8 mx-auto mb-2 text-[#3182F6]" />
        <p className="text-sm font-black">
          성장 분석을 위해 최소 2개 이상의 운동 기록이 필요해요
        </p>
        <p className={`text-xs mt-1 mb-4 max-w-md mx-auto ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
          오늘 운동을 완료하거나, 아래 버튼을 눌러 점진적 과부하 리포트를 바로 체험해 보세요.
        </p>
        {onLoadSampleData && (
          <TdsButton size="small" variant="weak" isDark={isDark} onClick={onLoadSampleData}>
            샘플 데이터로 둘러보기
          </TdsButton>
        )}
      </div>
    );
  }

  const maxCompareVol = Math.max(comparison.currentVolume, comparison.previousVolume, 1);
  const currBarWidth = Math.min(100, Math.round((comparison.currentVolume / maxCompareVol) * 100));
  const prevBarWidth = Math.min(100, Math.round((comparison.previousVolume / maxCompareVol) * 100));

  return (
    <div
      className={`rounded-3xl p-4 sm:p-6 transition-all ${
        isDark
          ? 'bg-[#1C1C1E] border border-[#2C2C2E] text-white'
          : 'bg-white border border-slate-200 shadow-sm text-[#191F28]'
      }`}
    >
      {/* Header */}
      <div className={`flex ${isMobileView ? 'flex-col' : 'flex-col sm:flex-row sm:items-center'} justify-between gap-3 mb-5`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-[#3182F6]" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {comparison.isOverload
                ? `지난번보다 ${comparison.percentDelta.toFixed(1)}% 더 들었어요! 대단해요 👏`
                : `지난번보다 조금 덜 들었지만 충분히 잘하셨어요`}
            </h2>
          </div>
          <p className={`text-xs ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
            직전 세션 대비 무게와 반복수를 비교하여 과부하를 측정해요
          </p>
        </div>

        {/* Filter Toggle */}
        <div
          className={`flex items-center gap-1 self-start p-1 rounded-2xl transition-colors ${
            isDark ? 'bg-[#101012] border border-[#2C2C2E]' : 'bg-[#F2F4F6]'
          }`}
        >
          <button
            onClick={() => setFilterSameRoutine(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterSameRoutine
                ? isDark
                  ? 'bg-[#2C2D33] text-white shadow-sm font-black'
                  : 'bg-white text-[#191F28] shadow-sm font-black'
                : isDark
                ? 'text-[#8B95A1] hover:text-white'
                : 'text-[#6B7684] hover:text-[#191F28]'
            }`}
          >
            동일 부위 비교
          </button>
          <button
            onClick={() => setFilterSameRoutine(false)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              !filterSameRoutine
                ? isDark
                  ? 'bg-[#2C2D33] text-white shadow-sm font-black'
                  : 'bg-white text-[#191F28] shadow-sm font-black'
                : isDark
                ? 'text-[#8B95A1] hover:text-white'
                : 'text-[#6B7684] hover:text-[#191F28]'
            }`}
          >
            직전 세션 비교
          </button>
        </div>
      </div>

      {/* Hero Stats Card */}
      <div className={`grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'} gap-4 mb-5`}>
        {/* Main Growth Metric Card */}
        <div
          className={`${isMobileView ? '' : 'md:col-span-5'} rounded-2xl p-4 flex flex-col justify-between transition-colors ${
            isDark ? 'bg-[#101012] border border-[#2C2C2E]' : 'bg-[#F2F4F6] border border-slate-200'
          }`}
        >
          <div>
            <span className={`text-xs font-semibold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
              볼륨 성장량
            </span>
            <div className="flex items-baseline flex-wrap gap-2 mt-1.5">
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono-num tracking-tight ${
                    comparison.isOverload ? 'text-[#00C73C]' : 'text-[#F04452]'
                  }`}
                >
                  {comparison.volumeDelta > 0
                    ? `+${comparison.volumeDelta.toLocaleString()}`
                    : comparison.volumeDelta.toLocaleString()}
                </span>
                <span className={`text-sm font-bold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>kg</span>
              </div>
              <TdsBadge
                size="small"
                variant="fill"
                color={comparison.isOverload ? 'green' : 'red'}
                icon={comparison.isOverload ? <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" /> : <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />}
              >
                {comparison.percentDelta > 0
                  ? `+${comparison.percentDelta.toFixed(1)}%`
                  : `${comparison.percentDelta.toFixed(1)}%`}
              </TdsBadge>
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${
            isDark ? 'border-[#2C2C2E]' : 'border-slate-200'
          }`}>
            {comparison.isOverload ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00C73C]">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#00C73C]" />
                <span>점진적 과부하 달성!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F04452]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#F04452]" />
                <span>볼륨 유지 또는 디로드 구간</span>
              </div>
            )}
            {comparison.isOverload && (
              <TdsButton size="small" variant="weak" isDark={isDark} onClick={triggerCelebrate}>
                🎉 축하하기
              </TdsButton>
            )}
          </div>
        </div>

        {/* Visual Progress Bars Comparison */}
        <div
          className={`${isMobileView ? '' : 'md:col-span-7'} rounded-2xl p-4 flex flex-col justify-center gap-4 transition-colors ${
            isDark ? 'bg-[#101012] border border-[#2C2C2E]' : 'bg-[#F2F4F6] border border-slate-200'
          }`}
        >
          {/* Current Session Bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold flex items-center gap-1.5 truncate max-w-[200px]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3182F6]" />
                이번 운동 ({currentSession.date.slice(5)})
              </span>
              <span className="font-mono-num font-black text-sm text-[#3182F6]">
                {VolumeService.formatKg(comparison.currentVolume)}
              </span>
            </div>
            <div className={`h-3 w-full rounded-full overflow-hidden ${
              isDark ? 'bg-[#2C2C2E]' : 'bg-white'
            }`}>
              <div
                className="h-full rounded-full bg-[#3182F6] transition-all duration-700"
                style={{ width: `${currBarWidth}%` }}
              />
            </div>
          </div>

          {/* Previous Session Bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className={`font-medium flex items-center gap-1.5 truncate max-w-[200px] ${
                isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#6B7684]' : 'bg-slate-400'}`} />
                지난 운동 ({previousSession.date.slice(5)})
              </span>
              <span className="font-mono-num font-bold text-sm">
                {VolumeService.formatKg(comparison.previousVolume)}
              </span>
            </div>
            <div className={`h-3 w-full rounded-full overflow-hidden ${
              isDark ? 'bg-[#2C2C2E]' : 'bg-white'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isDark ? 'bg-[#6B7684]' : 'bg-slate-400'
                }`}
                style={{ width: `${prevBarWidth}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exercise-by-Exercise Breakdown */}
      <div>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
          종목별 세부 증감 내역
        </h3>

        <div className={`grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-2.5`}>
          {comparison.exerciseDiffs.map(ex => (
            <div
              key={ex.exerciseName}
              className={`rounded-2xl p-3.5 border transition-all ${
                isDark
                  ? 'bg-[#101012] border-[#2C2C2E]'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center gap-2 mb-2">
                <span className="font-bold text-sm truncate max-w-[180px]">
                  {ex.exerciseName}
                </span>
                <TdsBadge
                  size="small"
                  variant={ex.diff !== 0 ? 'fill' : 'weak'}
                  color={ex.diff > 0 ? 'green' : ex.diff < 0 ? 'red' : 'elephant'}
                  isDark={isDark}
                >
                  {ex.diff > 0 ? `+${ex.diff} kg` : `${ex.diff} kg`}
                </TdsBadge>
              </div>

              <div className={`flex items-center justify-between text-xs pt-2 border-t ${
                isDark ? 'border-[#2C2C2E] text-[#8B95A1]' : 'border-slate-100 text-[#6B7684]'
              }`}>
                <span>지난번: <strong className="font-mono-num">{VolumeService.formatKg(ex.prevVol)}</strong></span>
                <span className="text-[#8B95A1]">→</span>
                <span>이번: <strong className={`font-mono-num ${ex.diff >= 0 ? 'text-[#00C73C]' : 'text-[#F04452]'}`}>{VolumeService.formatKg(ex.currVol)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
