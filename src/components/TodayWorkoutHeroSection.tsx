import React, { useState, useMemo } from 'react';
import { WorkoutSession, IExerciseLog, IExerciseSet, IWeeklySplitDay, IWeeklySplitExercise } from '../models/fitness';
import { DEFAULT_WEEKLY_SPLIT } from '../data/splitRoutineData';
import { VolumeService } from '../services/calculator/VolumeService';
import { AudioAlertService } from '../services/sound/AudioAlertService';
import { RestTimerModal } from './RestTimerModal';
import { ThemeMode } from '../theme/pantone';
import { 
  Check, 
  Flame, 
  Sparkles, 
  Trash2, 
  ChevronRight, 
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodayWorkoutHeroSectionProps {
  workouts: WorkoutSession[];
  onSaveWorkoutSession: (session: WorkoutSession) => void;
  isMobileView?: boolean;
  themeMode?: ThemeMode;
  onNavigateTab?: (tab: string) => void;
}

export const TodayWorkoutHeroSection: React.FC<TodayWorkoutHeroSectionProps> = ({
  workouts,
  onSaveWorkoutSession,
  isMobileView = false,
  themeMode = 'dark',
  onNavigateTab,
}) => {
  const isLight = themeMode === 'light';
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentDayIndex = new Date().getDay(); // 0: Sun, 1: Mon, ...

  // Today's Routine from Split Routine Data
  const todaySplitDay: IWeeklySplitDay = useMemo(() => {
    return DEFAULT_WEEKLY_SPLIT.find(d => d.dayIndex === currentDayIndex) || DEFAULT_WEEKLY_SPLIT[1];
  }, [currentDayIndex]);

  // Check if today already has a saved workout session
  const todayWorkoutSession = useMemo(() => {
    return workouts.find(w => w.date === todayStr);
  }, [workouts, todayStr]);

  // Selected Active Exercise inside today's workout
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);

  // Exercise sets state mapped by exercise ID
  const [exerciseSetsMap, setExerciseSetsMap] = useState<Record<string, IExerciseSet[]>>(() => {
    const map: Record<string, IExerciseSet[]> = {};
    todaySplitDay.exercises.forEach((ex) => {
      // If already logged in todayWorkoutSession, load it
      const loggedEx = todayWorkoutSession?.exercises.find(e => e.exerciseId === ex.id || e.exerciseName === ex.name);
      if (loggedEx && loggedEx.sets.length > 0) {
        map[ex.id] = loggedEx.sets;
      } else {
        // Default sets according to split routine targets
        const defaultWeight = ex.name.includes('데드리프트') ? 100 :
                              ex.name.includes('스쿼트') ? 90 :
                              ex.name.includes('벤치프레스') ? 70 :
                              ex.name.includes('프레스') ? 50 : 40;
        map[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
          id: `set-${ex.id}-${i + 1}`,
          setNumber: i + 1,
          weight: defaultWeight + (i > 0 ? (i * 2.5) : 0),
          reps: parseInt(ex.reps) || 8,
          completed: false,
          isWarmup: i === 0,
        }));
      }
    });
    return map;
  });

  // Rest Timer State
  const [isRestTimerOpen, setIsRestTimerOpen] = useState<boolean>(false);
  const [timerSetNumber, setTimerSetNumber] = useState<number>(1);
  const [timerExerciseName, setTimerExerciseName] = useState<string>('운동');
  const [timerRestDuration, setTimerRestDuration] = useState<number>(90);

  const currentExercise: IWeeklySplitExercise | undefined = todaySplitDay.exercises[activeExerciseIndex];
  const currentSets: IExerciseSet[] = currentExercise ? (exerciseSetsMap[currentExercise.id] || []) : [];

  // Completed counts across all exercises today
  const totalExercisesCount = todaySplitDay.exercises.length;
  const completedExercisesCount = useMemo(() => {
    return todaySplitDay.exercises.filter(ex => {
      const sets = exerciseSetsMap[ex.id] || [];
      return sets.length > 0 && sets.every(s => s.completed);
    }).length;
  }, [todaySplitDay, exerciseSetsMap]);

  const progressPercent = totalExercisesCount > 0 ? Math.round((completedExercisesCount / totalExercisesCount) * 100) : 0;

  // Total volume done today so far
  const todayLiveVolume = useMemo(() => {
    let vol = 0;
    Object.values(exerciseSetsMap).forEach(sets => {
      sets.forEach(s => {
        if (s.completed) vol += s.weight * s.reps;
      });
    });
    return vol;
  }, [exerciseSetsMap]);

  // Set operations for active exercise
  const handleToggleSetComplete = (setId: string) => {
    if (!currentExercise) return;
    const sets = exerciseSetsMap[currentExercise.id] || [];
    const targetSet = sets.find(s => s.id === setId);
    const willComplete = targetSet ? !targetSet.completed : false;

    const updated = sets.map(s => s.id === setId ? { ...s, completed: willComplete } : s);
    setExerciseSetsMap(prev => ({
      ...prev,
      [currentExercise.id]: updated,
    }));

    if (willComplete && targetSet) {
      AudioAlertService.playSetComplete();
      setTimerExerciseName(currentExercise.name);
      setTimerSetNumber(targetSet.setNumber);
      setTimerRestDuration(currentExercise.restSeconds || 90);
      setIsRestTimerOpen(true);
    }
  };

  const handleAdjustWeight = (setId: string, delta: number) => {
    if (!currentExercise) return;
    setExerciseSetsMap(prev => ({
      ...prev,
      [currentExercise.id]: (prev[currentExercise.id] || []).map(s => 
        s.id === setId ? { ...s, weight: Math.max(0, Math.round((s.weight + delta) * 10) / 10) } : s
      )
    }));
  };

  const handleAdjustReps = (setId: string, delta: number) => {
    if (!currentExercise) return;
    setExerciseSetsMap(prev => ({
      ...prev,
      [currentExercise.id]: (prev[currentExercise.id] || []).map(s => 
        s.id === setId ? { ...s, reps: Math.max(1, s.reps + delta) } : s
      )
    }));
  };

  const handleAddSet = () => {
    if (!currentExercise) return;
    const sets = exerciseSetsMap[currentExercise.id] || [];
    const last = sets[sets.length - 1];
    const newSet: IExerciseSet = {
      id: `set-${currentExercise.id}-${Date.now()}`,
      setNumber: sets.length + 1,
      weight: last ? last.weight : 60,
      reps: last ? last.reps : 8,
      completed: false,
    };
    setExerciseSetsMap(prev => ({
      ...prev,
      [currentExercise.id]: [...sets, newSet],
    }));
  };

  const handleRemoveSet = (setId: string) => {
    if (!currentExercise) return;
    const sets = exerciseSetsMap[currentExercise.id] || [];
    if (sets.length <= 1) return;
    setExerciseSetsMap(prev => ({
      ...prev,
      [currentExercise.id]: sets.filter(s => s.id !== setId).map((s, idx) => ({ ...s, setNumber: idx + 1 })),
    }));
  };

  // Save Today Workout Session to workouts store
  const handleSaveTodaySession = () => {
    const exerciseLogs: IExerciseLog[] = todaySplitDay.exercises
      .map(ex => ({
        id: `ex-log-${ex.id}-${Date.now()}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        category: (ex.targetMuscle.includes('가슴') ? 'chest' :
                   ex.targetMuscle.includes('등') ? 'back' :
                   ex.targetMuscle.includes('하체') ? 'legs' :
                   ex.targetMuscle.includes('어깨') ? 'shoulders' :
                   ex.targetMuscle.includes('팔') ? 'arms' : 'core') as any,
        sets: exerciseSetsMap[ex.id] || [],
      }))
      .filter(log => log.sets.some(s => s.completed));

    if (exerciseLogs.length === 0) {
      alert('완료된 세트가 최소 1개 이상 있어야 오늘 운동을 저장할 수 있습니다.');
      return;
    }

    const newSession: WorkoutSession = {
      id: todayWorkoutSession?.id || `workout-${Date.now()}`,
      date: todayStr,
      title: `${todaySplitDay.dayName}요일 분할: ${todaySplitDay.title}`,
      durationMinutes: todaySplitDay.estimatedMinutes,
      exercises: exerciseLogs,
      totalVolume: VolumeService.calculateSessionVolume(exerciseLogs),
      memo: `점진적 과부하 달성 완료 (${completedExercisesCount}/${totalExercisesCount} 종목 완주)`,
    };

    onSaveWorkoutSession(newSession);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#D4FF00', '#38BDF8', '#FFFFFF']
    });
  };

  // Rest Day View
  if (todaySplitDay.isRestDay) {
    return (
      <div
        className={`border rounded-3xl p-6 shadow-2xl text-center transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#111115] border-[#272732] text-white'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <Flame className="w-8 h-8" />
        </div>
        <span className="text-[11px] font-black px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 tracking-wider">
          REST & RECOVERY DAY
        </span>
        <h2 className="text-xl font-black mt-3 mb-1">오늘은 근합성 및 회복의 날입니다</h2>
        <p className={`text-xs max-w-md mx-auto mb-5 ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
          충분한 수면과 단백질 섭취로 신경계와 근섬유를 리셋하세요. 다음 세션에서 더 강력한 중량을 다룰 수 있습니다.
        </p>
        <div className="flex justify-center gap-2">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('split')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#D4FF00] text-black shadow-md"
            >
              전체 주간 분할 루틴 확인하기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobileView ? 'px-0' : ''}`}>
      {/* 1. Workout Header HUD & Progress Ribbon */}
      <div
        className={`border rounded-3xl ${isMobileView ? 'p-3.5' : 'p-4 sm:p-5'} shadow-xl transition-colors relative overflow-hidden ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-100'
            : 'bg-[#111115] border-[#272732] text-white shadow-2xl'
        }`}
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4FF00] to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#D4FF00] text-black shadow-sm font-mono-num">
                TODAY {todaySplitDay.dayName}요일
              </span>
              <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {todayStr}
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#181820] border-[#272732] text-slate-300'
              }`}>
                {todaySplitDay.estimatedMinutes}분 예정
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
              <span>{todaySplitDay.title}</span>
            </h1>
          </div>

          {/* Quick Stats: Volume & Completion */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}>
              <div className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>오늘 누적 볼륨</div>
              <div className="flex items-baseline gap-0.5">
                <span className={`text-base font-black font-mono-num ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
                  {VolumeService.formatKg(todayLiveVolume)}
                </span>
              </div>
            </div>

            <div className={`p-2.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}>
              <div className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>진행률</div>
              <div className="flex items-baseline gap-1 font-mono-num font-black">
                <span className={`text-base ${completedExercisesCount === totalExercisesCount ? 'text-[#22C55E]' : isLight ? 'text-slate-900' : 'text-white'}`}>
                  {completedExercisesCount}/{totalExercisesCount}
                </span>
                <span className="text-xs text-slate-400">({progressPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#181820]'}`}>
          <div 
            className="h-full bg-[#D4FF00] transition-all duration-300 rounded-full shadow-[0_0_8px_#D4FF00]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Horizontal Exercise Switcher Carousel / Drawer */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {todaySplitDay.exercises.map((ex, idx) => {
          const sets = exerciseSetsMap[ex.id] || [];
          const isDone = sets.length > 0 && sets.every(s => s.completed);
          const isCurrent = idx === activeExerciseIndex;

          return (
            <button
              key={ex.id}
              onClick={() => setActiveExerciseIndex(idx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-black whitespace-nowrap transition-all flex-shrink-0 min-h-[42px] ${
                isCurrent
                  ? 'bg-[#D4FF00] text-black border-[#D4FF00] shadow-md shadow-[#D4FF00]/25'
                  : isDone
                  ? isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-400 line-through'
                    : 'bg-[#121217] border-[#272732] text-slate-500 line-through'
                  : isLight
                  ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  : 'bg-[#121217] border-[#272732] text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                isCurrent ? 'bg-black text-[#D4FF00]' : isDone ? 'bg-green-500/20 text-green-500' : 'bg-[#23232D] text-slate-300'
              }`}>
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
              </span>
              <span>{ex.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({ex.sets}세트)</span>
            </button>
          );
        })}
      </div>

      {/* 3. Active Exercise Hero Card & Direct Set Logger */}
      {currentExercise && (
        <div
          className={`border rounded-3xl p-4 sm:p-5 shadow-2xl transition-colors ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900 shadow-slate-100'
              : 'bg-[#121217] border-[#272732] text-white shadow-2xl ring-1 ring-white/5'
          }`}
        >
          {/* Exercise Focus Header */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-inherit">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#23232D] text-slate-300'
                }`}>
                  #{currentExercise.targetMuscle}
                </span>
                {currentExercise.target1RMPercent && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    isLight ? 'bg-lime-50 text-lime-800 border-lime-300' : 'bg-[#D4FF00]/10 text-[#D4FF00] border-[#D4FF00]/30'
                  }`}>
                    권장 강도 {currentExercise.target1RMPercent}% 1RM
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black truncate">{currentExercise.name}</h2>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                휴식 {currentExercise.restSeconds}초
              </span>
            </div>
          </div>

          {/* Sets Table Header */}
          <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-slate-400 my-2 px-2">
            <div className="col-span-2">세트</div>
            <div className="col-span-4">무게 (kg)</div>
            <div className="col-span-3 text-center">반복수</div>
            <div className="col-span-3 text-center">완료</div>
          </div>

          {/* Sets Rows */}
          <div className="space-y-2 mb-4">
            {currentSets.map((set) => (
              <div
                key={set.id}
                className={`border rounded-2xl p-2.5 sm:p-3 transition-all ${
                  set.completed
                    ? isLight
                      ? 'bg-slate-50 border-lime-400 ring-1 ring-lime-400/30'
                      : 'bg-[#0A0A0E] border-[#D4FF00]/40 ring-1 ring-[#D4FF00]/20'
                    : isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-[#0A0A0E] border-[#23232D]'
                }`}
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* Set # */}
                  <div className="col-span-2 flex items-center gap-1">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                        set.completed
                          ? 'bg-[#D4FF00] text-black'
                          : isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#181820] text-slate-300'
                      }`}
                    >
                      #{set.setNumber}
                    </span>
                    {set.isWarmup && (
                      <span className="text-[9px] font-bold text-amber-500 hidden sm:inline">웜업</span>
                    )}
                  </div>

                  {/* Weight Input + Quick +/- */}
                  <div className="col-span-4">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="2.5"
                        value={set.weight}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setExerciseSetsMap(prev => ({
                            ...prev,
                            [currentExercise.id]: (prev[currentExercise.id] || []).map(s => 
                              s.id === set.id ? { ...s, weight: val } : s
                            )
                          }));
                        }}
                        className={`w-full border rounded-xl px-2 py-1.5 text-xs sm:text-sm font-black font-mono-num outline-none ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 focus:border-lime-600'
                            : 'bg-[#181820] border-[#23232D] text-white focus:border-[#D4FF00]'
                        }`}
                      />
                      <span className="absolute right-2 text-[10px] font-bold text-slate-400 pointer-events-none">kg</span>
                    </div>
                  </div>

                  {/* Reps Stepper */}
                  <div className="col-span-3 flex items-center border rounded-xl overflow-hidden border-inherit">
                    <button
                      type="button"
                      onClick={() => handleAdjustReps(set.id, -1)}
                      className={`w-6 h-8 flex items-center justify-center text-xs font-black ${
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
                        setExerciseSetsMap(prev => ({
                          ...prev,
                          [currentExercise.id]: (prev[currentExercise.id] || []).map(s => 
                            s.id === set.id ? { ...s, reps: val } : s
                          )
                        }));
                      }}
                      className="w-full text-center bg-transparent text-xs sm:text-sm font-black font-mono-num outline-none py-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleAdjustReps(set.id, 1)}
                      className={`w-6 h-8 flex items-center justify-center text-xs font-black ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#121217] text-slate-400 hover:text-white'
                      }`}
                    >
                      +
                    </button>
                  </div>

                  {/* Complete Toggle Button */}
                  <div className="col-span-3 flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleSetComplete(set.id)}
                      className={`w-full max-w-[58px] h-8 rounded-xl flex items-center justify-center transition-all ${
                        set.completed
                          ? 'bg-[#D4FF00] text-black shadow-md shadow-[#D4FF00]/25'
                          : isLight
                          ? 'bg-slate-100 border border-slate-300 text-slate-400 hover:border-slate-500'
                          : 'bg-[#181820] border border-[#23232D] text-slate-500 hover:border-slate-400'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    {currentSets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(set.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="세트 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Weight Quick Adjust Chips */}
                <div className="flex items-center justify-end gap-1.5 mt-2 pt-1.5 border-t border-inherit">
                  <span className="text-[10px] text-slate-400 mr-1">중량 조정:</span>
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(set.id, -2.5)}
                    className={`min-h-[28px] px-2 py-0.5 rounded-lg text-[11px] font-black border transition-all ${
                      isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#181820] text-slate-300 border-[#272732]'
                    }`}
                  >
                    -2.5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(set.id, 2.5)}
                    className={`min-h-[28px] px-2 py-0.5 rounded-lg text-[11px] font-black border transition-all ${
                      isLight ? 'bg-lime-50 text-lime-800 border-lime-300' : 'bg-[#181820] text-[#D4FF00] border-[#272732]'
                    }`}
                  >
                    +2.5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(set.id, 5)}
                    className={`min-h-[28px] px-2 py-0.5 rounded-lg text-[11px] font-black border transition-all ${
                      isLight ? 'bg-lime-50 text-lime-800 border-lime-300' : 'bg-[#181820] text-[#D4FF00] border-[#272732]'
                    }`}
                  >
                    +5
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Set & Next Exercise Drawer */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleAddSet}
              className={`px-3 py-2 rounded-xl border border-dashed text-xs font-black transition-all flex items-center gap-1.5 ${
                isLight ? 'bg-slate-50 text-slate-700 border-slate-300 hover:border-lime-500' : 'bg-[#0A0A0E] text-slate-300 border-[#23232D] hover:border-[#D4FF00]/50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>세트 추가</span>
            </button>

            {activeExerciseIndex < todaySplitDay.exercises.length - 1 && (
              <button
                type="button"
                onClick={() => setActiveExerciseIndex(prev => prev + 1)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all flex items-center gap-1 ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-[#181820] hover:bg-[#23232D] text-white border-[#272732]'
                }`}
              >
                <span>다음 종목: {todaySplitDay.exercises[activeExerciseIndex + 1].name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Bottom Final Action: Save Workout Session */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSaveTodaySession}
          className="w-full py-3.5 rounded-2xl bg-[#D4FF00] hover:bg-[#C2EB00] text-black font-black text-sm sm:text-base shadow-xl shadow-[#D4FF00]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px]"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>오늘 {todaySplitDay.dayName}요일 운동 완료 및 기록 저장</span>
        </button>
      </div>

      {/* Rest Timer Modal */}
      <RestTimerModal
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        initialSeconds={timerRestDuration}
        completedSetNumber={timerSetNumber}
        exerciseName={timerExerciseName}
        themeMode={themeMode}
      />
    </div>
  );
};
