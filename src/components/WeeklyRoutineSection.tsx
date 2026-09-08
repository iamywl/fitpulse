import React, { useState } from 'react';
import { DayOfWeek, IWeeklyRoutineDay, IWeeklyRoutinePlan } from '../models/routine';
import { RoutineService } from '../services/routine/RoutineService';
import { CalendarDays, Dumbbell, Coffee, ArrowRight } from 'lucide-react';

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
    <div className="bg-[#121217] border border-[#23232D] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4FF00]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className={`flex ${isMobileView ? 'flex-col gap-2' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} mb-5`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 text-[#D4FF00]" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              요일별 분할 루틴 스케줄
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            주간 분할 루틴을 확인하고, 오늘 요일에 배정된 운동 세트를 즉시 시작하세요.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#181820] text-slate-300 border border-[#23232D]">
            {weeklyPlan.name}
          </span>
        </div>
      </div>

      {/* 7-Day Selector Strip (월 ~ 일) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 p-1.5 bg-[#0A0A0E] rounded-2xl border border-[#23232D] mb-5">
        {dayOrder.map((dKey) => {
          const dayInfo = weeklyPlan.days[dKey];
          const isSelected = selectedDay === dKey;
          const isToday = todayKey === dKey;

          return (
            <button
              key={dKey}
              onClick={() => setSelectedDay(dKey)}
              className={`relative py-2.5 sm:py-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#D4FF00] text-black font-black shadow-lg shadow-[#D4FF00]/20 scale-[1.02]'
                  : 'bg-[#121217] hover:bg-[#181820] text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {/* Today Badge Indicator */}
              {isToday && (
                <span className={`absolute -top-1 px-1.5 py-0.2 text-[8px] font-black uppercase rounded-full tracking-wider ${
                  isSelected ? 'bg-black text-[#D4FF00]' : 'bg-[#D4FF00] text-black'
                }`}>
                  TODAY
                </span>
              )}

              <span className="text-xs sm:text-sm font-black leading-none mb-1">
                {dayInfo.koreanName}
              </span>

              <span className={`text-[9px] truncate max-w-full px-1 font-semibold leading-none ${
                isSelected ? 'text-black/80' : dayInfo.isRestDay ? 'text-slate-500' : 'text-[#38BDF8]'
              }`}>
                {dayInfo.isRestDay ? '휴식' : dayInfo.title.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Routine Detail Card */}
      <div className="bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-4 sm:p-5">
        {/* Header of the Day */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F1F2A]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#181820] text-[#D4FF00] border border-[#D4FF00]/30 font-mono-num">
                {currentDayData.fullKoreanName}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                {currentDayData.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400">{currentDayData.subtitle}</p>
          </div>

          {/* Target Muscles Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {currentDayData.targetMuscles.map(m => (
              <span
                key={m}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#181820] text-slate-300 border border-[#23232D]"
              >
                #{m}
              </span>
            ))}
          </div>
        </div>

        {/* Routine Exercises or Rest View */}
        {currentDayData.isRestDay ? (
          /* Rest Day View */
          <div className="py-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#181820] border border-[#23232D] flex items-center justify-center mb-3">
              <Coffee className="w-6 h-6 text-[#FFB703]" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">공식 회복 및 휴식일</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              근육 합성과 피로도 회복이 일어나는 가장 중요한 날입니다. 충분한 수면과 단백질 섭취를 권장합니다.
            </p>
          </div>
        ) : (
          /* Workout Day Planned Exercises */
          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
              <span>오늘 예정된 운동 ({currentDayData.exercises.length}개 종목)</span>
              <span>목표 세트 × 횟수</span>
            </div>

            <div className="space-y-2">
              {currentDayData.exercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="bg-[#121217] hover:bg-[#181820] border border-[#23232D] rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#0A0A0E] text-[#D4FF00] text-xs font-black flex items-center justify-center border border-[#23232D]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-sm text-white group-hover:text-[#D4FF00] transition-colors">
                        {ex.exerciseName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        기준 목표: <strong className="text-white font-mono-num">{ex.targetWeight}kg</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-black text-[#38BDF8] font-mono-num">
                        {ex.targetSets}세트 × {ex.targetReps}회
                      </div>
                    </div>

                    {onSelectRoutineExercise && (
                      <button
                        onClick={() =>
                          onSelectRoutineExercise(
                            ex.exerciseId,
                            ex.exerciseName,
                            ex.category,
                            ex.targetWeight,
                            ex.targetReps
                          )
                        }
                        className="p-2 rounded-xl bg-[#181820] hover:bg-[#D4FF00] text-slate-400 hover:text-black border border-[#23232D] transition-all"
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
              <button
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
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-[#D4FF00] to-[#A3E635] text-black font-black text-xs sm:text-sm shadow-lg shadow-[#D4FF00]/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Dumbbell className="w-4 h-4" />
                <span>오늘 {currentDayData.title.split(' ')[0]} 루틴으로 세트 시작하기</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
