import React, { useState } from 'react';
import { IExerciseLog, IExerciseSet, WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { ProgressionRecommendationService } from '../services/calculator/ProgressionRecommendationService';
import { Plus, Trash2, Dumbbell, Sparkles, Check, Zap, ArrowUpRight, Disc } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ThemeMode } from '../theme/pantone';
import { AudioAlertService } from '../services/sound/AudioAlertService';
import { RestTimerModal } from './RestTimerModal';
import { BarbellPlateModal } from './BarbellPlateModal';
import { TdsBadge, TdsButton } from './tds';

const RPE_OPTIONS = [6, 7, 8, 9, 10];

interface ExerciseSetManagerProps {
  workouts: WorkoutSession[];
  onSaveExerciseSets: (session: WorkoutSession) => void;
  isMobileView?: boolean;
  themeMode?: ThemeMode;
  selectedExerciseOverride?: {
    exerciseId: string;
    exerciseName: string;
    category: any;
    targetWeight: number;
    targetReps: number;
  } | null;
}

const EXERCISE_OPTIONS = [
  { id: 'bench-press', name: '바벨 벤치프레스', category: 'chest' as const },
  { id: 'squat', name: '바벨 백스쿼트', category: 'legs' as const },
  { id: 'deadlift', name: '컨벤셔널 데드리프트', category: 'back' as const },
  { id: 'ohp', name: '오버헤드 프레스 (OHP)', category: 'shoulders' as const },
  { id: 'barbell-row', name: '바벨 로우', category: 'back' as const },
  { id: 'incline-db-press', name: '인클라인 덤벨 프레스', category: 'chest' as const },
  { id: 'lat-pulldown', name: '랫 풀다운', category: 'back' as const },
];

