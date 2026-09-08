import React, { useState } from 'react';
import { IExerciseLog, IExerciseSet, WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { Plus, Trash2, Dumbbell, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExerciseSetManagerProps {
  workouts: WorkoutSession[];
  onSaveExerciseSets: (session: WorkoutSession) => void;
  isMobileView?: boolean;
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
  selectedExerciseOverride,
}) => {
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
    <div className="bg-[#121217] border border-[#23232D] rounded-3xl p-4 sm:p-6 shadow-2xl relative">
      {/* Header */}
      <div className={`flex ${isMobileView ? 'flex-col gap-2.5' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} mb-4`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-5 h-5 text-[#D4FF00]" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              종목별 세트 & 반복수(Reps) 간편 기록
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            종목별로 무게(kg)와 반복횟수를 직접 입력하고 즉시 잔디와 볼륨에 반영합니다.
          </p>
        </div>

        {/* Exercise Selector */}
        <select
          value={selectedExId}
          onChange={(e) => setSelectedExId(e.target.value)}
          className="bg-[#0A0A0E] border border-[#23232D] text-white text-xs sm:text-sm font-black rounded-xl px-3 py-2 outline-none focus:border-[#D4FF00] cursor-pointer shadow-inner"
        >
          {EXERCISE_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.name} ({opt.category})
            </option>
          ))}
        </select>
      </div>

      {/* Summary Badges: High Contrast */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-[#0A0A0E] border border-[#23232D] p-3 rounded-2xl mb-4">
        <div>
          <div className="text-[10px] font-bold text-slate-400">종목 총 볼륨</div>
          <div className="text-base font-black text-[#D4FF00] font-mono-num">
            {VolumeService.formatKg(exerciseVolume)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400">최고 추정 1RM</div>
          <div className="text-base font-black text-[#38BDF8] font-mono-num">
            {best1RM} kg
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
          <div className="text-xs font-bold text-slate-300 bg-[#181820] px-3 py-1 rounded-xl border border-[#23232D]">
            완료: <strong className="text-white font-mono-num">{sets.filter(s => s.completed).length}</strong> / {sets.length}세트
          </div>
        </div>
      </div>

      {/* Sets Table / Cards */}
      <div className="space-y-2.5 mb-4">
        {sets.map((set) => (
          <div
            key={set.id}
            className={`bg-[#0A0A0E] border rounded-2xl p-3 sm:p-3.5 transition-all ${
              set.completed ? 'border-[#D4FF00]/40 ring-1 ring-[#D4FF00]/15' : 'border-[#23232D] opacity-65'
            }`}
          >
            {/* Top row: Set # & Quick +/- Chips */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                  set.completed ? 'bg-[#D4FF00] text-black shadow-sm' : 'bg-[#181820] text-slate-400'
                }`}>
                  #{set.setNumber}
                </span>
                <span className="text-xs font-extrabold text-white">
                  {set.isWarmup ? '웜업 세트' : '본세트'}
                </span>
              </div>

              {/* Weight Quick Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(set.id, -2.5)}
                  className="px-2 py-0.5 rounded-lg bg-[#181820] hover:bg-[#23232D] text-[11px] font-black text-slate-300 hover:text-white border border-[#23232D]"
                >
                  -2.5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(set.id, 2.5)}
                  className="px-2 py-0.5 rounded-lg bg-[#181820] hover:bg-[#23232D] text-[11px] font-black text-[#D4FF00] border border-[#23232D]"
                >
                  +2.5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(set.id, 5)}
                  className="px-2 py-0.5 rounded-lg bg-[#181820] hover:bg-[#23232D] text-[11px] font-black text-[#D4FF00] border border-[#23232D]"
                >
                  +5
                </button>
                {sets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSet(set.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Inputs Grid: Weight (kg) & Reps (회) & Complete Button */}
            <div className="grid grid-cols-12 gap-2.5 items-center">
              {/* Weight Input */}
              <div className="col-span-5">
                <div className="text-[10px] font-black text-slate-400 mb-0.5">무게 (kg)</div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={set.weight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setSets(prev => prev.map(s => s.id === set.id ? { ...s, weight: val } : s));
                    }}
                    className="w-full bg-[#181820] border border-[#23232D] rounded-xl px-3 py-1.5 text-sm font-black text-white font-mono-num outline-none focus:border-[#D4FF00]"
                  />
                  <span className="absolute right-2.5 top-1.5 text-xs text-slate-500 font-bold">kg</span>
                </div>
              </div>

              {/* Reps Input with Stepper */}
              <div className="col-span-5">
                <div className="text-[10px] font-black text-slate-400 mb-0.5">반복 횟수 (회)</div>
                <div className="flex items-center bg-[#181820] border border-[#23232D] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleAdjustReps(set.id, -1)}
                    className="px-2.5 py-1.5 text-xs font-black text-slate-400 hover:text-white bg-[#121217]"
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
                    className="w-full text-center bg-transparent text-sm font-black text-white font-mono-num outline-none py-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustReps(set.id, 1)}
                    className="px-2.5 py-1.5 text-xs font-black text-slate-400 hover:text-white bg-[#121217]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Complete Toggle Checkmark */}
              <div className="col-span-2 flex flex-col items-center justify-center">
                <div className="text-[10px] font-black text-slate-400 mb-0.5">완료</div>
                <button
                  type="button"
                  onClick={() => handleToggleComplete(set.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    set.completed
                      ? 'bg-[#D4FF00] text-black shadow-lg shadow-[#D4FF00]/30 scale-105'
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
          className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#0A0A0E] hover:bg-[#181820] border border-dashed border-[#23232D] hover:border-[#D4FF00]/50 text-xs font-black text-slate-300 hover:text-[#D4FF00] transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>세트 추가 (+Set)</span>
        </button>

        <button
          type="button"
          onClick={handleSaveToToday}
          className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4FF00] to-[#A3E635] text-black text-xs sm:text-sm font-black shadow-lg shadow-[#D4FF00]/25 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>오늘 운동 기록에 즉시 저장</span>
        </button>
      </div>
    </div>
  );
};
