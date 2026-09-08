import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy, TrendingUp, BarChart3, Activity } from 'lucide-react';

interface ExerciseAnalyticsSectionProps {
  workouts: WorkoutSession[];
  isMobileView?: boolean;
}

export const ExerciseAnalyticsSection: React.FC<ExerciseAnalyticsSectionProps> = ({
  workouts,
  isMobileView = false,
}) => {
  const availableExercises = useMemo(() => {
    const map = new Map<string, string>();
    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        if (!map.has(ex.exerciseId)) {
          map.set(ex.exerciseId, ex.exerciseName);
        }
      });
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [workouts]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    availableExercises[0]?.id || 'bench-press'
  );

  const exerciseData = useMemo(() => {
    const list: Array<{
      date: string;
      sessionTitle: string;
      maxWeight: number;
      bestReps: number;
      estimated1RM: number;
      volume: number;
      setsCount: number;
    }> = [];

    const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(w => {
      const match = w.exercises.find(e => e.exerciseId === selectedExerciseId);
      if (match) {
        let maxWeight = 0;
        let bestReps = 0;
        let best1RM = 0;
        let volume = 0;
        let completedSets = 0;

        match.sets.forEach(set => {
          if (set.completed) {
            completedSets++;
            volume += set.weight * set.reps;
            const current1RM = VolumeService.estimate1RM(set.weight, set.reps);
            if (current1RM > best1RM) {
              best1RM = current1RM;
              maxWeight = set.weight;
              bestReps = set.reps;
            }
          }
        });

        if (completedSets > 0) {
          list.push({
            date: w.date.slice(5),
            sessionTitle: w.title,
            maxWeight,
            bestReps,
            estimated1RM: best1RM,
            volume,
            setsCount: completedSets,
          });
        }
      }
    });

    return list;
  }, [workouts, selectedExerciseId]);

  const prStats = useMemo(() => {
    if (exerciseData.length === 0) return null;

    let max1RM = 0;
    let maxWeight = 0;
    let totalVol = 0;

    exerciseData.forEach(d => {
      if (d.estimated1RM > max1RM) max1RM = d.estimated1RM;
      if (d.maxWeight > maxWeight) maxWeight = d.maxWeight;
      totalVol += d.volume;
    });

    const firstRecord = exerciseData[0];
    const latestRecord = exerciseData[exerciseData.length - 1];
    const growth1RM = latestRecord.estimated1RM - firstRecord.estimated1RM;

    return {
      max1RM,
      maxWeight,
      totalVol,
      growth1RM,
      latest1RM: latestRecord.estimated1RM,
    };
  }, [exerciseData]);

  return (
    <div className="bg-[#121217] border border-[#23232D] rounded-3xl p-4 sm:p-6 shadow-2xl relative">
      {/* Header & Exercise Selector */}
      <div className={`flex ${isMobileView ? 'flex-col gap-3' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} gap-3 mb-5`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-[#D4FF00]" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              운동 종목별 성장 & 1RM 분석
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            종목별 추정 1RM과 세션별 누적 볼륨의 성장을 시각적으로 추적합니다.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className={`flex items-center gap-2 ${isMobileView ? 'w-full' : ''}`}>
          <label className="text-xs text-slate-300 font-bold whitespace-nowrap">종목:</label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className={`${
              isMobileView ? 'flex-1' : 'min-w-[180px]'
            } bg-[#0A0A0E] border border-[#23232D] text-white text-xs sm:text-sm font-black rounded-xl px-3 py-2 outline-none focus:border-[#D4FF00] cursor-pointer shadow-inner`}
          >
            {availableExercises.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PR Cards Row: 2x2 on Mobile, 4 columns on Desktop */}
      {prStats && (
        <div className={`grid ${isMobileView ? 'grid-cols-2 gap-2.5' : 'grid-cols-2 sm:grid-cols-4 gap-3'} mb-5`}>
          <div className="bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-3 sm:p-3.5">
            <div className="flex items-center gap-1 text-[#FFB703] text-[11px] font-bold mb-1 truncate">
              <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
              <span>최고 1RM (PR)</span>
            </div>
            <div className="text-xl font-black text-white font-mono-num">
              {prStats.max1RM} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>

          <div className="bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-3 sm:p-3.5">
            <div className="flex items-center gap-1 text-[#D4FF00] text-[11px] font-bold mb-1 truncate">
              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
              <span>1RM 성장폭</span>
            </div>
            <div className="text-xl font-black text-[#D4FF00] font-mono-num">
              {prStats.growth1RM >= 0 ? `+${prStats.growth1RM}` : prStats.growth1RM}{' '}
              <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>

          <div className="bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-3 sm:p-3.5">
            <div className="flex items-center gap-1 text-[#38BDF8] text-[11px] font-bold mb-1 truncate">
              <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>종목 누적 볼륨</span>
            </div>
            <div className="text-xl font-black text-white font-mono-num">
              {(prStats.totalVol / 1000).toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400">t</span>
            </div>
          </div>

          <div className="bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-3 sm:p-3.5">
            <div className="text-slate-400 text-[11px] font-bold mb-1 truncate">최근 추정 1RM</div>
            <div className="text-xl font-black text-slate-200 font-mono-num">
              {prStats.latest1RM} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>
        </div>
      )}

      {/* Dual Charts */}
      <div className={`grid ${isMobileView ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-5'}`}>
        {/* 1RM Trend Chart */}
        <div className="bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]" />
              추정 1RM 성장 곡선 (Epley)
            </h3>
            <span className="text-[10px] font-mono-num text-slate-400">kg 단위</span>
          </div>

          <div className="h-44 w-full">
            {exerciseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1c24" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0A0E',
                      borderColor: '#23232D',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                    formatter={(val: number) => [`${val} kg`, '추정 1RM']}
                    labelFormatter={(label) => `날짜: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="estimated1RM"
                    stroke="#D4FF00"
                    strokeWidth={2.5}
                    dot={{ fill: '#D4FF00', r: 3.5, strokeWidth: 1.5, stroke: '#0A0A0E' }}
                    activeDot={{ r: 5, fill: '#FFFFFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                기록 데이터 없음
              </div>
            )}
          </div>
        </div>

        {/* Volume per Session Bar Chart */}
        <div className="bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_6px_#38BDF8]" />
              세션별 해당 종목 총 볼륨
            </h3>
            <span className="text-[10px] font-mono-num text-slate-400">kg 단위</span>
          </div>

          <div className="h-44 w-full">
            {exerciseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exerciseData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1c24" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0A0E',
                      borderColor: '#23232D',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                    formatter={(val: number) => [`${VolumeService.formatKg(val)}`, '총 볼륨']}
                    labelFormatter={(label) => `날짜: ${label}`}
                  />
                  <Bar dataKey="volume" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                기록 데이터 없음
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
