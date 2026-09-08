import React, { useMemo } from 'react';
import { IInBodyData, IRecommendedWeight } from '../models/fitness';
import { InBodyService } from '../services/calculator/InBodyService';
import { Scale, Target, ShieldCheck, Dumbbell, Award } from 'lucide-react';

import { ThemeMode } from '../theme/pantone';

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
      className={`border rounded-3xl p-4 sm:p-6 shadow-xl relative transition-colors ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-slate-100'
          : 'bg-[#121217] border-[#272732] text-white shadow-2xl'
      }`}
    >
      {/* Header */}
      <div className={`flex ${isMobileView ? 'flex-col gap-2.5' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} gap-3 mb-5`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className={`w-5 h-5 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`} />
            <h2 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              인바디 맞춤 중량 추천기
            </h2>
          </div>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            체성분을 슬라이더로 조절하여 종목별 추천 1RM과 훈련 세트 중량을 실시간 확인하세요.
          </p>
        </div>

        {/* Big 3 Total Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border self-start sm:self-auto shadow-sm transition-colors ${
            isLight
              ? 'bg-lime-50 border-lime-300 text-lime-900'
              : 'bg-[#0A0A0E] border-[#D4FF00]/30 text-[#D4FF00]'
          }`}
        >
          <Award className={`w-4 h-4 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`} />
          <span>
            추정 3대 합산(SBD):{' '}
            <strong className={`font-mono-num text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {sbdTotal}
            </strong>{' '}
            kg
          </span>
        </div>
      </div>

      {/* InBody Interactive Controls */}
      <div
        className={`border rounded-2xl p-4 mb-5 space-y-4 transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0A0A0E] border-[#23232D]'
        }`}
      >
        {/* Row 1: Gender & Experience (Equal height and typography) */}
        <div className={`grid ${isMobileView ? 'grid-cols-1 gap-2.5' : 'grid-cols-1 sm:grid-cols-2 gap-3'} pb-3 border-b ${isLight ? 'border-slate-200' : 'border-[#1F1F2A]'}`}>
          <div>
            <label className={`block text-[11px] font-black mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>성별</label>
            <div className={`flex rounded-xl p-0.5 border ${isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-[#181820] border-[#23232D]'}`}>
              <button
                onClick={() => onUpdateInBody({ ...inbodyData, gender: 'male' })}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all min-h-[36px] ${
                  inbodyData.gender === 'male'
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                남성
              </button>
              <button
                onClick={() => onUpdateInBody({ ...inbodyData, gender: 'female' })}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all min-h-[36px] ${
                  inbodyData.gender === 'female'
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                여성
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-[11px] font-black mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>운동 경력</label>
            <div className={`grid grid-cols-3 gap-1 rounded-xl p-0.5 border ${isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-[#181820] border-[#23232D]'}`}>
              {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => onUpdateInBody({ ...inbodyData, experienceLevel: level })}
                  className={`py-1.5 text-xs font-black rounded-lg transition-all min-h-[36px] ${
                    inbodyData.experienceLevel === level
                      ? 'bg-[#D4FF00] text-black shadow-sm'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {level === 'beginner' ? '초급' : level === 'intermediate' ? '중급' : '고급'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Sliders for Weight, Muscle Mass, Body Fat */}
        <div className={`grid ${isMobileView ? 'grid-cols-1 gap-3.5' : 'grid-cols-1 sm:grid-cols-3 gap-4'}`}>
          {/* Weight */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>체중</span>
              <span className={`font-black font-mono-num text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{inbodyData.weight} kg</span>
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
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isLight ? 'bg-slate-300 accent-lime-600' : 'bg-[#181820] accent-[#D4FF00]'
              }`}
            />
            <div className={`flex justify-between text-[10px] mt-1 font-mono-num ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
              <span>40kg</span>
              <span>130kg</span>
            </div>
          </div>

          {/* Muscle Mass */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className={`font-bold ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>골격근량</span>
              <span className={`font-black font-mono-num text-sm ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>{inbodyData.muscleMass} kg</span>
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
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isLight ? 'bg-slate-300 accent-lime-600' : 'bg-[#181820] accent-[#D4FF00]'
              }`}
            />
            <div className={`flex justify-between text-[10px] mt-1 font-mono-num ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
              <span>15kg</span>
              <span>65kg</span>
            </div>
          </div>

          {/* Body Fat % */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className={`font-bold ${isLight ? 'text-sky-700' : 'text-[#38BDF8]'}`}>체지방률</span>
              <span className={`font-black font-mono-num text-sm ${isLight ? 'text-sky-700' : 'text-[#38BDF8]'}`}>{inbodyData.bodyFatPercent} %</span>
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
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isLight ? 'bg-slate-300 accent-sky-600' : 'bg-[#181820] accent-[#38BDF8]'
              }`}
            />
            <div className={`flex justify-between text-[10px] mt-1 font-mono-num ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
              <span>5%</span>
              <span>45%</span>
            </div>
          </div>
        </div>

        {/* Quick Insights Banner */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t text-xs ${isLight ? 'border-slate-200 text-slate-600' : 'border-[#1F1F2A] text-slate-300'}`}>
          <div className="flex items-center gap-1.5">
            <Target className={`w-4 h-4 flex-shrink-0 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`} />
            <span>
              골격근 비율: <strong className={`font-mono-num font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{muscleRatio}%</strong> · 제지방량: <strong className={`font-mono-num font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{ffm}kg</strong>
            </span>
          </div>
          <div className={`text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`} />
            <span>2.5kg 원판 단위 자동 보정</span>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className={`grid ${isMobileView ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5'}`}>
        {recommendations.map(rec => (
          <div
            key={rec.exerciseId}
            className={`border rounded-2xl p-4 flex flex-col justify-between transition-all group ${
              isLight
                ? 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm'
                : 'bg-[#0A0A0E] border-[#23232D] hover:border-slate-500'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className={`font-extrabold text-sm sm:text-base transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-lime-700' : 'text-white group-hover:text-[#D4FF00]'
                  }`}>
                    {rec.exerciseName}
                  </h3>
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md border ${
                    isLight ? 'bg-white text-slate-600 border-slate-200' : 'bg-[#181820] text-slate-400 border-[#23232D]'
                  }`}>
                    {rec.category}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>추정 1RM</div>
                  <div className={`text-base font-black font-mono-num ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
                    {rec.estimated1RM} kg
                  </div>
                </div>
              </div>

              {/* Set Weight Table: Unified font size (text-sm) across all set rows */}
              <div className={`space-y-2 mb-3 p-2.5 rounded-xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#181820] border-[#23232D]'
              }`}>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-slate-400' : 'bg-slate-500'}`} />
                    웜업 세트 (12회)
                  </span>
                  <span className={`font-mono-num font-black text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                    {rec.warmupSet.weight} kg
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-lime-600' : 'bg-[#D4FF00]'}`} />
                    근비대 본세트 (8~10회)
                  </span>
                  <span className={`font-mono-num font-black text-sm ${isLight ? 'text-lime-700' : 'text-[#D4FF00]'}`}>
                    {rec.hypertrophySet.weight} kg
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-sky-700' : 'text-[#38BDF8]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-sky-500' : 'bg-[#38BDF8]'}`} />
                    스트렝스 세트 (5회)
                  </span>
                  <span className={`font-mono-num font-black text-sm ${isLight ? 'text-sky-700' : 'text-[#38BDF8]'}`}>
                    {rec.strengthSet.weight} kg
                  </span>
                </div>
              </div>

              <p className={`text-[11px] mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{rec.rationale}</p>
            </div>

            {/* Apply Button */}
            {onApplyRecommendationToWorkout && (
              <button
                onClick={() => onApplyRecommendationToWorkout(rec)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 min-h-[38px] ${
                  isLight
                    ? 'bg-slate-100 hover:bg-[#D4FF00] hover:text-black border-slate-300 text-slate-800'
                    : 'bg-[#181820] hover:bg-[#D4FF00] hover:text-black border-[#23232D] text-slate-200'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>오늘 운동 세트에 적용</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

