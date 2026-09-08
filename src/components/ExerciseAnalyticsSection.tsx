import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Trophy, TrendingUp, BarChart3, Activity } from 'lucide-react';

import { ThemeMode } from '../theme/pantone';

interface ExerciseAnalyticsSectionProps {
  workouts: WorkoutSession[];
  isMobileView?: boolean;
  themeMode?: ThemeMode;
}

export const ExerciseAnalyticsSection: React.FC<ExerciseAnalyticsSectionProps> = ({
  workouts,
  isMobileView = false,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';
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
    <div
      className={`border rounded-3xl p-4 sm:p-6 shadow-xl relative transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-100'
          : 'bg-[#121217] border-[#272732] text-white shadow-2xl'
      }`}
    >
      {/* Header & Exercise Selector */}
      <div className={`flex ${isMobileView ? 'flex-col gap-3' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} gap-3 mb-5`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className={`w-5 h-5 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`} />
            <h2 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              운동 종목별 성장 & 1RM 분석
            </h2>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            종목별 추정 1RM과 세션별 누적 볼륨의 성장을 시각적으로 추적합니다.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className={`flex items-center gap-2 ${isMobileView ? 'w-full' : ''}`}>
          <label className={`text-xs font-bold whitespace-nowrap ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>종목:</label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className={`${
              isMobileView ? 'flex-1' : 'min-w-[180px]'
            } border text-xs sm:text-sm font-black rounded-xl px-3 py-2 outline-none cursor-pointer transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-lime-600'
                : 'bg-[#0A0A0E] border-[#23232D] text-white focus:border-[#D4FF00]'
            }`}
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
          <div className={`border rounded-2xl p-3 sm:p-3.5 transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}>
            <div className={`flex items-center gap-1 text-[11px] font-bold mb-1 truncate ${isLight ? 'text-amber-700' : 'text-[#FFB703]'}`}>
              <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
              <span>최고 1RM (PR)</span>
            </div>
            <div className={`text-xl font-black font-mono-num ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {prStats.max1RM} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>

          <div className={`border rounded-2xl p-3 sm:p-3.5 transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}>
            <div className={`flex items-center gap-1 text-[11px] font-bold mb-1 truncate ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
              <span>1RM 성장폭</span>
            </div>
            <div className={`text-xl font-black font-mono-num ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
              {prStats.growth1RM >= 0 ? `+${prStats.growth1RM}` : prStats.growth1RM}{' '}
              <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>

          <div className={`border rounded-2xl p-3 sm:p-3.5 transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}>
            <div className={`flex items-center gap-1 text-[11px] font-bold mb-1 truncate ${isLight ? 'text-sky-700' : 'text-[#38BDF8]'}`}>
              <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>종목 누적 볼륨</span>
            </div>
            <div className={`text-xl font-black font-mono-num ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {(prStats.totalVol / 1000).toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400">t</span>
            </div>
          </div>

          <div className={`border rounded-2xl p-3 sm:p-3.5 transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}>
            <div className={`text-[11px] font-bold mb-1 truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>최근 추정 1RM</div>
            <div className={`text-xl font-black font-mono-num ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              {prStats.latest1RM} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>
        </div>
      )}

      {/* Dual Charts */}
      <div className={`grid ${isMobileView ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-5'}`}>
        {/* 1RM Trend Chart */}
        <div className={`border rounded-2xl p-3.5 transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xs font-black flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-lime-600' : 'bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]'}`} />
              추정 1RM 성장 곡선 (Epley)
            </h3>
            <span className={`text-[10px] font-mono-num ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>kg 단위</span>
          </div>

          <div className="h-44 w-full">
            {exerciseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1c1c24'} vertical={false} />
                  <XAxis dataKey="date" stroke={isLight ? '#64748B' : '#64748b'} fontSize={10} tickLine={false} />
                  <YAxis stroke={isLight ? '#64748B' : '#64748b'} fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLight ? '#FFFFFF' : '#0A0A0E',
                      borderColor: isLight ? '#E2E8F0' : '#23232D',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: isLight ? '#0F172A' : '#fff',
                      boxShadow: isLight ? '0 10px 15px -3px rgba(0,0,0,0.1)' : undefined,
                    }}
                    formatter={(val: number) => [`${val} kg`, '추정 1RM']}
                    labelFormatter={(label) => `날짜: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="estimated1RM"
                    stroke={isLight ? '#4D7C0F' : '#D4FF00'}
                    strokeWidth={2.5}
                    dot={{ fill: isLight ? '#4D7C0F' : '#D4FF00', r: 3.5, strokeWidth: 1.5, stroke: isLight ? '#FFFFFF' : '#0A0A0E' }}
                    activeDot={{ r: 5, fill: isLight ? '#0F172A' : '#FFFFFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                기록 데이터 없음
              </div>
            )}
          </div>
        </div>

        {/* Volume per Session Bar Chart */}
        <div className={`border rounded-2xl p-3.5 transition-colors ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xs font-black flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-sky-600' : 'bg-[#38BDF8] shadow-[0_0_6px_#38BDF8]'}`} />
              세션별 해당 종목 총 볼륨
            </h3>
            <span className={`text-[10px] font-mono-num ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>kg 단위</span>
          </div>

          <div className="h-44 w-full">
            {exerciseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exerciseData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1c1c24'} vertical={false} />
                  <XAxis dataKey="date" stroke={isLight ? '#64748B' : '#64748b'} fontSize={10} tickLine={false} />
                  <YAxis stroke={isLight ? '#64748B' : '#64748b'} fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLight ? '#FFFFFF' : '#0A0A0E',
                      borderColor: isLight ? '#E2E8F0' : '#23232D',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: isLight ? '#0F172A' : '#fff',
                      boxShadow: isLight ? '0 10px 15px -3px rgba(0,0,0,0.1)' : undefined,
                    }}
                    formatter={(val: number) => [`${VolumeService.formatKg(val)}`, '총 볼륨']}
                    labelFormatter={(label) => `날짜: ${label}`}
                  />
                  <Bar dataKey="volume" fill={isLight ? '#0284C7' : '#38BDF8'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                기록 데이터 없음
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

