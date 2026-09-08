import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { Calendar, Info, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeatmapSectionProps {
  workouts: WorkoutSession[];
  onSelectWorkout?: (workout: WorkoutSession) => void;
  onQuickLogToday?: () => void;
  isMobileView?: boolean;
}

export const HeatmapSection: React.FC<HeatmapSectionProps> = ({
  workouts,
  onSelectWorkout,
  onQuickLogToday,
  isMobileView = false,
}) => {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    workout?: WorkoutSession;
    x: number;
    y: number;
  } | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const heatmapData = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const totalDays = 16 * 7;
    const days: Array<{
      dateStr: string;
      dateObj: Date;
      workout?: WorkoutSession;
      level: number;
      volume: number;
      isToday: boolean;
    }> = [];

    const workoutMap = new Map<string, WorkoutSession>();
    workouts.forEach(w => {
      workoutMap.set(w.date, w);
    });

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const workout = workoutMap.get(dateStr);
      const volume = workout ? workout.totalVolume : 0;
      const level = VolumeService.getHeatmapLevel(volume);

      days.push({
        dateStr,
        dateObj: d,
        workout,
        level,
        volume,
        isToday: dateStr === todayStr,
      });
    }

    const weeks: Array<typeof days> = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return { days, weeks };
  }, [workouts, todayStr]);

  const stats = useMemo(() => {
    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((sum, w) => sum + w.totalVolume, 0);
    const avgVolume = totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0;

    return {
      totalWorkouts,
      totalVolume,
      avgVolume,
    };
  }, [workouts]);

  const getCellColorClass = (level: number, isToday: boolean) => {
    const baseToday = isToday ? 'ring-1.5 ring-[#FFB703] animate-pulse' : '';
    switch (level) {
      case 1:
        return `bg-[#182608] border-[#29420D] hover:ring-2 hover:ring-[#84CC16] ${baseToday}`;
      case 2:
        return `bg-[#4D7C0F] border-[#65A30D] hover:ring-2 hover:ring-[#A3E635] ${baseToday}`;
      case 3:
        return `bg-[#A3E635] border-[#BEF264] hover:ring-2 hover:ring-[#D4FF00] ${baseToday}`;
      case 4:
        return `bg-[#D4FF00] border-white shadow-[0_0_8px_rgba(212,255,0,0.85)] hover:ring-2 hover:ring-white ${baseToday}`;
      default:
        return `bg-[#0A0A0E] border-[#23232D] hover:border-slate-600 ${baseToday}`;
    }
  };

  const hasTodayWorkout = useMemo(() => {
    return workouts.some(w => w.date === todayStr);
  }, [workouts, todayStr]);

  return (
    <div className="bg-[#121217] border border-[#23232D] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Header & Quick Insights */}
      <div className={`flex ${isMobileView ? 'flex-col gap-3' : 'flex-col md:flex-row md:items-center md:justify-between'} gap-3 mb-4`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-[#D4FF00]" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              운동 활동 히트맵 (잔디 심기)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            꾸준한 출석과 운동 볼륨 강도에 따라 잔디의 색상이 짙어집니다.
          </p>
        </div>

        {/* Stats Row & Quick Today Action */}
        <div className="flex flex-wrap items-center gap-2">
          {onQuickLogToday && !hasTodayWorkout && (
            <button
              onClick={onQuickLogToday}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4FF00] text-black hover:bg-[#C2EB00] text-xs font-black transition-all shadow-md shadow-[#D4FF00]/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>오늘 잔디 심기</span>
            </button>
          )}

          {hasTodayWorkout && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#D4FF00]/15 border border-[#D4FF00]/30 text-[#D4FF00] text-xs font-black">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>오늘 잔디 완료!</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 bg-[#0A0A0E] p-1.5 sm:p-2 rounded-2xl border border-[#23232D]">
            <div className="text-center px-1">
              <div className="text-[10px] font-bold text-slate-400">운동일수</div>
              <div className="text-xs sm:text-sm font-black text-white font-mono-num">
                {stats.totalWorkouts}회
              </div>
            </div>
            <div className="text-center px-1 border-x border-[#23232D]">
              <div className="text-[10px] font-bold text-slate-400">누적 볼륨</div>
              <div className="text-xs sm:text-sm font-black text-[#D4FF00] font-mono-num">
                {(stats.totalVolume / 1000).toFixed(1)}t
              </div>
            </div>
            <div className="text-center px-1">
              <div className="text-[10px] font-bold text-slate-400">평균 볼륨</div>
              <div className="text-xs sm:text-sm font-black text-[#38BDF8] font-mono-num">
                {VolumeService.formatKg(stats.avgVolume)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Style Heatmap Grid */}
      <div className="relative">
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="min-w-[560px] flex gap-1 items-start">
            <div className="flex flex-col gap-1 text-[9px] text-slate-400 font-bold pr-1 pt-0.5 select-none">
              <div className="h-3 leading-none">일</div>
              <div className="h-3 leading-none">월</div>
              <div className="h-3 leading-none">화</div>
              <div className="h-3 leading-none">수</div>
              <div className="h-3 leading-none">목</div>
              <div className="h-3 leading-none">금</div>
              <div className="h-3 leading-none">토</div>
            </div>

            <div className="flex gap-1 flex-1">
              {heatmapData.weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1 flex-1">
                  {week.map(day => (
                    <button
                      key={day.dateStr}
                      onClick={() => day.workout && onSelectWorkout?.(day.workout)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDay({
                          date: day.dateStr,
                          workout: day.workout,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`h-3 w-full rounded-[2px] border transition-all cursor-pointer ${getCellColorClass(
                        day.level,
                        day.isToday
                      )}`}
                      aria-label={`${day.dateStr}: ${day.volume}kg`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="mt-2.5 pt-2.5 border-t border-[#23232D] flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>셀 클릭 시 운동 세부 내역 확인</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-semibold">Less</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0A0A0E] border border-[#23232D]" title="0 kg (휴식)" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#182608] border border-[#29420D]" title="< 5,000 kg (가벼운 운동)" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#4D7C0F] border border-[#65A30D]" title="5,000 ~ 12,000 kg (적정 강도)" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#A3E635] border border-[#BEF264]" title="12,000 ~ 20,000 kg (고강도)" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#D4FF00] border-white shadow-[0_0_6px_rgba(212,255,0,0.85)]" title="> 20,000 kg (극한 볼륨)" />
          </div>
          <span className="text-slate-400 font-semibold">More</span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-[#0A0A0E] border border-[#23232D] text-white text-xs px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-75"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 8}px`,
          }}
        >
          <div className="font-bold text-white mb-0.5 flex items-center gap-1.5">
            <span>{hoveredDay.date}</span>
            {hoveredDay.date === todayStr && (
              <span className="text-[9px] bg-[#D4FF00] text-black font-black px-1.5 py-0.2 rounded">오늘</span>
            )}
          </div>
          {hoveredDay.workout ? (
            <div>
              <div className="text-[#D4FF00] font-black font-mono-num">
                {VolumeService.formatKg(hoveredDay.workout.totalVolume)}
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                {hoveredDay.workout.title} ({hoveredDay.workout.exercises.length}개 종목)
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-[11px]">기록된 운동 없음 (휴식일)</div>
          )}
        </div>
      )}
    </div>
  );
};
