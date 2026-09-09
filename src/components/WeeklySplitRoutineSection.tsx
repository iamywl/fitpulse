import React, { useState } from 'react';
import { IWeeklySplitDay } from '../models/fitness';
import { DEFAULT_WEEKLY_SPLIT } from '../data/splitRoutineData';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Dumbbell, 
  Play,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { AudioAlertService } from '../services/sound/AudioAlertService';
import { RestTimerModal } from './RestTimerModal';
import { RoutineBuilderModal } from './RoutineBuilderModal';
import { TdsBadge } from './tds/TdsBadge';
import { TdsButton } from './tds/TdsButton';

interface WeeklySplitRoutineSectionProps {
  onStartRoutine?: (splitDay: IWeeklySplitDay) => void;
  onSelectRoutineExercise?: (exerciseId: string, exerciseName: string, category: any, targetWeight: number, targetReps: number) => void;
  onQuickLog?: () => void;
  splitList?: IWeeklySplitDay[];
  onUpdateSplit?: (updatedSplit: IWeeklySplitDay[]) => void;
  isMobileView?: boolean;
  themeMode?: 'dark' | 'light';
}

export const WeeklySplitRoutineSection: React.FC<WeeklySplitRoutineSectionProps> = ({
  onStartRoutine,
  onSelectRoutineExercise,
  splitList: propSplitList,
  onUpdateSplit,
  isMobileView = false,
  themeMode = 'light',
}) => {
  const isDark = themeMode === 'dark';
  const currentDayIndex = new Date().getDay(); // 0: Sun, 1: Mon, ...

  // Active selected day (default to today)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(currentDayIndex);

  // Completed exercise toggle state in current session
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  // Active routine split list from prop or default
  const splitList = propSplitList || DEFAULT_WEEKLY_SPLIT;

  // Routine Builder Modal State
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialBuilderOpen = queryParams?.get('builder') === 'true';
  const [isBuilderOpen, setIsBuilderOpen] = useState<boolean>(initialBuilderOpen);

  // Re-order to Monday first: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  const orderedSplitList = [
    ...splitList.filter(d => d.dayIndex !== 0),
    ...splitList.filter(d => d.dayIndex === 0),
  ];

  // Find currently selected day
  const activeDay = splitList.find(d => d.dayIndex === selectedDayIndex) || splitList[0];
  const isTodayActive = activeDay.dayIndex === currentDayIndex;

  // Rest Timer State
  const [isRestTimerOpen, setIsRestTimerOpen] = useState<boolean>(false);
  const [timerSetNumber, setTimerSetNumber] = useState<number>(1);
  const [timerExerciseName, setTimerExerciseName] = useState<string>('운동');
  const [timerRestDuration, setTimerRestDuration] = useState<number>(90);

  // Toggle exercise completion with Sound and Rest Timer Trigger
  const handleToggleExercise = (exerciseId: string) => {
    const willComplete = !completedExercises[exerciseId];
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: willComplete,
    }));

    if (willComplete) {
      const targetEx = activeDay.exercises.find(e => e.id === exerciseId);
      AudioAlertService.playSetComplete();
      setTimerExerciseName(targetEx ? targetEx.name : '운동');
      setTimerSetNumber(1);
      setTimerRestDuration(targetEx?.restSeconds || 90);
      setIsRestTimerOpen(true);
    }
  };

  // Reset exercise completion
  const handleResetChecklist = () => {
    setCompletedExercises({});
  };

  // Progress percentage for active day
  const totalExercises = activeDay.exercises.length;
  const completedCount = activeDay.exercises.filter(ex => completedExercises[ex.id]).length;
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  // Clean 2-letter muscle label helper to prevent truncation in 7-day strip
  const getShortMuscleLabel = (day: IWeeklySplitDay) => {
    if (day.isRestDay) return '휴식';
    const raw = (day.targetMuscles[0] || day.title || '').toLowerCase();
    if (raw.includes('가슴') || raw.includes('대흉')) return '가슴';
    if (raw.includes('등') || raw.includes('광배') || raw.includes('승모')) return '등';
    if (raw.includes('하체') || raw.includes('대퇴') || raw.includes('스쿼트') || raw.includes('레그')) return '하체';
    if (raw.includes('어깨') || raw.includes('삼각')) return '어깨';
    if (raw.includes('팔') || raw.includes('이두') || raw.includes('삼두')) return '팔';
    if (raw.includes('둔근') || raw.includes('엉덩이')) return '둔근';
    if (raw.includes('코어') || raw.includes('복근')) return '코어';
    return raw.slice(0, 2);
  };

  return (
    <div
      className={`rounded-3xl ${
        isMobileView ? 'p-4' : 'p-5 sm:p-6'
      } transition-all ${
        isDark
          ? 'bg-[#1C1C1E] border border-[#2C2C2E] text-white'
          : 'bg-white border border-slate-200 shadow-sm text-[#191F28]'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#E8F3FF] dark:bg-[#3182F6]/15 text-[#3182F6] flex-shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight whitespace-nowrap">
                이번 주 운동 계획
              </h2>
              <TdsBadge size="xsmall" variant="weak" color="blue" isDark={isDark}>
                주간 분할
              </TdsBadge>
            </div>
            <p className={`text-xs break-keep ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
              요일을 선택하여 루틴을 확인하세요
            </p>
          </div>
        </div>

        {/* Action: Routine Builder */}
        <TdsButton
          size="small"
          variant="secondary"
          isDark={isDark}
          onClick={() => setIsBuilderOpen(true)}
          leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}
        >
          루틴 설정
        </TdsButton>
      </div>

      {/* 7-Day Horizontal Strip Selector */}
      <div className="mb-5">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-2">
          {orderedSplitList.map((day) => {
            const isToday = day.dayIndex === currentDayIndex;
            const isSelected = day.dayIndex === selectedDayIndex;
            const muscleText = getShortMuscleLabel(day);

            return (
              <button
                key={day.dayKey}
                onClick={() => setSelectedDayIndex(day.dayIndex)}
                className={`flex flex-col items-center justify-between py-2 px-0.5 rounded-2xl transition-all relative select-none min-h-[76px] ${
                  isSelected
                    ? 'bg-[#3182F6] text-white shadow-sm font-black'
                    : isToday
                    ? isDark
                      ? 'bg-[#242529] text-white border border-[#3182F6]/40'
                      : 'bg-[#E8F3FF] text-[#1B64DA] border border-[#3182F6]/30'
                    : isDark
                    ? 'bg-[#101012] text-[#8B95A1] hover:text-white border border-[#2C2C2E]'
                    : 'bg-[#F2F4F6] text-[#6B7684] hover:text-[#191F28] border border-slate-200'
                }`}
              >
                {/* Today Indicator */}
                {isToday && (
                  <span
                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 text-[8px] font-black rounded-full whitespace-nowrap ${
                      isSelected
                        ? 'bg-white text-[#3182F6]'
                        : 'bg-[#3182F6] text-white'
                    }`}
                  >
                    오늘
                  </span>
                )}

                {/* Day of week */}
                <div className="flex flex-col items-center leading-none mt-1">
                  <span className={`text-[10px] font-mono tracking-wider ${isSelected ? 'text-white' : ''}`}>
                    {day.englishShort}
                  </span>
                  <span className={`text-xs sm:text-sm font-black mt-1 ${isSelected ? 'text-white' : ''}`}>
                    {day.dayName}
                  </span>
                </div>

                {/* Target Muscle Tag (Clean 2-letter, never truncated) */}
                <div className="mt-1 w-full flex items-center justify-center">
                  <span
                    className={`text-[10px] font-bold px-1 py-0.5 rounded-md whitespace-nowrap text-center ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : day.isRestDay
                        ? isDark ? 'bg-[#1C1C1E] text-[#6B7684]' : 'bg-slate-200 text-[#6B7684]'
                        : isDark ? 'bg-[#242529] text-[#B0B8C1]' : 'bg-white text-[#4E5968]'
                    }`}
                  >
                    {muscleText}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Routine Details Card */}
      <div
        className={`rounded-2xl p-4 sm:p-5 transition-colors ${
          isDark ? 'bg-[#101012] border border-[#2C2C2E]' : 'bg-[#F2F4F6] border border-slate-200'
        }`}
      >
        {/* Day Headline & Meta */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b ${
          isDark ? 'border-[#2C2C2E]' : 'border-slate-200'
        }`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <TdsBadge size="small" variant="weak" color="blue" isDark={isDark}>
                {activeDay.dayName}요일 계획
              </TdsBadge>
              {isTodayActive && (
                <TdsBadge size="small" variant="fill" color="blue" isDark={isDark} icon={<Sparkles className="w-3 h-3" />}>
                  오늘 할 운동
                </TdsBadge>
              )}
              {activeDay.isRestDay ? (
                <TdsBadge size="small" variant="weak" color="elephant" isDark={isDark}>
                  휴식일
                </TdsBadge>
              ) : (
                <TdsBadge size="small" variant="weak" color="teal" isDark={isDark}>
                  목표 부위 집중
                </TdsBadge>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight break-keep">
              {activeDay.title}
            </h3>
            <p className={`text-xs mt-0.5 break-keep ${isDark ? 'text-[#8B95A1]' : 'text-[#4E5968]'}`}>
              {activeDay.categoryDesc}
            </p>
          </div>

          {/* Time and Target Muscles */}
          <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1 flex-shrink-0">
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl border ${
              isDark ? 'bg-[#1C1C1E] border-[#2C2C2E] text-[#B0B8C1]' : 'bg-white border-slate-200 text-[#4E5968]'
            }`}>
              <Clock className="w-3.5 h-3.5 text-[#3182F6]" />
              <span className="font-bold">
                {activeDay.estimatedMinutes > 0 ? `${activeDay.estimatedMinutes}분` : '충분한 휴식'}
              </span>
            </div>
          </div>
        </div>

        {/* Routine Checklist Progress Bar */}
        {totalExercises > 0 && !activeDay.isRestDay && (
          <div className={`py-3 flex items-center justify-between gap-3 text-xs border-b ${
            isDark ? 'border-[#2C2C2E]' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C73C]" />
              <span className={isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}>진행 완료:</span>
              <strong className="font-bold">
                {completedCount} / {totalExercises} 종목 ({progressPercent}%)
              </strong>
            </div>
            {completedCount > 0 && (
              <button
                onClick={handleResetChecklist}
                className={`text-xs flex items-center gap-1 transition-colors ${
                  isDark ? 'text-[#8B95A1] hover:text-white' : 'text-[#8B95A1] hover:text-[#191F28]'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>체크 초기화</span>
              </button>
            )}
          </div>
        )}

        {/* Exercise List - TDS Mobile 2-Row Stacked Layout (Never Truncates!) */}
        <div className="mt-3 space-y-2.5">
          {activeDay.exercises.map((exercise, index) => {
            const isCompleted = !!completedExercises[exercise.id];
            const normalizedReps = exercise.reps.endsWith('회') || exercise.reps.endsWith('분')
              ? exercise.reps
              : `${exercise.reps}회`;

            return (
              <div
                key={exercise.id}
                onClick={() => handleToggleExercise(exercise.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col gap-2 ${
                  isCompleted
                    ? isDark
                      ? 'bg-[#1C1C1E]/60 border-[#2C2C2E] opacity-60'
                      : 'bg-white/60 border-slate-200 opacity-60'
                    : isDark
                    ? 'bg-[#1C1C1E] border-[#2C2C2E] hover:border-[#3A3B42]'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Row 1: Check Icon + Number + FULL Exercise Name + Action Button */}
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-[#00C73C] text-white'
                          : isDark
                          ? 'border-2 border-[#3A3B42]'
                          : 'border-2 border-slate-300'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>

                    <span className={`text-xs font-mono font-bold flex-shrink-0 ${isDark ? 'text-[#6B7684]' : 'text-[#8B95A1]'}`}>
                      0{index + 1}
                    </span>

                    {/* FULL Exercise Name - break-keep, NEVER truncated */}
                    <h4
                      className={`text-sm sm:text-base font-bold break-keep leading-snug flex-1 ${
                        isCompleted ? 'line-through text-[#8B95A1]' : isDark ? 'text-white' : 'text-[#191F28]'
                      }`}
                    >
                      {exercise.name}
                    </h4>
                  </div>

                  {/* Right: Record Button */}
                  {onSelectRoutineExercise && !activeDay.isRestDay && (
                    <TdsButton
                      size="small"
                      variant={isCompleted ? 'secondary' : 'weak'}
                      isDark={isDark}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoutineExercise(
                          exercise.id,
                          exercise.name,
                          (exercise.targetMuscle.includes('가슴') ? 'chest' :
                           exercise.targetMuscle.includes('등') ? 'back' :
                           exercise.targetMuscle.includes('하체') ? 'legs' :
                           exercise.targetMuscle.includes('어깨') ? 'shoulders' :
                           exercise.targetMuscle.includes('팔') || exercise.targetMuscle.includes('이두') || exercise.targetMuscle.includes('삼두') ? 'arms' : 'core') as any,
                          exercise.target1RMPercent ? Math.round(100 * (exercise.target1RMPercent / 100)) : 60,
                          parseInt(exercise.reps) || 10
                        );
                      }}
                    >
                      {isCompleted ? '완료됨' : '기록하기'}
                    </TdsButton>
                  )}
                </div>

                {/* Row 2: Target Muscle Badge + Sets x Reps + Rest time */}
                <div className="flex items-center gap-2 pl-7 flex-wrap">
                  <TdsBadge size="xsmall" variant="weak" color="elephant" isDark={isDark}>
                    {exercise.targetMuscle}
                  </TdsBadge>
                  <span className={`text-xs font-medium font-mono ${isDark ? 'text-[#8B95A1]' : 'text-[#4E5968]'}`}>
                    {exercise.sets}세트 · 세트당 {normalizedReps}
                  </span>
                  {exercise.restSeconds > 0 && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                      isDark ? 'bg-[#252528] text-[#8B95A1]' : 'bg-[#F2F4F6] text-[#6B7684]'
                    }`}>
                      휴식 {exercise.restSeconds >= 60 ? `${Math.floor(exercise.restSeconds / 60)}분 ${exercise.restSeconds % 60 > 0 ? `${exercise.restSeconds % 60}초` : ''}` : `${exercise.restSeconds}초`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
        <div className={`text-xs flex items-center gap-1.5 w-full sm:w-auto ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
          <Dumbbell className="w-4 h-4 text-[#3182F6]" />
          <span>
            {isTodayActive ? '오늘 추천 운동을 바로 시작할 수 있어요.' : '원하는 요일을 눌러 루틴을 미리 살펴보세요.'}
          </span>
        </div>

        {onStartRoutine && (
          <TdsButton
            size="medium"
            variant="primary"
            isDark={isDark}
            onClick={() => onStartRoutine(activeDay)}
            leftIcon={<Play className="w-4 h-4 fill-white" />}
          >
            {isTodayActive ? '오늘 운동 시작하기' : `${activeDay.dayName}요일 루틴으로 시작`}
          </TdsButton>
        )}
      </div>

      {/* 휴식 타이머 모달 */}
      <RestTimerModal
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        initialSeconds={timerRestDuration}
        completedSetNumber={timerSetNumber}
        exerciseName={timerExerciseName}
        themeMode={themeMode}
      />

      {/* 루틴 빌더 모달 */}
      <RoutineBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        currentSplit={splitList}
        onSaveSplit={(newSplit) => {
          if (onUpdateSplit) {
            onUpdateSplit(newSplit);
          }
        }}
        themeMode={themeMode}
      />
    </div>
  );
};
