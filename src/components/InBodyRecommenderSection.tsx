import React, { useMemo } from 'react';
import { IInBodyData, IRecommendedWeight } from '../models/fitness';
import { InBodyService } from '../services/calculator/InBodyService';
import { Scale, Target, ShieldCheck, Dumbbell, Award } from 'lucide-react';
import { ThemeMode } from '../theme/pantone';
import { TdsBadge, TdsButton } from './tds';

interface InBodyRecommenderSectionProps {
  inbodyData: IInBodyData;
  onUpdateInBody: (data: IInBodyData) => void;
  onApplyRecommendationToWorkout?: (rec: IRecommendedWeight) => void;
  isMobileView?: boolean;
  themeMode?: ThemeMode;
}

export const InBodyRecommenderSection: React.FC<InBodyRecommenderSectionProps> = ({
  inbodyData,
  onUpdateInBody,
  onApplyRecommendationToWorkout,
  isMobileView = false,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';
  const recommendations = useMemo(() => {
    return InBodyService.calculateRecommendations(inbodyData);
  }, [inbodyData]);

  const ffm = useMemo(() => {
    return InBodyService.calculateFFM(inbodyData.weight, inbodyData.bodyFatPercent);
  }, [inbodyData.weight, inbodyData.bodyFatPercent]);

  const muscleRatio = useMemo(() => {
    return InBodyService.calculateMuscleRatio(inbodyData.weight, inbodyData.muscleMass);
  }, [inbodyData.weight, inbodyData.muscleMass]);

  const sbdTotal = useMemo(() => {
    const bench = recommendations.find(r => r.exerciseId === 'bench-press')?.estimated1RM || 0;
    const squat = recommendations.find(r => r.exerciseId === 'squat')?.estimated1RM || 0;
    const dead = recommendations.find(r => r.exerciseId === 'deadlift')?.estimated1RM || 0;
    return bench + squat + dead;
  }, [recommendations]);

  return (
    <div
      className={`rounded-3xl p-5 sm:p-7 shadow-sm transition-colors border ${
        isLight
          ? 'bg-white border-slate-100 text-slate-900 shadow-slate-200/50'
          : 'bg-[#1C1C1E] border-[#2C2C2E] text-white'
      }`}
    >
      {/* Header */}
      <div className={`flex ${isMobileView ? 'flex-col gap-3' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} gap-3 mb-6`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <Scale className="w-4 h-4 text-[#3182F6]" />
            </div>
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              내 몸에 딱 맞는 무게를 추천받아 보세요
            </h2>
          </div>
          <p className={`text-xs ml-10 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            골격근량과 체지방률을 바탕으로 안전하고 효과적인 3대 운동 중량을 알려드려요
          </p>
        </div>

        {/* Big 3 Total Badge */}
        <div className="self-start sm:self-auto">
          <TdsBadge variant="weak" color="blue" size="medium">
            <div className="flex items-center gap-1.5 py-0.5">
              <Award className="w-4 h-4 text-[#3182F6]" />
              <span>추정 3대(SBD): <strong className="font-mono-num font-bold">{sbdTotal} kg</strong></span>
            </div>
          </TdsBadge>
        </div>
      </div>

      {/* InBody Interactive Controls */}
      <div
        className={`rounded-2xl p-4 sm:p-5 mb-6 space-y-4 transition-colors ${
          isLight ? 'bg-[#F8F9FA] border border-slate-100' : 'bg-[#252528] border border-transparent'
        }`}
      >
        {/* Row 1: Gender & Experience */}
        <div className={`grid ${isMobileView ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-4'} pb-4 border-b ${isLight ? 'border-slate-200' : 'border-[#333D4B]'}`}>
          <div>
            <label className={`block text-xs font-semibold mb-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>성별</label>
            <div className={`flex rounded-xl p-1 ${isLight ? 'bg-slate-200/60' : 'bg-[#1C1C1E]'}`}>
              <button
                type="button"
                onClick={() => onUpdateInBody({ ...inbodyData, gender: 'male' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all min-h-[38px] ${
                  inbodyData.gender === 'male'
                    ? 'bg-white dark:bg-[#3182F6] text-[#3182F6] dark:text-white shadow-sm'
                    : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                남성
              </button>
              <button
                type="button"
                onClick={() => onUpdateInBody({ ...inbodyData, gender: 'female' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all min-h-[38px] ${
                  inbodyData.gender === 'female'
                    ? 'bg-white dark:bg-[#3182F6] text-[#3182F6] dark:text-white shadow-sm'
                    : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                여성
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>운동 경력</label>
            <div className={`grid grid-cols-3 gap-1 rounded-xl p-1 ${isLight ? 'bg-slate-200/60' : 'bg-[#1C1C1E]'}`}>
              {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => onUpdateInBody({ ...inbodyData, experienceLevel: level })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all min-h-[38px] ${
                    inbodyData.experienceLevel === level
                      ? 'bg-white dark:bg-[#3182F6] text-[#3182F6] dark:text-white shadow-sm'
                      : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {level === 'beginner' ? '초급' : level === 'intermediate' ? '중급' : '고급'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Sliders for Weight, Muscle Mass, Body Fat */}
        <div className={`grid ${isMobileView ? 'grid-cols-1 gap-4' : 'grid-cols-1 sm:grid-cols-3 gap-5'}`}>
          {/* Weight */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>체중</span>
              <span className={`font-bold font-mono-num text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{inbodyData.weight} kg</span>
            </div>
            <input
              type="range"
              min="40"
              max="130"
              step="0.5"
              value={inbodyData.weight}
              onChange={(e) =>
                onUpdateInBody({ ...inbodyData, weight: parseFloat(e.target.value) || 40 })
              }
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-[#1C1C1E] accent-[#3182F6]"
            />
            <div className="flex justify-between text-[11px] mt-1 font-mono-num text-slate-400">
              <span>40kg</span>
              <span>130kg</span>
            </div>
          </div>

          {/* Muscle Mass */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[#3182F6]">골격근량</span>
              <span className="font-bold font-mono-num text-sm text-[#3182F6]">{inbodyData.muscleMass} kg</span>
            </div>
            <input
              type="range"
              min="15"
              max="65"
              step="0.5"
              value={inbodyData.muscleMass}
              onChange={(e) =>
                onUpdateInBody({ ...inbodyData, muscleMass: parseFloat(e.target.value) || 15 })
              }
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-[#1C1C1E] accent-[#3182F6]"
            />
            <div className="flex justify-between text-[11px] mt-1 font-mono-num text-slate-400">
              <span>15kg</span>
              <span>65kg</span>
            </div>
          </div>

          {/* Body Fat % */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-[#00BFA5]">체지방률</span>
              <span className="font-bold font-mono-num text-sm text-[#00BFA5]">{inbodyData.bodyFatPercent} %</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="0.5"
              value={inbodyData.bodyFatPercent}
              onChange={(e) =>
                onUpdateInBody({ ...inbodyData, bodyFatPercent: parseFloat(e.target.value) || 5 })
              }
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-[#1C1C1E] accent-[#00BFA5]"
            />
            <div className="flex justify-between text-[11px] mt-1 font-mono-num text-slate-400">
              <span>5%</span>
              <span>45%</span>
            </div>
          </div>
        </div>

        {/* Quick Insights Banner */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-3 border-t text-xs ${isLight ? 'border-slate-200 text-slate-600' : 'border-[#333D4B] text-slate-300'}`}>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#3182F6] flex-shrink-0" />
            <span>
              골격근 비율: <strong className={`font-mono-num font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{muscleRatio}%</strong> · 제지방량: <strong className={`font-mono-num font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{ffm}kg</strong>
            </span>
          </div>
          <div className="text-[11px] flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3182F6]" />
            <span>2.5kg 바벨 원판 단위 자동 보정</span>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className={`grid ${isMobileView ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
        {recommendations.map(rec => (
          <div
            key={rec.exerciseId}
            className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all border ${
              isLight
                ? 'bg-[#F8F9FA] border-slate-100 hover:border-slate-200 shadow-sm'
                : 'bg-[#252528] border-transparent hover:border-[#333D4B]'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className={`font-bold text-sm sm:text-base mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {rec.exerciseName}
                  </h3>
                  <TdsBadge variant="weak" color="elephant" size="xsmall">
                    {rec.category}
                  </TdsBadge>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-[10px] font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>추정 1RM</div>
                  <div className="text-base font-bold font-mono-num text-[#3182F6]">
                    {rec.estimated1RM} kg
                  </div>
                </div>
              </div>

              {/* Set Weight Table */}
              <div className={`space-y-2 mb-4 p-3 rounded-xl ${
                isLight ? 'bg-white border border-slate-100' : 'bg-[#1C1C1E]'
              }`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5">
                    <TdsBadge variant="weak" color="yellow" size="xsmall">웜업</TdsBadge>
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>12회</span>
                  </span>
                  <span className={`font-mono-num font-bold text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                    {rec.warmupSet.weight} kg
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5">
                    <TdsBadge variant="weak" color="blue" size="xsmall">본세트</TdsBadge>
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>8~10회</span>
                  </span>
                  <span className="font-mono-num font-bold text-sm text-[#3182F6]">
                    {rec.hypertrophySet.weight} kg
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5">
                    <TdsBadge variant="weak" color="red" size="xsmall">스트렝스</TdsBadge>
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>5회</span>
                  </span>
                  <span className="font-mono-num font-bold text-sm text-[#F04452]">
                    {rec.strengthSet.weight} kg
                  </span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {rec.rationale}
              </p>
            </div>

            {/* Apply Button */}
            {onApplyRecommendationToWorkout && (
              <TdsButton
                variant="secondary"
                size="small"
                fullWidth
                onClick={() => onApplyRecommendationToWorkout(rec)}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>오늘 루틴에 무게 적용하기</span>
                </div>
              </TdsButton>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
