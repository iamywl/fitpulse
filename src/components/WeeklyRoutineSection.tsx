import React, { useState } from 'react';
import { DayOfWeek, IWeeklyRoutineDay, IWeeklyRoutinePlan } from '../models/routine';
import { RoutineService } from '../services/routine/RoutineService';
import { CalendarDays, Dumbbell, Coffee, ArrowRight } from 'lucide-react';
import { TdsBadge, TdsButton } from './tds';

interface WeeklyRoutineSectionProps {
  onSelectRoutineExercise?: (exerciseId: string, exerciseName: string, category: any, targetWeight: number, targetReps: number) => void;
  isMobileView?: boolean;
}

export const WeeklyRoutineSection: React.FC<WeeklyRoutineSectionProps> = ({
  onSelectRoutineExercise,
  isMobileView = false,
}) => {
  const [weeklyPlan] = useState<IWeeklyRoutinePlan>(() => RoutineService.getWeeklyPlan());
  const todayKey = RoutineService.getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayKey);

  const dayOrder: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const currentDayData: IWeeklyRoutineDay = weeklyPlan.days[selectedDay];

  return (
    <div className="bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-[#2C2C2E] rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden transition-all">
      {/* Section Header */}
      <div className={`flex ${isMobileView ? 'flex-col gap-2' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} mb-6`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-[#3182F6]" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              이번 주 운동 계획
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            주간 분할 루틴을 확인하고, 오늘 요일에 배정된 운동을 시작해보세요
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <TdsBadge variant="weak" color="blue" size="small">
            {weeklyPlan.name}
          </TdsBadge>
        </div>
      </div>

      {/* 7-Day Selector Strip (월 ~ 일) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 p-1.5 bg-[#F2F4F6] dark:bg-[#252528] rounded-2xl mb-6">
        {dayOrder.map((dKey) => {
          const dayInfo = weeklyPlan.days[dKey];
          const isSelected = selectedDay === dKey;
          const isToday = todayKey === dKey;

          return (
            <button
              key={dKey}
              type="button"
              onClick={() => setSelectedDay(dKey)}
              className={`relative py-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-white dark:bg-[#3182F6] text-[#3182F6] dark:text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isToday && (
                <span className={`absolute -top-1 px-1.5 py-0.2 text-[8px] font-bold uppercase rounded-full ${
                  isSelected
                    ? 'bg-[#3182F6] text-white dark:bg-white dark:text-[#3182F6]'
                    : 'bg-blue-100 text-[#3182F6] dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  오늘
                </span>
              )}

              <span className="text-xs sm:text-sm font-bold leading-none mb-1">
                {dayInfo.koreanName}
              </span>

              <span className={`text-[10px] truncate max-w-full px-1 ${
                isSelected ? 'font-semibold' : dayInfo.isRestDay ? 'text-slate-400' : 'text-[#00BFA5]'
              }`}>
                {dayInfo.isRestDay ? '휴식' : dayInfo.title.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Routine Detail Card */}
      <div className="bg-[#F8F9FA] dark:bg-[#252528] rounded-2xl p-5 border border-slate-100 dark:border-transparent">
        {/* Header of the Day */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-[#333D4B]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TdsBadge variant="weak" color="blue" size="xsmall">
                {currentDayData.fullKoreanName}
              </TdsBadge>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {currentDayData.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{currentDayData.subtitle}</p>
          </div>

          {/* Target Muscles Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {currentDayData.targetMuscles.map(m => (
              <TdsBadge key={m} variant="weak" color="elephant" size="xsmall">
                #{m}
              </TdsBadge>
            ))}
          </div>
        </div>

        {/* Routine Exercises or Rest View */}
        {currentDayData.isRestDay ? (
          /* Rest Day View */
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mb-3">
              <Coffee className="w-6 h-6 text-amber-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">오늘은 몸이 쉬어가는 날이에요 ☕</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              근육이 회복되고 자라는 가장 중요한 시간이에요. 충분한 수면과 단백질을 챙겨드세요.
            </p>
          </div>
        ) : (
          /* Workout Day Planned Exercises */
          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 px-1">
              <span>오늘 할 운동 ({currentDayData.exercises.length}개 종목)</span>
              <span>목표 세트 × 횟수</span>
            </div>

            <div className="space-y-2">
              {currentDayData.exercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-transparent rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#3182F6] text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {ex.exerciseName}
                      </div>
                      <div className="text-xs text-slate-400">
                        기준 목표: <strong className="text-slate-700 dark:text-slate-200 font-mono-num">{ex.targetWeight}kg</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#3182F6] font-mono-num">
                        {ex.targetSets}세트 × {ex.targetReps}회
                      </div>
                    </div>

                    {onSelectRoutineExercise && (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectRoutineExercise(
                            ex.exerciseId,
                            ex.exerciseName,
                            ex.category,
                            ex.targetWeight,
                            ex.targetReps
                          )
                        }
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-[#252528] dark:hover:bg-[#333D4B] text-slate-600 dark:text-slate-300 transition-colors"
                        title="이 종목 기록기로 이동"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Button */}
            {onSelectRoutineExercise && currentDayData.exercises.length > 0 && (
              <div className="pt-2">
                <TdsButton
                  variant="primary"
                  size="large"
                  fullWidth
                  onClick={() => {
                    const firstEx = currentDayData.exercises[0];
                    if (firstEx) {
                      onSelectRoutineExercise(
                        firstEx.exerciseId,
                        firstEx.exerciseName,
                        firstEx.category,
                        firstEx.targetWeight,
                        firstEx.targetReps
                      );
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    <span>오늘 {currentDayData.title.split(' ')[0]} 운동 시작하기</span>
                  </div>
                </TdsButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
