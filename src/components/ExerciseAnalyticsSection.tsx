import React, { useState, useMemo } from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';
import { ThemeMode } from '../theme/pantone';
import { TdsBadge } from './tds';

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
    const list = Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    if (list.length === 0) {
      return [
        { id: 'bench-press', name: '바벨 벤치프레스' },
        { id: 'squat', name: '바벨 백스쿼트' },
        { id: 'deadlift', name: '컨벤셔널 데드리프트' },
        { id: 'ohp', name: '오버헤드 프레스 (OHP)' },
      ];
    }
    return list;
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
      className={`rounded-3xl p-5 sm:p-7 shadow-sm transition-colors border ${
        isLight
          ? 'bg-white border-slate-100 text-slate-900 shadow-slate-200/50'
          : 'bg-[#1C1C1E] border-[#2C2C2E] text-white'
      }`}
    >
      {/* Header & Exercise Selector */}
      <div className={`flex ${isMobileView ? 'flex-col gap-3' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} gap-3 mb-6`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#3182F6]" />
            </div>
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              운동별로 얼마나 성장했는지 볼까요?
            </h2>
          </div>
          <p className={`text-xs ml-10 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            꾸준히 기록하면 1RM 추정치와 볼륨이 차트로 쌓여요
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className={`flex items-center gap-2 ${isMobileView ? 'w-full' : ''}`}>
          <label className={`text-xs font-semibold whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>종목</label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className={`${
              isMobileView ? 'flex-1' : 'min-w-[180px]'
            } border text-xs sm:text-sm font-bold rounded-xl px-3.5 py-2.5 outline-none cursor-pointer transition-all ${
              isLight
                ? 'bg-[#F2F4F6] border-transparent text-slate-900 focus:bg-white focus:border-[#3182F6]'
                : 'bg-[#252528] border-transparent text-white focus:border-[#3182F6]'
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
        <div className={`grid ${isMobileView ? 'grid-cols-2 gap-2.5' : 'grid-cols-2 sm:grid-cols-4 gap-3'} mb-6`}>
          <div className={`rounded-2xl p-4 transition-colors ${isLight ? 'bg-[#F8F9FA] border border-slate-100' : 'bg-[#252528] border border-transparent'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>최고 기록 (PR)</span>
              <TdsBadge variant="weak" color="yellow" size="xsmall">PR</TdsBadge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono-num ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {prStats.max1RM}
              </span>
              <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>

          <div className={`rounded-2xl p-4 transition-colors ${isLight ? 'bg-[#F8F9FA] border border-slate-100' : 'bg-[#252528] border border-transparent'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>1RM 성장</span>
              <TdsBadge variant="weak" color="blue" size="xsmall">성장</TdsBadge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono-num text-[#3182F6]">
                {prStats.growth1RM >= 0 ? `+${prStats.growth1RM}` : prStats.growth1RM}
              </span>
              <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>

          <div className={`rounded-2xl p-4 transition-colors ${isLight ? 'bg-[#F8F9FA] border border-slate-100' : 'bg-[#252528] border border-transparent'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>종목 누적 볼륨</span>
              <TdsBadge variant="weak" color="teal" size="xsmall">누적</TdsBadge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono-num ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {(prStats.totalVol / 1000).toFixed(1)}
              </span>
              <span className="text-xs font-normal text-slate-400">t</span>
            </div>
          </div>

          <div className={`rounded-2xl p-4 transition-colors ${isLight ? 'bg-[#F8F9FA] border border-slate-100' : 'bg-[#252528] border border-transparent'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>최근 추정 1RM</span>
              <TdsBadge variant="weak" color="elephant" size="xsmall">최근</TdsBadge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono-num ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                {prStats.latest1RM}
              </span>
              <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
          </div>
        </div>
      )}

      {/* Dual Charts */}
      <div className={`grid ${isMobileView ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-2 gap-5'}`}>
        {/* 1RM Trend Chart */}
        <div className={`rounded-2xl p-4 sm:p-5 transition-colors ${isLight ? 'bg-[#F8F9FA] border border-slate-100' : 'bg-[#252528] border border-transparent'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#3182F6]" />
              추정 1RM 성장 곡선 (Epley)
            </h3>
            <span className={`text-xs font-mono-num ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>kg 단위</span>
          </div>

          <div className="h-48 w-full">
            {exerciseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={exerciseData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E5E8EB' : '#333D4B'} vertical={false} />
                  <XAxis dataKey="date" stroke={isLight ? '#8B95A1' : '#6B7684'} fontSize={11} tickLine={false} />
                  <YAxis stroke={isLight ? '#8B95A1' : '#6B7684'} fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLight ? '#FFFFFF' : '#1C1C1E',
                      borderColor: isLight ? '#E5E8EB' : '#333D4B',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: isLight ? '#191F28' : '#FFFFFF',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    }}
                    formatter={(val: number) => [`${val} kg`, '추정 1RM']}
                    labelFormatter={(label) => `날짜: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="estimated1RM"
                    stroke="#3182F6"
                    strokeWidth={3}
                    dot={{ fill: '#3182F6', r: 4, strokeWidth: 2, stroke: isLight ? '#FFFFFF' : '#1C1C1E' }}
                    activeDot={{ r: 6, fill: '#1B64DA', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                아직 기록된 운동 데이터가 없어요
              </div>
            )}
          </div>
        </div>

        {/* Volume per Session Bar Chart */}
        <div className={`rounded-2xl p-4 sm:p-5 transition-colors ${isLight ? 'bg-[#F8F9FA] border border-slate-100' : 'bg-[#252528] border border-transparent'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00BFA5]" />
              세션별 해당 종목 총 볼륨
            </h3>
            <span className={`text-xs font-mono-num ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>kg 단위</span>
          </div>

          <div className="h-48 w-full">
            {exerciseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exerciseData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E5E8EB' : '#333D4B'} vertical={false} />
                  <XAxis dataKey="date" stroke={isLight ? '#8B95A1' : '#6B7684'} fontSize={11} tickLine={false} />
                  <YAxis stroke={isLight ? '#8B95A1' : '#6B7684'} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLight ? '#FFFFFF' : '#1C1C1E',
                      borderColor: isLight ? '#E5E8EB' : '#333D4B',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: isLight ? '#191F28' : '#FFFFFF',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    }}
                    formatter={(val: number) => [`${VolumeService.formatKg(val)}`, '총 볼륨']}
                    labelFormatter={(label) => `날짜: ${label}`}
                  />
                  <Bar dataKey="volume" fill="#00BFA5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                아직 기록된 운동 데이터가 없어요
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
