import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { Calendar, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { TdsBadge } from './tds/TdsBadge';
import { TdsButton } from './tds/TdsButton';

interface HeatmapSectionProps {
  workouts: WorkoutSession[];
  onSelectWorkout?: (workout: WorkoutSession) => void;
  onQuickLogToday?: () => void;
  isMobileView?: boolean;
  themeMode?: 'dark' | 'light';
}

export const HeatmapSection: React.FC<HeatmapSectionProps> = ({
  workouts,
  onSelectWorkout,
  onQuickLogToday,
  isMobileView = false,
  themeMode = 'light',
}) => {
  const isDark = themeMode === 'dark';
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

  // TDS 5-level calm Toss Blue cells
  const getCellColorClass = (level: number, isToday: boolean) => {
    const todayRing = isToday ? 'ring-2 ring-[#3182F6] z-10' : '';

    if (isDark) {
      switch (level) {
        case 1:
          return `bg-[#152945] border-[#1E3A61] hover:ring-2 hover:ring-[#3182F6]/50 ${todayRing}`;
        case 2:
          return `bg-[#1B477D] border-[#2560A6] hover:ring-2 hover:ring-[#3182F6]/70 ${todayRing}`;
        case 3:
          return `bg-[#2565B8] border-[#3182F6] hover:ring-2 hover:ring-[#3182F6] ${todayRing}`;
        case 4:
          return `bg-[#3182F6] border-[#5B9DF8] shadow-sm hover:ring-2 hover:ring-white ${todayRing}`;
        default:
          return `bg-[#1C1C1E] border-[#2C2C2E] hover:border-[#3A3B42] ${todayRing}`;
      }
    } else {
      switch (level) {
        case 1:
          return `bg-[#B9D5FD] border-[#93BEFC] hover:ring-2 hover:ring-[#3182F6]/40 ${todayRing}`;
        case 2:
          return `bg-[#75ABF8] border-[#5094F7] hover:ring-2 hover:ring-[#3182F6]/60 ${todayRing}`;
        case 3:
          return `bg-[#3182F6] border-[#1B64DA] hover:ring-2 hover:ring-[#1552B5] ${todayRing}`;
        case 4:
          return `bg-[#1B64DA] border-[#1552B5] shadow-sm hover:ring-2 hover:ring-black ${todayRing}`;
        default:
          return `bg-[#E5E8EB] border-[#D1D6DB] hover:border-slate-400 ${todayRing}`;
      }
    }
  };

  const hasTodayWorkout = useMemo(() => {
    return workouts.some(w => w.date === todayStr);
  }, [workouts, todayStr]);

  return (
    <div
      className={`rounded-3xl p-4 sm:p-6 transition-all ${
        isDark
          ? 'bg-[#1C1C1E] border border-[#2C2C2E] text-white'
          : 'bg-white border border-slate-200 shadow-sm text-[#191F28]'
      }`}
    >
      {/* Header & Quick Insights */}
      <div className={`flex ${isMobileView ? 'flex-col gap-3' : 'flex-col md:flex-row md:items-center md:justify-between'} gap-3 mb-4`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-[#3182F6]" />
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              차곡차곡 쌓인 내 운동 기록
            </h2>
            <TdsBadge size="xsmall" variant="weak" color="blue" isDark={isDark}>
              16주 기록
            </TdsBadge>
          </div>
          <p className={`text-xs ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
            꾸준히 운동한 날들이 모여 성장이 돼요
          </p>
        </div>

        {/* Stats Row & Quick Today Action */}
        <div className="flex flex-wrap items-center gap-2">
          {onQuickLogToday && !hasTodayWorkout && (
            <TdsButton
              size="small"
              variant="primary"
              isDark={isDark}
              onClick={onQuickLogToday}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              오늘 잔디 심기
            </TdsButton>
          )}

          {hasTodayWorkout && (
            <TdsBadge size="medium" variant="weak" color="green" isDark={isDark} icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#00C73C]" />}>
              오늘 운동 완료!
            </TdsBadge>
          )}

          <div
            className={`grid grid-cols-3 gap-2 p-2 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#101012] border-[#2C2C2E]' : 'bg-[#F2F4F6] border-slate-200'
            }`}
          >
            <div className="text-center px-2">
              <div className={`text-[10px] font-semibold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>운동 일수</div>
              <div className="text-xs sm:text-sm font-black font-mono-num">
                {stats.totalWorkouts}회
              </div>
            </div>
            <div className={`text-center px-2 border-x ${isDark ? 'border-[#2C2C2E]' : 'border-slate-200'}`}>
              <div className={`text-[10px] font-semibold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>누적 볼륨</div>
              <div className="text-xs sm:text-sm font-black font-mono-num text-[#3182F6]">
                {(stats.totalVolume / 1000).toFixed(1)}t
              </div>
            </div>
            <div className="text-center px-2">
              <div className={`text-[10px] font-semibold ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>평균 볼륨</div>
              <div className="text-xs sm:text-sm font-black font-mono-num">
                {VolumeService.formatKg(stats.avgVolume)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Banner */}
      {workouts.length === 0 && (
        <div className={`p-4 mb-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'bg-[#101012] border-[#2C2C2E] text-[#8B95A1]' : 'bg-[#F2F4F6] border-slate-200 text-[#4E5968]'
        }`}>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#3182F6] flex-shrink-0" />
            <span>아직 저장된 운동 기록이 없어요. 오늘 운동을 시작해 첫 번째 잔디를 채워보세요!</span>
          </div>
          {onQuickLogToday && (
            <TdsButton size="small" variant="weak" isDark={isDark} onClick={onQuickLogToday}>
              오늘 운동 기록하기
            </TdsButton>
          )}
        </div>
      )}

      {/* GitHub/TDS Style Activity Heatmap Grid */}
      <div className="relative">
        <div className="overflow-x-auto pb-2 no-scrollbar">
          <div className="min-w-[560px] flex gap-1 items-start">
            <div className={`flex flex-col gap-1 text-[9px] font-bold pr-1 pt-0.5 select-none ${isDark ? 'text-[#6B7684]' : 'text-[#8B95A1]'}`}>
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
                      className={`h-3 w-full rounded-[3px] border transition-all cursor-pointer ${getCellColorClass(
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
      <div className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
        isDark ? 'border-[#2C2C2E] text-[#8B95A1]' : 'border-slate-200 text-[#6B7684]'
      }`}>
        <div className="flex items-center gap-1.5 text-[11px]">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>네모 칸을 누르면 그날의 운동 기록을 볼 수 있어요</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="font-semibold">적음</span>
          <div className="flex items-center gap-1">
            {isDark ? (
              <>
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1C1C1E] border border-[#2C2C2E]" title="0 kg (휴식)" />
                <span className="w-2.5 h-2.5 rounded-sm bg-[#152945] border border-[#1E3A61]" title="< 5,000 kg (가벼운 운동)" />
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1B477D] border border-[#2560A6]" title="5,000 ~ 12,000 kg (적정 강도)" />
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2565B8] border border-[#3182F6]" title="12,000 ~ 20,000 kg (고강도)" />
                <span className="w-2.5 h-2.5 rounded-sm bg-[#3182F6] border-[#5B9DF8]" title="> 20,000 kg (최고 볼륨)" />
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-sm bg-[#E5E8EB] border border-[#D1D6DB]" title="0 kg (휴식)" />
                <span className="w-2.5 h-2.5 rounded-sm bg-[#B9D5FD] border border-[#93BEFC]" title="< 5,000 kg (가벼운 운동)" />
                <span className="w-2.5 h-2.5 rounded-sm bg-[#75ABF8] border border-[#5094F7]" title="5,000 ~ 12,000 kg (적정 강도)" />
                <span className="w-2.5 h-2.5 rounded-sm bg-[#3182F6] border-[#1B64DA]" title="12,000 ~ 20,000 kg (고강도)" />
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1B64DA] border-[#1552B5]" title="> 20,000 kg (최고 볼륨)" />
              </>
            )}
          </div>
          <span className="font-semibold">많음</span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredDay && (
        <div
          className={`fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 text-xs px-3.5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md transition-all duration-75 border ${
            isDark
              ? 'bg-[#1C1C1E]/95 border-[#2C2C2E] text-white shadow-black/60'
              : 'bg-white/95 border-slate-200 text-[#191F28] shadow-slate-200/80'
          }`}
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 8}px`,
          }}
        >
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <span>{hoveredDay.date}</span>
            {hoveredDay.date === todayStr && (
              <TdsBadge size="xsmall" variant="fill" color="blue">
                오늘
              </TdsBadge>
            )}
          </div>
          {hoveredDay.workout ? (
            <div>
              <div className="font-black text-sm text-[#3182F6]">
                {VolumeService.formatKg(hoveredDay.workout.totalVolume)}
              </div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-[#8B95A1]' : 'text-[#4E5968]'}`}>
                {hoveredDay.workout.title} ({hoveredDay.workout.exercises.length}개 종목)
              </div>
            </div>
          ) : (
            <div className={`text-xs ${isDark ? 'text-[#8B95A1]' : 'text-[#8B95A1]'}`}>
              기록된 운동 없음 (휴식일)
            </div>
          )}
        </div>
      )}
    </div>
  );
};