export const ExerciseSetManager: React.FC<ExerciseSetManagerProps> = ({
  workouts,
  onSaveExerciseSets,
  isMobileView = false,
  themeMode = 'dark',
  selectedExerciseOverride,
}) => {
  const isLight = themeMode === 'light';

  const [selectedExId, setSelectedExId] = useState<string>(
    selectedExerciseOverride?.exerciseId || 'bench-press'
  );

  // 현재 종목 세트 상태
  const [sets, setSets] = useState<IExerciseSet[]>([
    { id: 'set-1', setNumber: 1, weight: 60, reps: 10, completed: true, isWarmup: true },
    { id: 'set-2', setNumber: 2, weight: 70, reps: 8, completed: true },
    { id: 'set-3', setNumber: 3, weight: 75, reps: 6, completed: true },
    { id: 'set-4', setNumber: 4, weight: 80, reps: 5, completed: true },
  ]);

  // Rest Timer Modal state
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialTimerOpen = queryParams?.get('timer') === 'true';
  const [isRestTimerOpen, setIsRestTimerOpen] = useState<boolean>(initialTimerOpen);
  const [completedSetForTimer, setCompletedSetForTimer] = useState<number>(1);
  const [restSecondsDuration, setRestSecondsDuration] = useState<number>(90);

  // Barbell Plate Calculator Modal state
  const [isPlateModalOpen, setIsPlateModalOpen] = useState<boolean>(false);
  const [plateModalWeight, setPlateModalWeight] = useState<number>(80);
  const [targetSetIdForPlate, setTargetSetIdForPlate] = useState<string | null>(null);

  const currentExercise = EXERCISE_OPTIONS.find(e => e.id === selectedExId) || EXERCISE_OPTIONS[0];

  const exerciseVolume = sets.reduce((sum, s) => s.completed ? sum + s.weight * s.reps : sum, 0);
  const best1RM = sets.reduce((max, s) => {
    if (!s.completed) return max;
    const est = VolumeService.estimate1RM(s.weight, s.reps);
    return est > max ? est : max;
  }, 0);

  const avgRPE = VolumeService.getAverageRPE(sets);

  // 실시간 점진적 과부하 및 피로도 기반 다음 세트 스마트 추천
  const nextRecommendation = ProgressionRecommendationService.getNextRecommendation({
    exerciseId: currentExercise.id,
    exerciseName: currentExercise.name,
    category: currentExercise.category,
    currentSets: sets,
    pastWorkouts: workouts,
  });

  const handleAddSet = () => {
    const last = sets[sets.length - 1];
    const newSet: IExerciseSet = {
      id: `set-${Date.now()}`,
      setNumber: sets.length + 1,
      weight: last ? last.weight : 60,
      reps: last ? last.reps : 8,
      completed: true,
    };
    setSets(prev => [...prev, newSet]);
  };

  // AI 추천 무게/횟수로 새 세트 추가
  const handleAddRecommendedSet = () => {
    const newSet: IExerciseSet = {
      id: `set-${Date.now()}`,
      setNumber: sets.length + 1,
      weight: nextRecommendation.targetWeight,
      reps: nextRecommendation.targetReps,
      completed: false, // 바로 수행할 수 있도록 미완료 상태로 추가
    };
    setSets(prev => [...prev, newSet]);
  };

  // 미완료 세트가 있을 경우 추천값 즉시 적용
  const handleApplyRecommendationToTarget = (setId: string) => {
    setSets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return {
        ...s,
        weight: nextRecommendation.targetWeight,
        reps: nextRecommendation.targetReps,
      };
    }));
  };

  const handleRemoveSet = (setId: string) => {
    if (sets.length <= 1) return;
    setSets(prev => prev.filter(s => s.id !== setId).map((s, idx) => ({ ...s, setNumber: idx + 1 })));
  };

  const handleAdjustWeight = (setId: string, delta: number) => {
    setSets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return { ...s, weight: Math.max(0, Math.round((s.weight + delta) * 10) / 10) };
    }));
  };

  const handleAdjustReps = (setId: string, delta: number) => {
    setSets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return { ...s, reps: Math.max(1, s.reps + delta) };
    }));
  };

  const handleToggleComplete = (setId: string) => {
    const targetSet = sets.find(s => s.id === setId);
    const willBeCompleted = targetSet ? !targetSet.completed : false;

    setSets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return { ...s, completed: willBeCompleted };
    }));

    if (willBeCompleted && targetSet) {
      AudioAlertService.playSetComplete();
      setCompletedSetForTimer(targetSet.setNumber);
      // 추천 알고리즘의 권장 휴식시간으로 타이머 자동 세팅
      setRestSecondsDuration(nextRecommendation.recommendedRestSeconds);
      setIsRestTimerOpen(true);
    }
  };

  const handleSetRPE = (setId: string, rpe: number) => {
    setSets(prev => prev.map(s =>
      s.id === setId ? { ...s, rpe: s.rpe === rpe ? undefined : rpe } : s
    ));
  };

  const handleSaveToToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySession = workouts.find(w => w.date === todayStr);

    const exerciseLog: IExerciseLog = {
      id: `ex-${Date.now()}`,
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      category: currentExercise.category,
      sets,
    };

    let updatedSession: WorkoutSession;

    if (todaySession) {
      const filtered = todaySession.exercises.filter(e => e.exerciseId !== currentExercise.id);
      const newExercises = [...filtered, exerciseLog];
      updatedSession = {
        ...todaySession,
        exercises: newExercises,
        totalVolume: VolumeService.calculateSessionVolume(newExercises),
      };
    } else {
      updatedSession = {
        id: `workout-${Date.now()}`,
        date: todayStr,
        title: `${currentExercise.name} 집중 세션`,
        durationMinutes: 60,
        exercises: [exerciseLog],
        totalVolume: exerciseVolume,
      };
    }

    onSaveExerciseSets(updatedSession);
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#3182F6', '#00BFA5', '#FFFFFF']
    });
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-7 shadow-sm transition-colors border ${
        isLight
          ? 'bg-white border-slate-100 text-slate-900 shadow-slate-200/50'
          : 'bg-[#1C1C1E] border-[#2C2C2E] text-white'
      }`}
    >
      {/* Header */}
      <div className={`flex ${isMobileView ? 'flex-col gap-3' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} mb-5`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-[#3182F6]" />
          </div>
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            세트 기록하기
          </h2>
        </div>

        {/* Exercise Selector */}
        <select
          value={selectedExId}
          onChange={(e) => setSelectedExId(e.target.value)}
          className={`text-xs sm:text-sm font-bold rounded-xl px-3.5 py-2.5 outline-none cursor-pointer border transition-all ${
            isLight
              ? 'bg-[#F2F4F6] border-transparent text-slate-900 focus:bg-white focus:border-[#3182F6]'
              : 'bg-[#252528] border-transparent text-white focus:border-[#3182F6]'
          }`}
        >
          {EXERCISE_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.name} ({opt.category})
            </option>
          ))}
        </select>
      </div>

      {/* Summary Badges */}
      <div
        className={`grid grid-cols-4 gap-3 p-4 rounded-2xl mb-5 transition-colors border ${
          isLight ? 'bg-[#F8F9FA] border-slate-100' : 'bg-[#252528] border-transparent'
        }`}
      >
        <div>
          <div className="text-xs text-slate-400 mb-1">종목 총 볼륨</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono-num text-[#3182F6]">
              {VolumeService.formatKg(exerciseVolume)}
            </span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">추정 1RM</div>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold font-mono-num ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {best1RM}
            </span>
            <span className="text-xs text-slate-400">kg</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">평균 RPE</div>
          <div className="flex items-baseline gap-1">
            {avgRPE !== null ? (
              <>
                <span className={`text-lg font-bold font-mono-num ${
                  avgRPE >= 9 ? 'text-rose-500' : avgRPE >= 8 ? 'text-amber-500' : 'text-[#3182F6]'
                }`}>
                  {avgRPE}
                </span>
                <span className="text-xs text-slate-400">/ 10</span>
              </>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <TdsBadge variant="weak" color="blue" size="medium">
            완료 {sets.filter(s => s.completed).length} / {sets.length}
          </TdsBadge>
        </div>
      </div>

      {/* FitPulse AI 스마트 다음 세트 & 쉬는시간 추천 카드 */}
      <div
        className={`p-4 sm:p-5 rounded-2xl mb-5 border transition-all ${
          isLight
            ? 'bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 border-blue-100 shadow-sm'
            : 'bg-gradient-to-br from-[#202838] via-[#1C1C1E] to-[#1C1C1E] border-blue-500/20'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#3182F6]" />
            <span className="text-xs sm:text-sm font-bold text-[#3182F6]">
              볼륨 기반 스마트 세트 & 휴식 추천
            </span>
          </div>
          <TdsBadge
            variant="weak"
            color={
              nextRecommendation.statusBadge === 'overload'
                ? 'blue'
                : nextRecommendation.statusBadge === 'fatigue_care'
                ? 'red'
                : 'teal'
            }
            size="small"
          >
            {nextRecommendation.statusText}
          </TdsBadge>
        </div>

        {/* Target Specs Row */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl font-black font-mono-num text-[#3182F6]">
              {nextRecommendation.targetWeight} kg
            </span>
            <span className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
              × {nextRecommendation.targetReps} 회
            </span>
            <span className="text-xs font-semibold text-slate-400">
              (세트 볼륨 {VolumeService.formatKg(nextRecommendation.expectedSetVolume)})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              권장 휴식:
            </span>
            <span className="text-xs font-bold text-[#00BFA5] px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/30">
              ⏱ {nextRecommendation.restFormatted}
            </span>
          </div>
        </div>

        {/* Microcopy Reason */}
        <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-3.5 break-keep">
          {nextRecommendation.reason}
        </p>

        {/* 1-Tap Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleAddRecommendedSet}
            className="flex-1 min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 bg-[#3182F6] hover:bg-[#1B64DA] text-white shadow-sm active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>추천으로 다음 세트 추가</span>
          </button>

          {sets.some(s => !s.completed) && (
            <button
              type="button"
              onClick={() => {
                const target = sets.find(s => !s.completed);
                if (target) handleApplyRecommendationToTarget(target.id);
              }}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 active:scale-[0.98] transition-all border ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-[#252528] border-slate-700 text-slate-200 hover:bg-[#333D4B]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 text-[#3182F6]" />
              <span>미완료 세트에 반영</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setPlateModalWeight(nextRecommendation.targetWeight);
              setTargetSetIdForPlate(null);
              setIsPlateModalOpen(true);
            }}
            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all border ${
              isLight
                ? 'bg-white border-slate-200 text-[#3182F6] hover:bg-blue-50/50'
                : 'bg-[#252528] border-slate-700 text-[#5B9DF8] hover:bg-[#333D4B]'
            }`}
            title="추천 무게 원판 조합 확인"
          >
            <Disc className="w-4 h-4" />
            <span>원판 조합</span>
          </button>
        </div>
      </div>

      {/* Sets Cards */}
      <div className="space-y-3 mb-5">
        {sets.map((set) => (
          <div
            key={set.id}
            className={`rounded-2xl p-4 transition-all border ${
              set.completed
                ? isLight
                  ? 'bg-white border-blue-100 shadow-sm'
                  : 'bg-[#252528] border-transparent ring-1 ring-blue-500/20'
                : isLight
                ? 'bg-slate-50 border-slate-200 opacity-70'
                : 'bg-[#252528]/50 border-transparent opacity-60'
            }`}
          >
            {/* Top row: Set # & Quick +/- Chips */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    set.completed
                      ? 'bg-[#3182F6] text-white'
                      : isLight ? 'bg-slate-200 text-slate-600' : 'bg-[#1C1C1E] text-slate-400'
                  }`}
                >
                  #{set.setNumber}
                </span>
                <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {set.isWarmup ? '웜업 세트' : '본세트'}
                </span>
              </div>

              {/* Weight Quick Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(set.id, -2.5)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-[#1C1C1E] hover:bg-[#333D4B] text-slate-300'
                  }`}
                >
                  -2.5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(set.id, 2.5)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isLight
                      ? 'bg-blue-50 hover:bg-blue-100 text-[#3182F6]'
                      : 'bg-blue-950/40 hover:bg-blue-900/50 text-[#3182F6]'
                  }`}
                >
                  +2.5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(set.id, 5)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isLight
                      ? 'bg-blue-50 hover:bg-blue-100 text-[#3182F6]'
                      : 'bg-blue-950/40 hover:bg-blue-900/50 text-[#3182F6]'
                  }`}
                >
                  +5
                </button>

                {!set.completed && (
                  <button
                    type="button"
                    onClick={() => handleApplyRecommendationToTarget(set.id)}
                    className="min-h-[32px] px-2 py-1 rounded-lg text-xs font-bold transition-all bg-[#3182F6]/10 text-[#3182F6] hover:bg-[#3182F6] hover:text-white flex items-center gap-1"
                    title={`AI 추천값(${nextRecommendation.targetWeight}kg × ${nextRecommendation.targetReps}회) 적용`}
                  >
                    <Zap className="w-3 h-3" />
                    <span className="hidden xs:inline">추천</span>
                  </button>
                )}

                {sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSet(set.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 ml-1 rounded-lg"
                    aria-label="세트 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-12 gap-2.5 items-center">
              {/* Weight Input (5 cols) */}
              <div className="col-span-5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                  <span>무게 (kg)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPlateModalWeight(set.weight);
                      setTargetSetIdForPlate(set.id);
                      setIsPlateModalOpen(true);
                    }}
                    className="flex items-center gap-0.5 text-[#3182F6] hover:underline"
                    title="원판 조합 계산기 열기"
                  >
                    <Disc className="w-3 h-3" />
                    <span className="text-[10px]">원판</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={set.weight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setSets(prev => prev.map(s => s.id === set.id ? { ...s, weight: val } : s));
                    }}
                    className={`w-full border rounded-xl px-3 py-2 text-sm font-bold font-mono-num outline-none transition-all ${
                      isLight
                        ? 'bg-[#F2F4F6] border-transparent text-slate-900 focus:bg-white focus:border-[#3182F6]'
                        : 'bg-[#1C1C1E] border-transparent text-white focus:border-[#3182F6]'
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">
                    kg
                  </span>
                </div>
              </div>

              {/* Reps Input (4 cols) */}
              <div className="col-span-4">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">
                  반복 (회)
                </div>
                <div
                  className={`flex items-center rounded-xl overflow-hidden ${
                    isLight ? 'bg-[#F2F4F6]' : 'bg-[#1C1C1E]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleAdjustReps(set.id, -1)}
                    className={`w-8 h-9 flex items-center justify-center text-xs font-bold transition-colors ${
                      isLight ? 'hover:bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setSets(prev => prev.map(s => s.id === set.id ? { ...s, reps: val } : s));
                    }}
                    className={`w-full text-center bg-transparent text-sm font-bold font-mono-num outline-none py-1.5 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustReps(set.id, 1)}
                    className={`w-8 h-9 flex items-center justify-center text-xs font-bold transition-colors ${
                      isLight ? 'hover:bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Complete Toggle Checkmark (3 cols) */}
              <div className="col-span-3 flex flex-col items-center justify-center">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">
                  완료
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleComplete(set.id)}
                  className={`w-full max-w-[54px] h-9 rounded-xl flex items-center justify-center transition-all ${
                    set.completed
                      ? 'bg-[#3182F6] text-white shadow-sm'
                      : isLight
                      ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      : 'bg-[#1C1C1E] text-slate-500 hover:text-white'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* RPE Quick-Chip Row — 세트 완료 후에만 표시 */}
            {set.completed && (
              <div className={`mt-3 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-[#333D4B]'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                    RPE
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    {RPE_OPTIONS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSetRPE(set.id, val)}
                        className={`min-w-[36px] min-h-[36px] rounded-xl text-xs font-bold transition-all ${
                          set.rpe === val
                            ? 'bg-[#3182F6] text-white shadow-sm scale-105'
                            : isLight
                            ? 'bg-[#F2F4F6] text-slate-500 hover:bg-slate-200'
                            : 'bg-[#1C1C1E] text-slate-400 hover:bg-[#333D4B] hover:text-white'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                    {set.rpe !== undefined && (
                      <span className={`text-[11px] font-medium ml-1 whitespace-nowrap ${
                        set.rpe >= 10 ? 'text-rose-500' :
                        set.rpe >= 8  ? 'text-amber-500' :
                        'text-[#3182F6]'
                      }`}>
                        {VolumeService.getRPEFeedback(set.rpe)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <TdsButton
          variant="secondary"
          size="medium"
          fullWidth
          onClick={handleAddSet}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4 text-[#3182F6]" />
            <span>세트 추가</span>
          </div>
        </TdsButton>

        <TdsButton
          variant="primary"
          size="medium"
          fullWidth
          onClick={handleSaveToToday}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>오늘 운동 기록에 저장</span>
          </div>
        </TdsButton>
      </div>

      <RestTimerModal
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        initialSeconds={restSecondsDuration}
        completedSetNumber={completedSetForTimer}
        exerciseName={currentExercise.name}
        themeMode={themeMode}
        recommendation={nextRecommendation}
      />

      <BarbellPlateModal
        isOpen={isPlateModalOpen}
        onClose={() => {
          setIsPlateModalOpen(false);
          setTargetSetIdForPlate(null);
        }}
        initialWeight={plateModalWeight}
        onApplyWeight={(newWeight) => {
          if (targetSetIdForPlate) {
            setSets(prev => prev.map(s => s.id === targetSetIdForPlate ? { ...s, weight: newWeight } : s));
          } else {
            // 미완료 세트가 있으면 거기에 적용, 없으면 새 세트로 추가
            const uncompleted = sets.find(s => !s.completed);
            if (uncompleted) {
              setSets(prev => prev.map(s => s.id === uncompleted.id ? { ...s, weight: newWeight } : s));
            } else {
              const last = sets[sets.length - 1];
              setSets(prev => [
                ...prev,
                {
                  id: `set-${Date.now()}`,
                  setNumber: sets.length + 1,
                  weight: newWeight,
                  reps: last ? last.reps : 8,
                  completed: false,
                }
              ]);
            }
          }
        }}
        themeMode={themeMode}
      />
    </div>
  );
};
