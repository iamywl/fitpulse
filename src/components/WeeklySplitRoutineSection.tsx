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
  Play,
  RotateCcw
} from 'lucide-react';

import { ThemeMode } from '../theme/pantone';
import { AudioAlertService } from '../services/sound/AudioAlertService';
import { RestTimerModal } from './RestTimerModal';

interface WeeklySplitRoutineSectionProps {
  onStartRoutine?: (splitDay: IWeeklySplitDay) => void;
  onSelectRoutineExercise?: (exerciseId: string, exerciseName: string, category: any, targetWeight: number, targetReps: number) => void;
  onQuickLog?: () => void;
  isMobileView?: boolean;
  themeMode?: ThemeMode;
}

export const WeeklySplitRoutineSection: React.FC<WeeklySplitRoutineSectionProps> = ({
  onStartRoutine,
  onSelectRoutineExercise,
  onQuickLog,
  isMobileView = false,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';
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

  return (
    <div
      className={`border rounded-3xl ${
        isMobileView ? 'p-3.5' : 'p-4 sm:p-5'
      } shadow-xl relative overflow-hidden transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-100'
          : 'bg-[#111115] border-[#272732] text-white shadow-2xl'
      }`}
    >
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] ${
          isLight
            ? 'bg-gradient-to-r from-transparent via-lime-500 to-transparent'
            : 'bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent opacity-80'
        }`}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-4 pt-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
              isLight
                ? 'bg-lime-50 border-lime-200 text-lime-700'
                : 'bg-[#CCFF00]/10 border-[#CCFF00]/30 text-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.2)]'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className={`text-base sm:text-lg font-black tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                주간 분할 루틴
              </h2>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 tracking-wider ${
                  isLight
                    ? 'bg-[#D4FF00] text-[#09090B] border border-lime-400'
                    : 'bg-[#CCFF00] text-[#09090B]'
                }`}
              >
                WEEKLY SPLIT
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        {onQuickLog && (
          <button
            onClick={onQuickLog}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex-shrink-0 min-h-[38px] ${
              isLight
                ? 'bg-lime-50 text-lime-800 border-lime-300 hover:bg-lime-100'
                : 'bg-[#18181F] text-[#CCFF00] border-[#CCFF00]/30 hover:bg-[#CCFF00]/10'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isLight ? 'fill-lime-600 text-lime-600' : 'fill-[#CCFF00] text-[#CCFF00]'}`} />
            <span>오늘 완료</span>
          </button>
        )}
      </div>

      {/* 7-Day Apple/Whoop Style Horizontal Strip Selector */}
      <div className="mb-4">
        <div className={`flex items-center justify-between text-[11px] font-semibold mb-2 px-1 ${isLight ? 'text-slate-500' : 'text-[#64748B]'}`}>
          <span>요일 선택 (DAY OF WEEK)</span>
          <span className={isLight ? 'text-slate-600' : 'text-[#94A3B8]'}>
            오늘:{' '}
            <strong className={isLight ? 'text-lime-700' : 'text-[#CCFF00]'}>
              {['일', '월', '화', '수', '목', '금', '토'][currentDayIndex]}요일
            </strong>
          </span>
        </div>

        {/* Horizontal Days Scroll / Grid with extra top padding so badge never clips */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2">
          {orderedSplitList.map((day) => {
            const isToday = day.dayIndex === currentDayIndex;
            const isSelected = day.dayIndex === selectedDayIndex;

            return (
              <button
                key={day.dayKey}
                onClick={() => setSelectedDayIndex(day.dayIndex)}
                className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-2xl transition-all relative min-h-[60px] min-w-[36px] ${
                  isSelected
                    ? isLight
                      ? 'bg-white border-2 border-lime-600 shadow-md shadow-lime-500/10'
                      : 'bg-[#18181F] border-2 border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                    : isLight
                    ? 'bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    : 'bg-[#18181F]/60 border border-[#272732] hover:border-[#3F3F50] hover:bg-[#18181F]'
                }`}
              >
                {/* Today Indicator Dot / Badge - properly positioned with no clipping */}
                {isToday && (
                  <span
                    className={`absolute -top-2.5 px-1.5 py-0.5 text-[8px] font-black rounded-full leading-tight shadow-sm ${
                      isLight
                        ? 'bg-[#D4FF00] text-black border border-lime-400'
                        : 'bg-[#CCFF00] text-[#09090B]'
                    }`}
                  >
                    TODAY
                  </span>
                )}

                <span
                  className={`text-[10px] sm:text-xs font-mono font-bold tracking-wider ${
                    isSelected
                      ? isLight ? 'text-lime-700' : 'text-[#CCFF00]'
                      : isToday
                      ? isLight ? 'text-slate-900 font-black' : 'text-white'
                      : isLight ? 'text-slate-500' : 'text-[#64748B]'
                  }`}
                >
                  {day.englishShort}
                </span>

                <span
                  className={`text-xs sm:text-sm font-black mt-0.5 ${
                    isSelected
                      ? isLight ? 'text-slate-900' : 'text-white'
                      : isToday
                      ? isLight ? 'text-lime-700' : 'text-[#CCFF00]'
                      : isLight ? 'text-slate-700' : 'text-[#94A3B8]'
                  }`}
                >
                  {day.dayName}
                </span>

                {/* Bottom status chip */}
                <div className="mt-1">
                  {day.isRestDay ? (
                    <span className={`w-1.5 h-1.5 rounded-full block ${isLight ? 'bg-slate-300' : 'bg-[#64748B]'}`} />
                  ) : day.colorType === 'volt' ? (
                    <span className={`w-1.5 h-1.5 rounded-full block ${isLight ? 'bg-lime-600' : 'bg-[#CCFF00] shadow-[0_0_4px_#CCFF00]'}`} />
                  ) : day.colorType === 'crimson' ? (
                    <span className={`w-1.5 h-1.5 rounded-full block ${isLight ? 'bg-red-500' : 'bg-[#FF334B] shadow-[0_0_4px_#FF334B]'}`} />
                  ) : (
                    <span className={`w-1.5 h-1.5 rounded-full block ${isLight ? 'bg-sky-500' : 'bg-[#00B4D8] shadow-[0_0_4px_#00B4D8]'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Routine Details Card */}
      <div
        className={`border rounded-2xl p-3.5 sm:p-4 mb-3 transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#18181F] border-[#272732]'
        }`}
      >
        {/* Day Headline & Meta */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#272732]'}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                  isLight
                    ? 'bg-lime-50 text-lime-800 border-lime-200'
                    : 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/20'
                }`}
              >
                {activeDay.englishShort} · {activeDay.dayName}요일
              </span>
              {isTodayActive && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm ${
                    isLight
                      ? 'bg-[#D4FF00] text-black border border-lime-400'
                      : 'bg-[#CCFF00] text-[#09090B]'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>오늘 진행할 분할</span>
                </span>
              )}
              {activeDay.isRestDay ? (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    isLight ? 'bg-slate-200 text-slate-700' : 'bg-[#272732] text-[#94A3B8]'
                  }`}
                >
                  RECOVERY DAY
                </span>
              ) : (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    isLight
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : 'bg-[#00B4D8]/10 text-[#38BDF8] border border-[#00B4D8]/20'
                  }`}
                >
                  <Target className="w-3 h-3" />
                  <span>TARGETED FOCUS</span>
                </span>
              )}
            </div>
            <h3 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {activeDay.title}
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
              {activeDay.categoryDesc}
            </p>
          </div>

          {/* Time and Target Muscles */}
          <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1 flex-shrink-0">
            <div
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl border ${
                isLight
                  ? 'bg-white text-slate-600 border-slate-200'
                  : 'bg-[#111115] text-[#94A3B8] border-[#272732]'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-[#CCFF00]'}`} />
              <span className={`font-mono-num font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {activeDay.estimatedMinutes > 0 ? `${activeDay.estimatedMinutes}분` : '충분한 수면'}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {activeDay.targetMuscles.map((muscle, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isLight
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-[#272732] text-slate-300'
                  }`}
                >
                  #{muscle}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Routine Checklist Progress Bar (when exercises exist) */}
        {totalExercises > 0 && !activeDay.isRestDay && (
          <div className={`py-2.5 flex items-center justify-between gap-3 text-xs border-b ${isLight ? 'border-slate-200' : 'border-[#272732]/60'}`}>
            <div className={`flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-[#CCFF00]'}`} />
              <span>진행 완료:</span>
              <strong className={`font-mono-num ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {completedCount} / {totalExercises} 종목 ({progressPercent}%)
              </strong>
            </div>
            {completedCount > 0 && (
              <button
                onClick={handleResetChecklist}
                className={`text-[11px] flex items-center gap-1 transition-colors ${
                  isLight ? 'text-slate-500 hover:text-slate-800' : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
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
                    ? isLight
                      ? 'bg-slate-100/70 border-slate-200 opacity-75'
                      : 'bg-[#111115]/80 border-[#272732] opacity-75'
                    : isLight
                    ? 'bg-white border-slate-200 hover:border-lime-500/40 hover:bg-slate-50/80 shadow-sm'
                    : 'bg-[#111115] border-[#272732] hover:border-[#3F3F50]'
                }`}
              >
                {/* Left: Check icon + Details */}
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    className="mt-0.5 transition-colors flex-shrink-0"
                    aria-label="세트 완료 토글"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className={`w-5 h-5 ${isLight ? 'text-lime-600' : 'text-[#CCFF00] fill-[#CCFF00]/10'}`} />
                    ) : (
                      <Circle className={`w-5 h-5 ${isLight ? 'text-slate-400' : 'text-[#64748B]'}`} />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-mono font-bold ${isLight ? 'text-slate-400' : 'text-[#64748B]'}`}>
                        0{index + 1}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-black truncate ${
                          isCompleted
                            ? isLight ? 'text-slate-400 line-through' : 'text-[#94A3B8] line-through'
                            : isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {exercise.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-[#272732] text-[#94A3B8]'
                        }`}
                      >
                        {exercise.targetMuscle}
                      </span>
                      {exercise.target1RMPercent && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            isLight
                              ? 'bg-lime-50 text-lime-800 border-lime-300'
                              : 'text-[#CCFF00] bg-[#CCFF00]/10 border-[#CCFF00]/20'
                          }`}
                        >
                          {exercise.target1RMPercent}% 1RM
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Sets x Reps + Rest Time */}
                <div className="flex flex-col items-end justify-center flex-shrink-0 pl-1 gap-1">
                  <div
                    className={`border px-2.5 py-1 rounded-lg text-right ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#18181F] border-[#272732]'
                    }`}
                  >
                    <span className={`text-xs font-mono font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {exercise.sets}세트
                    </span>
                    <span className={`text-[11px] ml-1 font-mono ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
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
                      className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                        isLight
                          ? 'bg-slate-100 hover:bg-[#D4FF00] hover:text-black text-slate-700 border border-slate-200'
                          : 'bg-[#272732] hover:bg-[#CCFF00] hover:text-[#09090B] text-[#94A3B8]'
                      }`}
                    >
                      세트 기입 →
                    </button>
                  )}
                  {exercise.restSeconds > 0 && (
                    <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-[#64748B]'}`}>
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
        <div className={`text-xs flex items-center gap-1.5 w-full sm:w-auto ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
          <Dumbbell className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-[#CCFF00]'}`} />
          <span>
            {isTodayActive ? '오늘 추천 운동이 즉시 세트 매니저와 연동됩니다.' : '원하는 요일을 탭하여 루틴을 사전 점검하세요.'}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onStartRoutine && (
            <button
              onClick={() => onStartRoutine(activeDay)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#CCFF00] text-[#09090B] hover:bg-[#D4FF00] active:scale-[0.98] transition-all shadow-md shadow-[#CCFF00]/20 min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-[#09090B]" />
              <span>{isTodayActive ? '오늘 루틴 운동 시작' : `${activeDay.dayName}요일 루틴 선택`}</span>
            </button>
          )}
        </div>
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
    </div>
  );
};

