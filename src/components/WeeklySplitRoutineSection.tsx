import React, { useState } from 'react';
import { IWeeklySplitDay } from '../models/fitness';
import { DEFAULT_WEEKLY_SPLIT } from '../data/splitRoutineData';
import { 
  CalendarDays, 
  Clock, 
  Target, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Zap, 
  Dumbbell, 
  Info, 
  Play,
  RotateCcw
} from 'lucide-react';

interface WeeklySplitRoutineSectionProps {
  onStartRoutine?: (splitDay: IWeeklySplitDay) => void;
  onSelectRoutineExercise?: (exerciseId: string, exerciseName: string, category: any, targetWeight: number, targetReps: number) => void;
  onQuickLog?: () => void;
  isMobileView?: boolean;
}

export const WeeklySplitRoutineSection: React.FC<WeeklySplitRoutineSectionProps> = ({
  onStartRoutine,
  onSelectRoutineExercise,
  onQuickLog,
  isMobileView = false,
}) => {
  // 0: Sun, 1: Mon, ..., 6: Sat
  const currentDayIndex = new Date().getDay();

  // Active selected day (default to today)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(currentDayIndex);

  // Completed exercise toggle state in current session
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  // Active routine split list
  const [splitList] = useState<IWeeklySplitDay[]>(DEFAULT_WEEKLY_SPLIT);

  // Re-order to Monday first: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  const orderedSplitList = [
    ...splitList.filter(d => d.dayIndex !== 0),
    ...splitList.filter(d => d.dayIndex === 0),
  ];

  // Find currently selected day
  const activeDay = splitList.find(d => d.dayIndex === selectedDayIndex) || splitList[0];
  const isTodayActive = activeDay.dayIndex === currentDayIndex;

  // Toggle exercise completion
  const handleToggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  // Reset exercise completion
  const handleResetChecklist = () => {
    setCompletedExercises({});
  };

  // Progress percentage for active day
  const totalExercises = activeDay.exercises.length;
  const completedCount = activeDay.exercises.filter(ex => completedExercises[ex.id]).length;
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  return (
    <div className={`bg-[#111115] border border-[#272732] rounded-3xl ${isMobileView ? 'p-3' : 'p-3.5 sm:p-5'} shadow-2xl relative overflow-hidden`}>
      {/* Top Ambient Glow / Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-70" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(204,255,0,0.2)]">
            <CalendarDays className="w-5 h-5 text-[#CCFF00]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                주간 분할 루틴 플래너
              </h2>
              <span className="bg-[#CCFF00] text-[#09090B] text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 tracking-wider">
                WEEKLY SPLIT
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] truncate">
              Apple & Nike Pro 규격 요일별 타겟 분할 및 점진적 과부하 설계
            </p>
          </div>
        </div>

        {/* Action button */}
        {onQuickLog && (
          <button
            onClick={onQuickLog}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#18181F] text-[#CCFF00] border border-[#CCFF00]/30 hover:bg-[#CCFF00]/10 transition-all flex-shrink-0 min-h-[38px]"
          >
            <Zap className="w-3.5 h-3.5 fill-[#CCFF00]" />
            <span>오늘 완료</span>
          </button>
        )}
      </div>

      {/* 7-Day Apple/Whoop Style Horizontal Strip Selector */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B] mb-2 px-1">
          <span>요일 선택 (DAY OF WEEK)</span>
          <span className="text-[#94A3B8]">
            오늘:{' '}
            <strong className="text-[#CCFF00]">
              {['일', '월', '화', '수', '목', '금', '토'][currentDayIndex]}요일
            </strong>
          </span>
        </div>

        {/* Horizontal Days Scroll / Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {orderedSplitList.map((day) => {
            const isToday = day.dayIndex === currentDayIndex;
            const isSelected = day.dayIndex === selectedDayIndex;

            return (
              <button
                key={day.dayKey}
                onClick={() => setSelectedDayIndex(day.dayIndex)}
                className={`flex flex-col items-center justify-center py-2 sm:py-2.5 px-0.5 rounded-2xl transition-all relative min-h-[58px] min-w-[38px] ${
                  isSelected
                    ? 'bg-[#18181F] border-2 border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                    : 'bg-[#18181F]/60 border border-[#272732] hover:border-[#3F3F50] hover:bg-[#18181F]'
                }`}
              >
                {/* Today Indicator Dot / Badge */}
                {isToday && (
                  <span className="absolute -top-1.5 px-1 bg-[#CCFF00] text-[#09090B] text-[8px] font-black rounded-full leading-tight shadow-sm scale-90 sm:scale-100">
                    TODAY
                  </span>
                )}

                <span
                  className={`text-[10px] sm:text-xs font-mono font-bold tracking-wider ${
                    isSelected
                      ? 'text-[#CCFF00]'
                      : isToday
                      ? 'text-white'
                      : 'text-[#64748B]'
                  }`}
                >
                  {day.englishShort}
                </span>

                <span
                  className={`text-xs sm:text-sm font-black mt-0.5 ${
                    isSelected
                      ? 'text-white'
                      : isToday
                      ? 'text-[#CCFF00]'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  {day.dayName}
                </span>

                {/* Bottom status chip */}
                <div className="mt-1">
                  {day.isRestDay ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#64748B] block" />
                  ) : day.colorType === 'volt' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] shadow-[0_0_4px_#CCFF00] block" />
                  ) : day.colorType === 'crimson' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF334B] shadow-[0_0_4px_#FF334B] block" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] shadow-[0_0_4px_#00B4D8] block" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Routine Details Card */}
      <div className="bg-[#18181F] border border-[#272732] rounded-2xl p-3.5 sm:p-4 mb-3 transition-all">
        {/* Day Headline & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#272732]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold text-[#CCFF00] px-2 py-0.5 rounded-md bg-[#CCFF00]/10 border border-[#CCFF00]/20">
                {activeDay.englishShort} · {activeDay.dayName}요일
              </span>
              {isTodayActive && (
                <span className="bg-[#CCFF00] text-[#09090B] text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  <span>오늘 진행할 분할</span>
                </span>
              )}
              {activeDay.isRestDay ? (
                <span className="bg-[#272732] text-[#94A3B8] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  RECOVERY DAY
                </span>
              ) : (
                <span className="bg-[#00B4D8]/10 text-[#38BDF8] border border-[#00B4D8]/20 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>TARGETED FOCUS</span>
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              {activeDay.title}
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {activeDay.categoryDesc}
            </p>
          </div>

          {/* Time and Target Muscles */}
          <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] bg-[#111115] px-2.5 py-1 rounded-xl border border-[#272732]">
              <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span className="font-mono-num font-bold text-white">
                {activeDay.estimatedMinutes > 0 ? `${activeDay.estimatedMinutes}분` : '충분한 수면'}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {activeDay.targetMuscles.map((muscle, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#272732] text-slate-300"
                >
                  #{muscle}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Routine Checklist Progress Bar (when exercises exist) */}
        {totalExercises > 0 && !activeDay.isRestDay && (
          <div className="py-2.5 flex items-center justify-between gap-3 text-xs border-b border-[#272732]/60">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>진행 완료:</span>
              <strong className="text-white font-mono-num">
                {completedCount} / {totalExercises} 종목 ({progressPercent}%)
              </strong>
            </div>
            {completedCount > 0 && (
              <button
                onClick={handleResetChecklist}
                className="text-[11px] text-[#64748B] hover:text-[#94A3B8] flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>체크 초기화</span>
              </button>
            )}
          </div>
        )}

        {/* Exercise List */}
        <div className="mt-3 space-y-2">
          {activeDay.exercises.map((exercise, index) => {
            const isCompleted = !!completedExercises[exercise.id];

            return (
              <div
                key={exercise.id}
                onClick={() => handleToggleExercise(exercise.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-[#111115]/80 border-[#272732] opacity-75'
                    : 'bg-[#111115] border-[#272732] hover:border-[#3F3F50]'
                }`}
              >
                {/* Left: Check icon + Details */}
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    className="mt-0.5 text-[#94A3B8] hover:text-[#CCFF00] transition-colors flex-shrink-0"
                    aria-label="세트 완료 토글"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#CCFF00] fill-[#CCFF00]/10" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#64748B]" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-[#64748B]">
                        0{index + 1}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-black truncate ${
                          isCompleted ? 'text-[#94A3B8] line-through' : 'text-white'
                        }`}
                      >
                        {exercise.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#272732] text-[#94A3B8] font-medium">
                        {exercise.targetMuscle}
                      </span>
                      {exercise.target1RMPercent && (
                        <span className="text-[10px] font-mono font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-1.5 py-0.2 rounded border border-[#CCFF00]/20">
                          {exercise.target1RMPercent}% 1RM
                        </span>
                      )}
                    </div>

                    {/* Pro Tip */}
                    {exercise.tip && (
                      <p className="text-[11px] text-[#94A3B8] mt-1 flex items-center gap-1.5 line-clamp-2">
                        <Info className="w-3 h-3 text-[#00B4D8] flex-shrink-0" />
                        <span>{exercise.tip}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Sets x Reps + Rest Time */}
                <div className="flex flex-col items-end justify-center flex-shrink-0 pl-1 gap-1">
                  <div className="bg-[#18181F] border border-[#272732] px-2 py-1 rounded-lg text-right">
                    <span className="text-xs font-mono font-black text-white">
                      {exercise.sets}세트
                    </span>
                    <span className="text-[11px] text-[#94A3B8] ml-1 font-mono">
                      × {exercise.reps}
                    </span>
                  </div>
                  {onSelectRoutineExercise && !activeDay.isRestDay && (
                    <button
                      type="button"
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
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#272732] hover:bg-[#CCFF00] hover:text-[#09090B] text-[#94A3B8] transition-all"
                    >
                      세트 기입 →
                    </button>
                  )}
                  {exercise.restSeconds > 0 && (
                    <span className="text-[10px] text-[#64748B] font-mono">
                      휴식 {exercise.restSeconds}초
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA / Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
        <div className="text-xs text-[#94A3B8] flex items-center gap-1.5 w-full sm:w-auto">
          <Dumbbell className="w-3.5 h-3.5 text-[#CCFF00]" />
          <span>
            {isTodayActive ? '오늘 추천 운동이 즉시 세트 매니저와 연동됩니다.' : '원하는 요일을 탭하여 루틴을 사전 점검하세요.'}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onStartRoutine && (
            <button
              onClick={() => onStartRoutine(activeDay)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#CCFF00] text-[#09090B] hover:bg-[#D4FF00] active:scale-[0.98] transition-all shadow-[0_0_16px_rgba(204,255,0,0.3)] min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-[#09090B]" />
              <span>{isTodayActive ? '오늘 루틴 운동 시작' : `${activeDay.dayName}요일 루틴 선택`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
