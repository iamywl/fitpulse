import React, { useState, useMemo, useEffect } from 'react';
import { WorkoutSession, IExerciseLog, IExerciseSet, IWeeklySplitDay, IWeeklySplitExercise } from '../models/fitness';
import { DEFAULT_WEEKLY_SPLIT } from '../data/splitRoutineData';
import { MASTER_EXERCISE_LIBRARY, IMasterExercise } from '../data/exerciseLibrary';
import { RoutineService } from '../services/routine/RoutineService';
import { VolumeService } from '../services/calculator/VolumeService';
import { AudioAlertService } from '../services/sound/AudioAlertService';
import { RestTimerModal } from './RestTimerModal';
import { TdsBadge } from './tds/TdsBadge';
import { TdsButton } from './tds/TdsButton';
import { TdsBottomCTA } from './tds/TdsBottomCTA';
import { 
  Check, 
  CheckCircle2,
  Sparkles, 
  Trash2, 
  ChevronRight, 
  Plus,
  Dumbbell,
  X,
  Repeat
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodayWorkoutHeroSectionProps {
  workouts: WorkoutSession[];
  onSaveWorkoutSession: (session: WorkoutSession) => void;
  splitList?: IWeeklySplitDay[];
  onUpdateSplit?: (updatedSplit: IWeeklySplitDay[]) => void;
  isMobileView?: boolean;
  themeMode?: 'dark' | 'light';
  onNavigateTab?: (tab: string) => void;
}

export const TodayWorkoutHeroSection: React.FC<TodayWorkoutHeroSectionProps> = ({
  workouts,
  onSaveWorkoutSession,
  splitList = DEFAULT_WEEKLY_SPLIT,
  onUpdateSplit,
  isMobileView = false,
  themeMode = 'light',
  onNavigateTab,
}) => {
  const isDark = themeMode === 'dark';
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentDayIndex = new Date().getDay(); // 0: Sun, 1: Mon, ...

  // Today's Routine from Split Routine Data
  const todaySplitDay: IWeeklySplitDay = useMemo(() => {
    return splitList.find(d => d.dayIndex === currentDayIndex) || splitList[1] || DEFAULT_WEEKLY_SPLIT[1];
  }, [splitList, currentDayIndex]);

  // Check if today already has a saved workout session
  const todayWorkoutSession = useMemo(() => {
    return workouts.find(w => w.date === todayStr);
  }, [workouts, todayStr]);

  const [isEditingAfterComplete, setIsEditingAfterComplete] = useState<boolean>(false);
  const isTodayCompleted = !!todayWorkoutSession && !isEditingAfterComplete;

  // Selected Active Exercise inside today's workout
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);

  // Exercise sets state mapped by exercise ID
  const [exerciseSetsMap, setExerciseSetsMap] = useState<Record<string, IExerciseSet[]>>(() => {
    const map: Record<string, IExerciseSet[]> = {};
    todaySplitDay.exercises.forEach((ex) => {
      const loggedEx = todayWorkoutSession?.exercises.find(e => e.exerciseId === ex.id || e.exerciseName === ex.name);
      if (loggedEx && loggedEx.sets.length > 0) {
        map[ex.id] = loggedEx.sets;
      } else {
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

  // Keep exerciseSetsMap in sync whenever todaySplitDay changes
  useEffect(() => {
    setExerciseSetsMap(prev => {
      const nextMap = { ...prev };
      todaySplitDay.exercises.forEach(ex => {
        if (!nextMap[ex.id] || nextMap[ex.id].length === 0) {
          const loggedEx = todayWorkoutSession?.exercises.find(e => e.exerciseId === ex.id || e.exerciseName === ex.name);
          if (loggedEx && loggedEx.sets.length > 0) {
            nextMap[ex.id] = loggedEx.sets;
          } else {
            const defaultWeight = ex.name.includes('데드리프트') ? 100 :
                                  ex.name.includes('스쿼트') ? 90 :
                                  ex.name.includes('벤치프레스') ? 70 :
                                  ex.name.includes('프레스') ? 50 : 40;
            nextMap[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
              id: `set-${ex.id}-${i + 1}`,
              setNumber: i + 1,
              weight: defaultWeight + (i > 0 ? (i * 2.5) : 0),
              reps: parseInt(ex.reps) || 8,
              completed: false,
              isWarmup: i === 0,
            }));
          }
        }
      });
      return nextMap;
    });
  }, [todaySplitDay, todayWorkoutSession]);

  // Exercise Picker Modal State
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState<boolean>(false);
  const [pickerMode, setPickerMode] = useState<'replace' | 'add'>('replace');
  const [selectedMuscleCategory, setSelectedMuscleCategory] = useState<string>('all');
  const [searchExerciseQuery, setSearchExerciseQuery] = useState<string>('');

  // Rest Timer Modal State
  const [isRestTimerOpen, setIsRestTimerOpen] = useState<boolean>(false);
  const [timerSetNumber, setTimerSetNumber] = useState<number>(1);
  const [timerExerciseName, setTimerExerciseName] = useState<string>('운동');
  const [timerRestDuration, setTimerRestDuration] = useState<number>(90);

  // Safe active exercise pointer
  const currentExercise = todaySplitDay.exercises[activeExerciseIndex] || todaySplitDay.exercises[0];
  const currentSets = currentExercise ? (exerciseSetsMap[currentExercise.id] || []) : [];

  // Filtered exercises for picker modal
  const filteredLibraryExercises = useMemo(() => {
    return MASTER_EXERCISE_LIBRARY.filter(ex => {
      const matchesCategory = selectedMuscleCategory === 'all' || ex.category === selectedMuscleCategory;
      const matchesSearch = !searchExerciseQuery.trim() || 
        ex.name.toLowerCase().includes(searchExerciseQuery.toLowerCase()) ||
        ex.targetMuscle.toLowerCase().includes(searchExerciseQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedMuscleCategory, searchExerciseQuery]);

  // Handle choosing an exercise from the library
  const handleSelectLibraryExercise = (masterEx: IMasterExercise) => {
    const newRoutineExercise: IWeeklySplitExercise = {
      id: `ex-${masterEx.id}-${Date.now()}`,
      name: masterEx.name,
      sets: masterEx.defaultSets,
      reps: masterEx.defaultReps,
      targetMuscle: masterEx.targetMuscle,
      intensity: masterEx.intensity,
      restSeconds: masterEx.defaultRestSeconds,
      target1RMPercent: 75,
    };

    const initialSets: IExerciseSet[] = Array.from({ length: masterEx.defaultSets }, (_, i) => ({
      id: `set-${newRoutineExercise.id}-${i + 1}`,
      setNumber: i + 1,
      weight: masterEx.name.includes('데드리프트') ? 100 :
              masterEx.name.includes('스쿼트') ? 90 :
              masterEx.name.includes('벤치프레스') ? 70 : 40,
      reps: parseInt(masterEx.defaultReps) || 10,
      completed: false,
      isWarmup: i === 0,
    }));

    if (pickerMode === 'replace' && currentExercise) {
      const updatedExercises = [...todaySplitDay.exercises];
      updatedExercises[activeExerciseIndex] = newRoutineExercise;

      const updatedSplitList = splitList.map(d => 
        d.dayIndex === todaySplitDay.dayIndex ? { ...d, exercises: updatedExercises } : d
      );

      setExerciseSetsMap(prev => {
        const next = { ...prev };
        delete next[currentExercise.id];
        next[newRoutineExercise.id] = initialSets;
        return next;
      });

      if (onUpdateSplit) {
        onUpdateSplit(updatedSplitList);
      } else {
        RoutineService.saveWeeklySplit(updatedSplitList);
      }
    } else if (pickerMode === 'add') {
      const updatedExercises = [...todaySplitDay.exercises, newRoutineExercise];
      const updatedSplitList = splitList.map(d => 
        d.dayIndex === todaySplitDay.dayIndex ? { ...d, exercises: updatedExercises } : d
      );

      setExerciseSetsMap(prev => ({
        ...prev,
        [newRoutineExercise.id]: initialSets,
      }));

      if (onUpdateSplit) {
        onUpdateSplit(updatedSplitList);
      } else {
        RoutineService.saveWeeklySplit(updatedSplitList);
      }

      setActiveExerciseIndex(updatedExercises.length - 1);
    }

    setIsExercisePickerOpen(false);
    setSearchExerciseQuery('');
  };

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
      alert('완료된 세트가 최소 1개 이상 있어야 오늘 운동을 저장할 수 있어요.');
      return;
    }

    const newSession: WorkoutSession = {
      id: todayWorkoutSession?.id || `workout-${Date.now()}`,
      date: todayStr,
      title: `[${todaySplitDay.dayName}요일] ${todaySplitDay.title}`,
      durationMinutes: todaySplitDay.estimatedMinutes,
      exercises: exerciseLogs,
      totalVolume: VolumeService.calculateSessionVolume(exerciseLogs),
      memo: `오늘 운동 완료 (${completedExercisesCount}/${totalExercisesCount} 종목 완주)`,
    };

    onSaveWorkoutSession(newSession);
    setIsEditingAfterComplete(false);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#3182F6', '#00BFA5', '#00C73C', '#FF9F00']
    });
  };

  // Rest Day View
  if (todaySplitDay.isRestDay) {
    return (
      <div
        className={`rounded-3xl p-6 sm:p-8 text-center transition-all ${
          isDark ? 'bg-[#1C1C1E] border border-[#2C2C2E] text-white' : 'bg-white border border-slate-200 shadow-sm text-[#191F28]'
        }`}
      >
        <div className="w-16 h-16 rounded-3xl bg-[#E8F3FF] dark:bg-[#3182F6]/15 text-[#3182F6] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <TdsBadge size="medium" variant="weak" color="blue" isDark={isDark} className="mb-3">
          휴식과 충전의 날
        </TdsBadge>
        <h2 className="text-xl sm:text-2xl font-black mt-2 mb-2">오늘은 푹 쉬어가도 좋아요</h2>
        <p className={`text-sm max-w-md mx-auto mb-6 leading-relaxed ${isDark ? 'text-[#8B95A1]' : 'text-[#4E5968]'}`}>
          충분한 수면과 영양 섭취로 몸을 회복해 보세요. 다음 운동 때 더 가볍게 들어 올릴 수 있어요.
        </p>
        <div className="flex justify-center gap-2">
          {onNavigateTab && (
            <TdsButton
              variant="secondary"
              size="medium"
              isDark={isDark}
              onClick={() => onNavigateTab('split')}
            >
              이번 주 운동 계획 보러가기
            </TdsButton>
          )}
        </div>
      </div>
    );
  }

  const finalVolume = todayWorkoutSession?.totalVolume || todayLiveVolume;
  const finalCompletedExercises = todayWorkoutSession
    ? todayWorkoutSession.exercises.length
    : completedExercisesCount;
  const finalCompletedSets = todayWorkoutSession
    ? todayWorkoutSession.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)
    : Object.values(exerciseSetsMap).reduce((sum, sets) => sum + sets.filter(s => s.completed).length, 0);

  return (
    <div className={`space-y-4 pb-24 ${isMobileView ? 'px-0' : ''}`}>
      {/* 1. Workout Header HUD & Progress Ribbon */}
      <div
        className={`rounded-3xl ${isMobileView ? 'p-4' : 'p-5'} transition-all ${
          isDark
            ? 'bg-[#1C1C1E] border border-[#2C2C2E] text-white'
            : 'bg-white border border-slate-200 shadow-sm text-[#191F28]'
        }`}
      >
        <div className={`flex ${isMobileView ? 'flex-col gap-3' : 'flex-col sm:flex-row sm:items-center justify-between gap-3'} mb-4`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {isTodayCompleted ? (
                <TdsBadge size="small" variant="fill" color="green" isDark={isDark} icon={<CheckCircle2 className="w-3.5 h-3.5 text-white" />}>
                  오늘 운동 완료
                </TdsBadge>
              ) : (
                <TdsBadge size="small" variant="weak" color="blue" isDark={isDark}>
                  {todaySplitDay.dayName}요일 운동
                </TdsBadge>
              )}
              <span className={`text-xs font-medium ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
                {todayStr}
              </span>
              <span className={`text-xs font-mono ${isDark ? 'text-[#6B7684]' : 'text-[#8B95A1]'}`}>
                약 {todaySplitDay.estimatedMinutes}분
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight whitespace-nowrap break-keep">
              {isTodayCompleted ? '오늘 운동을 멋지게 완료했어요! 🎉' : '오늘 할 운동이에요'}
            </h1>
            <p className={`text-xs sm:text-sm mt-0.5 break-keep ${isDark ? 'text-[#8B95A1]' : 'text-[#4E5968]'}`}>
              {isTodayCompleted
                ? `총 ${Math.round(finalVolume).toLocaleString()}kg의 볼륨을 들어올리며 점진적 과부하를 달성했어요`
                : `${todaySplitDay.title} · ${todaySplitDay.categoryDesc}`}
            </p>
          </div>

          {/* Quick Stats: Volume & Completion */}
          <div className={`grid ${isMobileView ? 'grid-cols-2 gap-2.5 w-full' : 'grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 flex-shrink-0'}`}>
            <div className={`px-4 py-2.5 rounded-2xl border ${
              isDark ? 'bg-[#101012] border-[#2C2C2E]' : 'bg-[#F2F4F6] border-slate-200'
            }`}>
              <div className={`text-[11px] font-semibold truncate ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
                들어 올린 무게
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-lg sm:text-xl font-black font-mono-num ${isDark ? 'text-white' : 'text-[#191F28]'}`}>
                  {Math.round(finalVolume).toLocaleString()}
                </span>
                <span className={`text-xs font-bold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
                  kg
                </span>
              </div>
            </div>

            <div className={`px-4 py-2.5 rounded-2xl border ${
              isDark ? 'bg-[#101012] border-[#2C2C2E]' : 'bg-[#F2F4F6] border-slate-200'
            }`}>
              <div className={`text-[11px] font-semibold truncate ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
                진행 상황
              </div>
              <div className="flex items-baseline gap-1 font-mono-num font-black">
                <span className={`text-lg sm:text-xl ${isTodayCompleted ? 'text-[#00C73C]' : 'text-[#3182F6]'}`}>
                  {finalCompletedExercises}/{totalExercisesCount}
                </span>
                <span className={`text-xs font-medium ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
                  ({isTodayCompleted ? 100 : progressPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar (TDS Blue or Green if complete) */}
        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#2C2C2E]' : 'bg-[#F2F4F6]'}`}>
          <div 
            className={`h-full transition-all duration-300 rounded-full ${isTodayCompleted ? 'bg-[#00C73C]' : 'bg-[#3182F6]'}`}
            style={{ width: `${isTodayCompleted ? 100 : progressPercent}%` }}
          />
        </div>
      </div>

      {/* Prominent TDS Celebration Summary Card when completed */}
      {isTodayCompleted && (
        <div className={`p-5 sm:p-6 rounded-3xl border text-center transition-all ${
          isDark
            ? 'bg-gradient-to-b from-[#1C2838] to-[#1C1C1E] border-[#3182F6]/30 text-white'
            : 'bg-gradient-to-b from-[#EBF3FE] to-white border-[#3182F6]/25 shadow-sm text-[#191F28]'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-[#00C73C] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            오늘 운동 완주를 축하해요! 👏
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-sm mx-auto break-keep ${isDark ? 'text-[#8B95A1]' : 'text-[#4E5968]'}`}>
            오늘의 노력이 잔디 히트맵에 안전하게 쌓였어요. 점진적 과부하 성장 리포트를 확인해 보세요.
          </p>

          {/* 4 Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 mb-5 text-left">
            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#101012] border-[#2C2C2E]' : 'bg-white border-slate-200'}`}>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>들어 올린 볼륨</span>
              <div className="text-lg font-black text-[#3182F6] font-mono-num mt-0.5">
                {Math.round(finalVolume).toLocaleString()} <span className="text-xs font-normal text-[#6B7684]">kg</span>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#101012] border-[#2C2C2E]' : 'bg-white border-slate-200'}`}>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>완주 종목</span>
              <div className="text-lg font-black font-mono-num mt-0.5">
                {finalCompletedExercises} <span className="text-xs font-normal text-[#6B7684]">종목</span>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#101012] border-[#2C2C2E]' : 'bg-white border-slate-200'}`}>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>완료 세트</span>
              <div className="text-lg font-black text-[#00C73C] font-mono-num mt-0.5">
                {finalCompletedSets} <span className="text-xs font-normal text-[#6B7684]">세트</span>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-[#101012] border-[#2C2C2E]' : 'bg-white border-slate-200'}`}>
              <span className={`text-[11px] font-semibold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>예상 소요 시간</span>
              <div className="text-lg font-black font-mono-num mt-0.5">
                약 {todayWorkoutSession?.durationMinutes || todaySplitDay.estimatedMinutes} <span className="text-xs font-normal text-[#6B7684]">분</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {onNavigateTab && (
              <TdsButton
                size="medium"
                variant="primary"
                fullWidth={isMobileView}
                onClick={() => onNavigateTab('analytics')}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                성장 분석(잔디 히트맵) 확인하기
              </TdsButton>
            )}
            <TdsButton
              size="medium"
              variant="secondary"
              fullWidth={isMobileView}
              isDark={isDark}
              onClick={() => setIsEditingAfterComplete(true)}
            >
              기록 수정하기
            </TdsButton>
          </div>
        </div>
      )}

      {/* Editing State Banner */}
      {isEditingAfterComplete && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs ${
          isDark ? 'bg-[#252528] border-[#3182F6]/40 text-white' : 'bg-[#E8F3FF] border-[#3182F6]/30 text-[#1B64DA]'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#3182F6]" />
            <span className="font-bold">기록 수정 모드예요. 변경 후 아래 완료 버튼을 눌러주세요.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingAfterComplete(false)}
            className="text-xs underline font-semibold flex-shrink-0"
          >
            수정 취소
          </button>
        </div>
      )}

      {/* 2. Horizontal Exercise Switcher Carousel + Add/Replace Drawer Trigger */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {todaySplitDay.exercises.map((ex, idx) => {
          const sets = exerciseSetsMap[ex.id] || [];
          const isDone = sets.length > 0 && sets.every(s => s.completed);
          const isCurrent = idx === activeExerciseIndex;

          return (
            <button
              key={ex.id}
              onClick={() => setActiveExerciseIndex(idx)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 select-none min-h-[44px] ${
                isCurrent
                  ? 'bg-[#3182F6] text-white shadow-sm font-black'
                  : isDone
                  ? isDark
                    ? 'bg-[#1C1C1E] text-[#6B7684] line-through border border-[#2C2C2E]'
                    : 'bg-white text-[#8B95A1] line-through border border-slate-200'
                  : isDark
                  ? 'bg-[#1C1C1E] text-[#B0B8C1] hover:text-white border border-[#2C2C2E]'
                  : 'bg-white text-[#4E5968] hover:text-[#191F28] border border-slate-200 shadow-sm'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                isCurrent
                  ? 'bg-white text-[#3182F6]'
                  : isDone
                  ? 'bg-[#00C73C] text-white'
                  : isDark ? 'bg-[#2C2C2E] text-white' : 'bg-[#F2F4F6] text-[#4E5968]'
              }`}>
                {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
              </span>
              <span>{ex.name}</span>
              <span className={`text-xs opacity-75 font-normal ${isCurrent ? 'text-white' : ''}`}>
                ({ex.sets}세트)
              </span>
            </button>
          );
        })}

        {/* Quick Add Exercise Button */}
        <button
          type="button"
          onClick={() => {
            setPickerMode('add');
            setSelectedMuscleCategory('all');
            setIsExercisePickerOpen(true);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-dashed text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 min-h-[44px] ${
            isDark
              ? 'bg-[#1C1C1E] hover:bg-[#2C2C2E] text-[#B0B8C1] border-[#3A3B42]'
              : 'bg-white hover:bg-slate-50 text-[#4E5968] border-slate-300'
          }`}
          title="오늘 할 운동 추가하기"
        >
          <Plus className="w-4 h-4 text-[#3182F6]" />
          <span>운동 추가</span>
        </button>
      </div>

      {/* 3. Active Exercise Hero Card & Direct Set Logger */}
      {currentExercise && (
        <div
          className={`rounded-3xl p-4 sm:p-5 transition-all ${
            isDark
              ? 'bg-[#1C1C1E] border border-[#2C2C2E] text-white'
              : 'bg-white border border-slate-200 shadow-sm text-[#191F28]'
          }`}
        >
          {/* Exercise Focus Header */}
          <div className={`flex items-center justify-between gap-3 pb-3.5 border-b ${
            isDark ? 'border-[#2C2C2E]' : 'border-slate-200'
          }`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <TdsBadge size="xsmall" variant="weak" color="teal" isDark={isDark}>
                  #{currentExercise.targetMuscle}
                </TdsBadge>
                {currentExercise.target1RMPercent && (
                  <span className={`text-xs font-bold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
                    추천 강도: {currentExercise.target1RMPercent}%
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black truncate">{currentExercise.name}</h2>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <TdsBadge size="xsmall" variant="weak" color="elephant" isDark={isDark}>
                {(() => {
                  const secs = currentExercise.restSeconds;
                  if (!secs || secs <= 0) return '휴식 없음';
                  if (secs < 60) return `휴식 ${secs}초`;
                  const m = Math.floor(secs / 60);
                  const s = secs % 60;
                  return s > 0 ? `휴식 ${m}분 ${s}초` : `휴식 ${m}분`;
                })()}
              </TdsBadge>
              <button
                type="button"
                onClick={() => {
                  setPickerMode('replace');
                  setSelectedMuscleCategory(
                    currentExercise.targetMuscle.includes('가슴') ? 'chest' :
                    currentExercise.targetMuscle.includes('등') ? 'back' :
                    currentExercise.targetMuscle.includes('하체') ? 'legs' :
                    currentExercise.targetMuscle.includes('어깨') ? 'shoulders' :
                    currentExercise.targetMuscle.includes('팔') ? 'arms' : 'all'
                  );
                  setIsExercisePickerOpen(true);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isDark
                    ? 'bg-[#242529] hover:bg-[#2C2D33] text-[#B0B8C1] border-[#33343A]'
                    : 'bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] border-slate-200'
                }`}
                title="다른 운동으로 바꾸기"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>종목 교체</span>
              </button>
            </div>
          </div>

          {/* Sets Table Header */}
          <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-[#8B95A1] my-3 px-2">
            <div className="col-span-2">세트</div>
            <div className="col-span-4">무게 (kg)</div>
            <div className="col-span-3 text-center">횟수</div>
            <div className="col-span-3 text-center">완료</div>
          </div>

          {/* Sets Rows */}
          <div className="space-y-2 mb-4">
            {currentSets.map((set) => (
              <div
                key={set.id}
                className={`rounded-2xl p-3 transition-all ${
                  set.completed
                    ? isDark
                      ? 'bg-[#101012] border border-[#00C73C]/40 ring-1 ring-[#00C73C]/20'
                      : 'bg-[#E8F9EE]/60 border border-[#00C73C]/30'
                    : isDark
                    ? 'bg-[#101012] border border-[#2C2C2E]'
                    : 'bg-[#F2F4F6] border border-slate-200'
                }`}
              >
                <div className="grid grid-cols-12 gap-2 items-center">
                  {/* Set # */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    <TdsBadge
                      size="small"
                      variant={set.completed ? 'fill' : 'weak'}
                      color={set.completed ? 'green' : 'elephant'}
                      isDark={isDark}
                    >
                      {set.setNumber}세트
                    </TdsBadge>
                  </div>

                  {/* Weight Input + Quick Chips */}
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
                        className={`w-full rounded-xl px-2.5 py-1.5 text-sm font-black font-mono-num outline-none border transition-colors ${
                          isDark
                            ? 'bg-[#1C1C1E] border-[#2C2C2E] text-white focus:border-[#3182F6]'
                            : 'bg-white border-slate-300 text-[#191F28] focus:border-[#3182F6]'
                        }`}
                      />
                      <span className="absolute right-2 text-xs font-bold text-[#8B95A1] pointer-events-none">kg</span>
                    </div>
                  </div>

                  {/* Reps Stepper */}
                  <div className="col-span-3 flex items-center rounded-xl overflow-hidden border border-inherit">
                    <button
                      type="button"
                      onClick={() => handleAdjustReps(set.id, -1)}
                      className={`w-7 h-8 flex items-center justify-center text-xs font-black transition-colors ${
                        isDark ? 'bg-[#242529] hover:bg-[#2C2D33] text-white' : 'bg-white hover:bg-slate-100 text-[#191F28]'
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
                      className={`w-7 h-8 flex items-center justify-center text-xs font-black transition-colors ${
                        isDark ? 'bg-[#242529] hover:bg-[#2C2D33] text-white' : 'bg-white hover:bg-slate-100 text-[#191F28]'
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
                      className={`w-full max-w-[64px] h-8 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                        set.completed
                          ? 'bg-[#00C73C] text-white shadow-sm'
                          : isDark
                          ? 'bg-[#242529] text-[#B0B8C1] hover:bg-[#2C2D33] hover:text-white'
                          : 'bg-white text-[#4E5968] hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span className="hidden sm:inline">{set.completed ? '완료' : '끝'}</span>
                    </button>
                    {currentSets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(set.id)}
                        className="p-1 text-[#8B95A1] hover:text-[#F04452] transition-colors"
                        title="세트 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Weight Quick Adjust Chips */}
                <div className={`flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t ${
                  isDark ? 'border-[#2C2C2E]' : 'border-slate-200'
                }`}>
                  <span className={`text-[11px] font-medium mr-1 ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
                    무게 변경:
                  </span>
                  {[-2.5, 2.5, 5].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => handleAdjustWeight(set.id, delta)}
                      className={`min-h-[28px] px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        isDark
                          ? 'bg-[#242529] hover:bg-[#2C2D33] text-[#B0B8C1] border border-[#2E3036]'
                          : 'bg-white hover:bg-slate-100 text-[#4E5968] border border-slate-200 shadow-sm'
                      }`}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Set & Next Exercise Drawer */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <TdsButton
              variant="secondary"
              size="small"
              isDark={isDark}
              onClick={handleAddSet}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              세트 추가
            </TdsButton>

            {activeExerciseIndex < todaySplitDay.exercises.length - 1 && (
              <TdsButton
                variant="weak"
                size="small"
                isDark={isDark}
                onClick={() => setActiveExerciseIndex(prev => prev + 1)}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                다음: {todaySplitDay.exercises[activeExerciseIndex + 1].name}
              </TdsButton>
            )}
          </div>
        </div>
      )}

      {/* 4. Bottom Fixed Floating CTA (TDS Mobile BottomCTA) */}
      <TdsBottomCTA
        text={
          isTodayCompleted
            ? `오늘 운동 완료됨 (총 ${Math.round(finalVolume).toLocaleString()}kg)`
            : isEditingAfterComplete
            ? '수정한 오늘 운동 저장하기'
            : `오늘 ${todaySplitDay.dayName}요일 운동 완료하기`
        }
        subText={
          isTodayCompleted
            ? '성장 분석 탭에서 잔디 히트맵을 확인해보세요 👏'
            : completedExercisesCount > 0
            ? `오늘 총 ${Math.round(todayLiveVolume).toLocaleString()}kg을 들어 올렸어요 👍`
            : '세트를 완료하고 기록을 저장해볼까요?'
        }
        variant={isTodayCompleted ? 'secondary' : 'primary'}
        isDark={isDark}
        isSimulator={isMobileView}
        onClick={isTodayCompleted ? () => onNavigateTab?.('analytics') : handleSaveTodaySession}
        leftIcon={isTodayCompleted ? <CheckCircle2 className="w-4 h-4 text-[#00C73C]" /> : <Sparkles className="w-4 h-4" />}
      />

      {/* Rest Timer Modal */}
      <RestTimerModal
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        initialSeconds={timerRestDuration}
        completedSetNumber={timerSetNumber}
        exerciseName={timerExerciseName}
        themeMode={themeMode}
      />

      {/* 5. Muscle-Group Exercise Picker Modal (TDS Sheet Style) */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${
              isDark
                ? 'bg-[#1C1C1E] border-[#2C2C2E] text-white'
                : 'bg-white border-slate-200 text-[#191F28]'
            }`}
          >
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'border-[#2C2C2E]' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E8F3FF] dark:bg-[#3182F6]/15 text-[#3182F6] flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {pickerMode === 'replace' ? '다른 운동으로 바꾸기' : '새 운동 추가하기'}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
                    부위별로 원하는 종목을 골라보세요
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExercisePickerOpen(false)}
                className={`p-2 rounded-2xl transition-colors ${
                  isDark ? 'hover:bg-[#2C2C2E] text-[#8B95A1]' : 'hover:bg-[#F2F4F6] text-[#6B7684]'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Muscle Group Category Tabs */}
            <div className={`p-3 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
              isDark ? 'border-[#2C2C2E] bg-[#101012]' : 'border-slate-100 bg-[#F2F4F6]'
            }`}>
              {[
                { id: 'all', label: '전체' },
                { id: 'chest', label: '가슴' },
                { id: 'back', label: '등' },
                { id: 'legs', label: '하체' },
                { id: 'shoulders', label: '어깨' },
                { id: 'arms', label: '팔' },
                { id: 'core', label: '코어' },
              ].map(cat => {
                const isActive = selectedMuscleCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedMuscleCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-[#3182F6] text-white shadow-sm font-black'
                        : isDark
                        ? 'bg-[#1C1C1E] text-[#8B95A1] hover:text-white border border-[#2C2C2E]'
                        : 'bg-white text-[#6B7684] hover:text-[#191F28] border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-inherit">
              <input
                type="text"
                placeholder="운동 종목 이름 검색 (예: 벤치프레스, 스쿼트)..."
                value={searchExerciseQuery}
                onChange={(e) => setSearchExerciseQuery(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-sm font-medium border outline-none transition-colors ${
                  isDark
                    ? 'bg-[#101012] border-[#2C2C2E] text-white focus:border-[#3182F6]'
                    : 'bg-[#F2F4F6] border-slate-200 text-[#191F28] focus:border-[#3182F6]'
                }`}
              />
            </div>

            {/* Exercise List */}
            <div className="p-3 overflow-y-auto max-h-[50vh] space-y-2">
              {filteredLibraryExercises.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8B95A1]">
                  해당하는 운동 종목을 찾지 못했어요.
                </div>
              ) : (
                filteredLibraryExercises.map((masterEx) => (
                  <div
                    key={masterEx.id}
                    onClick={() => handleSelectLibraryExercise(masterEx)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isDark
                        ? 'bg-[#101012] hover:bg-[#242529] border-[#2C2C2E]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <TdsBadge size="xsmall" variant="weak" color="blue" isDark={isDark}>
                          {masterEx.targetMuscle}
                        </TdsBadge>
                      </div>
                      <h4 className="text-sm font-bold truncate">{masterEx.name}</h4>
                      {masterEx.tip && (
                        <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
                          💡 {masterEx.tip}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`text-right text-xs font-mono ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
                        <div>{masterEx.defaultSets}세트 · {masterEx.defaultReps.endsWith('회') ? masterEx.defaultReps : `${masterEx.defaultReps}회`}</div>
                      </div>
                      <TdsButton size="small" variant="weak" isDark={isDark}>
                        선택
                      </TdsButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
