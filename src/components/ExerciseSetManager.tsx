import React, { useState } from 'react';
import { IExerciseLog, IExerciseSet, WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { Plus, Trash2, Dumbbell, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

import { ThemeMode } from '../theme/pantone';

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

  const currentExercise = EXERCISE_OPTIONS.find(e => e.id === selectedExId) || EXERCISE_OPTIONS[0];

  const exerciseVolume = sets.reduce((sum, s) => s.completed ? sum + s.weight * s.reps : sum, 0);
  const best1RM = sets.reduce((max, s) => {
    if (!s.completed) return max;
    const est = VolumeService.estimate1RM(s.weight, s.reps);
    return est > max ? est : max;
  }, 0);

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
    setSets(prev => prev.map(s => {
      if (s.id !== setId) return s;
      return { ...s, completed: !s.completed };
    }));
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
      colors: ['#D4FF00', '#38BDF8', '#FFFFFF']
    });
  };

  return (
    <div
      className={`border rounded-3xl p-4 sm:p-6 shadow-xl relative transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-100'
          : 'bg-[#121217] border-[#272732] text-white shadow-2xl'
      }`}
    >
      {/* Header */}
      <div className={`flex ${isMobileView ? 'flex-col gap-2.5' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} mb-4`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className={`w-5 h-5 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`} />
            <h2 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              종목별 세트 & 반복수(Reps) 간편 기록
            </h2>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            종목별로 무게(kg)와 반복횟수를 직접 입력하고 즉시 잔디와 볼륨에 반영합니다.
          </p>
        </div>

        {/* Exercise Selector */}
        <select
          value={selectedExId}
          onChange={(e) => setSelectedExId(e.target.value)}
          className={`text-xs sm:text-sm font-black rounded-xl px-3 py-2 outline-none cursor-pointer border transition-colors ${
            isLight
              ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-lime-600'
              : 'bg-[#0A0A0E] border-[#23232D] text-white focus:border-[#D4FF00]'
          }`}
        >
          {EXERCISE_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.name} ({opt.category})
            </option>
          ))}
        </select>
      </div>

      {/* Summary Badges: High Contrast & Equal Proportions */}
      <div
        className={`grid grid-cols-3 gap-2.5 p-3 rounded-2xl mb-4 border transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'
        }`}
      >
        <div>
          <div className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>종목 총 볼륨</div>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-base font-black font-mono-num ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
              {VolumeService.formatKg(exerciseVolume)}
            </span>
          </div>
        </div>
        <div>
          <div className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>최고 추정 1RM</div>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-base font-black font-mono-num ${isLight ? 'text-sky-700' : 'text-[#38BDF8]'}`}>
              {best1RM}
            </span>
            <span className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>kg</span>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div
            className={`text-xs font-bold px-2.5 py-1 rounded-xl border text-center ${
              isLight
                ? 'bg-white text-slate-700 border-slate-200 shadow-sm'
                : 'bg-[#181820] text-slate-300 border-[#23232D]'
            }`}
          >
            완료: <strong className={`font-mono-num ${isLight ? 'text-slate-900' : 'text-white'}`}>{sets.filter(s => s.completed).length}</strong> / {sets.length}
          </div>
        </div>
      </div>

      {/* Sets Table / Cards */}
      <div className="space-y-2.5 mb-4">
        {sets.map((set) => (
          <div
            key={set.id}
            className={`border rounded-2xl p-3 sm:p-3.5 transition-all ${
              set.completed
                ? isLight
                  ? 'bg-white border-lime-400/60 ring-1 ring-lime-500/20 shadow-sm'
                  : 'bg-[#0A0A0E] border-[#D4FF00]/40 ring-1 ring-[#D4FF00]/15'
                : isLight
                ? 'bg-slate-50 border-slate-200 opacity-70'
                : 'bg-[#0A0A0E] border-[#23232D] opacity-65'
            }`}
          >
            {/* Top row: Set # & Quick +/- Chips (min-h-[34px] for ergonomic thumb tap) */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                    set.completed
                      ? 'bg-[#D4FF00] text-black shadow-sm'
                      : isLight ? 'bg-slate-200 text-slate-600' : 'bg-[#181820] text-slate-400'
                  }`}
                >
                  #{set.setNumber}
                </span>
                <span className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {set.isWarmup ? '웜업 세트' : '본세트'}
                </span>
              </div>

              {/* Weight Quick Buttons (High-contrast, expanded touch area) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(set.id, -2.5)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-[#181820] hover:bg-[#23232D] text-slate-300 hover:text-white border-[#23232D]'
                  }`}
                >
                  -2.5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(set.id, 2.5)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                    isLight
                      ? 'bg-lime-50 hover:bg-lime-100 text-lime-800 border-lime-300'
                      : 'bg-[#181820] hover:bg-[#23232D] text-[#D4FF00] border-[#23232D]'
                  }`}
                >
                  +2.5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(set.id, 5)}
                  className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-black border transition-all ${
                    isLight
                      ? 'bg-lime-50 hover:bg-lime-100 text-lime-800 border-lime-300'
                      : 'bg-[#181820] hover:bg-[#23232D] text-[#D4FF00] border-[#23232D]'
                  }`}
                >
                  +5
                </button>
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

            {/* Inputs Grid: Weight (5) & Reps (4) & Complete (3) */}
            <div className="grid grid-cols-12 gap-2 items-center">
              {/* Weight Input (5 cols) */}
              <div className="col-span-5">
                <div className={`text-[10px] font-black mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  무게 (kg)
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
                    className={`w-full border rounded-xl px-2.5 py-1.5 text-sm font-black font-mono-num outline-none transition-colors ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-lime-600'
                        : 'bg-[#181820] border-[#23232D] text-white focus:border-[#D4FF00]'
                    }`}
                  />
                  <span className={`absolute right-2 top-1.5 text-xs font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    kg
                  </span>
                </div>
              </div>

              {/* Reps Input with Stepper (4 cols) */}
              <div className="col-span-4">
                <div className={`text-[10px] font-black mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  반복 (회)
                </div>
                <div
                  className={`flex items-center border rounded-xl overflow-hidden ${
                    isLight ? 'bg-white border-slate-300' : 'bg-[#181820] border-[#23232D]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleAdjustReps(set.id, -1)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-black transition-colors ${
                      isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#121217] text-slate-400 hover:text-white'
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
                    className={`w-full text-center bg-transparent text-sm font-black font-mono-num outline-none py-1 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustReps(set.id, 1)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-black transition-colors ${
                      isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#121217] text-slate-400 hover:text-white'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Complete Toggle Checkmark (3 cols) */}
              <div className="col-span-3 flex flex-col items-center justify-center">
                <div className={`text-[10px] font-black mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  완료
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleComplete(set.id)}
                  className={`w-full max-w-[54px] h-8 rounded-xl flex items-center justify-center transition-all ${
                    set.completed
                      ? 'bg-[#D4FF00] text-black shadow-md shadow-[#D4FF00]/25'
                      : isLight
                      ? 'bg-slate-100 border border-slate-300 text-slate-400 hover:border-slate-400'
                      : 'bg-[#181820] border border-[#23232D] text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons: Add Set & Save to Today's Workout */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <button
          type="button"
          onClick={handleAddSet}
          className={`w-full sm:flex-1 py-2.5 rounded-xl border border-dashed text-xs font-black transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
            isLight
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 hover:border-lime-500'
              : 'bg-[#0A0A0E] hover:bg-[#181820] border-[#23232D] hover:border-[#D4FF00]/50 text-slate-300 hover:text-[#D4FF00]'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>세트 추가 (+Set)</span>
        </button>

        <button
          type="button"
          onClick={handleSaveToToday}
          className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#D4FF00] hover:bg-[#C2EB00] text-black text-xs sm:text-sm font-black shadow-md shadow-[#D4FF00]/25 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[42px]"
        >
          <Sparkles className="w-4 h-4" />
          <span>오늘 운동 기록에 즉시 저장</span>
        </button>
      </div>
    </div>
  );
};

