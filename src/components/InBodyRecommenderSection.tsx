import React, { useMemo } from 'react';
import { IInBodyData, IRecommendedWeight } from '../models/fitness';
import { InBodyService } from '../services/calculator/InBodyService';
import { Scale, Target, ShieldCheck, Dumbbell, Award } from 'lucide-react';

interface InBodyRecommenderSectionProps {
  inbodyData: IInBodyData;
  onUpdateInBody: (data: IInBodyData) => void;
  onApplyRecommendationToWorkout?: (rec: IRecommendedWeight) => void;
  isMobileView?: boolean;
}

export const InBodyRecommenderSection: React.FC<InBodyRecommenderSectionProps> = ({
  inbodyData,
  onUpdateInBody,
  onApplyRecommendationToWorkout,
  isMobileView = false,
}) => {
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
    <div className="bg-[#121217] border border-[#23232D] rounded-3xl p-4 sm:p-6 shadow-2xl relative">
      {/* Header */}
      <div className={`flex ${isMobileView ? 'flex-col gap-2.5' : 'flex-col sm:flex-row sm:items-center sm:justify-between'} gap-3 mb-5`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-[#D4FF00]" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              인바디 맞춤 중량 추천기
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            체성분을 슬라이더로 조절하여 종목별 추천 1RM과 훈련 세트 중량을 실시간 확인하세요.
          </p>
        </div>

        {/* Big 3 Total Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A0A0E] border border-[#D4FF00]/30 text-[#D4FF00] text-xs font-black self-start sm:self-auto shadow-sm">
          <Award className="w-4 h-4 text-[#D4FF00]" />
          <span>추정 3대 합산(SBD): <strong className="font-mono-num text-white text-sm font-black">{sbdTotal}</strong> kg</span>
        </div>
      </div>

      {/* InBody Interactive Controls */}
      <div className="bg-[#0A0A0E] border border-[#23232D] rounded-2xl p-4 mb-5 space-y-4">
        {/* Row 1: Gender & Experience */}
        <div className={`grid ${isMobileView ? 'grid-cols-1 gap-2.5' : 'grid-cols-1 sm:grid-cols-2 gap-3'} pb-3 border-b border-[#1F1F2A]`}>
          <div>
            <label className="block text-[11px] font-black text-slate-300 mb-1.5">성별</label>
            <div className="flex bg-[#181820] rounded-xl p-0.5 border border-[#23232D]">
              <button
                onClick={() => onUpdateInBody({ ...inbodyData, gender: 'male' })}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                  inbodyData.gender === 'male'
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                남성
              </button>
              <button
                onClick={() => onUpdateInBody({ ...inbodyData, gender: 'female' })}
                className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${
                  inbodyData.gender === 'female'
                    ? 'bg-[#D4FF00] text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                여성
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-300 mb-1.5">운동 경력</label>
            <div className="grid grid-cols-3 gap-1 bg-[#181820] rounded-xl p-0.5 border border-[#23232D]">
              {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => onUpdateInBody({ ...inbodyData, experienceLevel: level })}
                  className={`py-1.5 text-[11px] font-black rounded-lg transition-all ${
                    inbodyData.experienceLevel === level
                      ? 'bg-[#D4FF00] text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
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
              <span className="text-slate-300 font-bold">체중</span>
              <span className="font-black text-white font-mono-num text-sm">{inbodyData.weight} kg</span>
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
              className="w-full h-2 bg-[#181820] rounded-lg appearance-none cursor-pointer accent-[#D4FF00]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono-num">
              <span>40kg</span>
              <span>130kg</span>
            </div>
          </div>

          {/* Muscle Mass */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-[#D4FF00] font-bold">골격근량</span>
              <span className="font-black text-[#D4FF00] font-mono-num text-sm">{inbodyData.muscleMass} kg</span>
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
              className="w-full h-2 bg-[#181820] rounded-lg appearance-none cursor-pointer accent-[#D4FF00]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono-num">
              <span>15kg</span>
              <span>65kg</span>
            </div>
          </div>

          {/* Body Fat % */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-[#38BDF8] font-bold">체지방률</span>
              <span className="font-black text-[#38BDF8] font-mono-num text-sm">{inbodyData.bodyFatPercent} %</span>
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
              className="w-full h-2 bg-[#181820] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono-num">
              <span>5%</span>
              <span>45%</span>
            </div>
          </div>
        </div>

        {/* Quick Insights Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#1F1F2A] text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#D4FF00] flex-shrink-0" />
            <span>
              골격근 비율: <strong className="text-white font-mono-num font-black">{muscleRatio}%</strong> · 제지방량: <strong className="text-white font-mono-num font-black">{ffm}kg</strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4FF00]" />
            <span>2.5kg 원판 단위 자동 보정</span>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className={`grid ${isMobileView ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5'}`}>
        {recommendations.map(rec => (
          <div
            key={rec.exerciseId}
            className="bg-[#0A0A0E] border border-[#23232D] hover:border-slate-500 rounded-2xl p-4 flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-[#D4FF00] transition-colors">
                    {rec.exerciseName}
                  </h3>
                  <span className="text-[10px] text-slate-400 uppercase bg-[#181820] px-2 py-0.5 rounded-md border border-[#23232D]">
                    {rec.category}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] text-slate-400 font-bold">추정 1RM</div>
                  <div className="text-base font-black text-[#D4FF00] font-mono-num">
                    {rec.estimated1RM} kg
                  </div>
                </div>
              </div>

              {/* Set Weight Table */}
              <div className="space-y-1.5 mb-3 bg-[#181820] p-2.5 rounded-xl border border-[#23232D]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    웜업 세트 (12회)
                  </span>
                  <span className="font-mono-num font-bold text-slate-200">
                    {rec.warmupSet.weight} kg
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#D4FF00] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]" />
                    근비대 본세트 (8~10회)
                  </span>
                  <span className="font-mono-num font-black text-[#D4FF00] text-sm">
                    {rec.hypertrophySet.weight} kg
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#38BDF8] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                    스트렝스 세트 (5회)
                  </span>
                  <span className="font-mono-num font-black text-[#38BDF8] text-sm">
                    {rec.strengthSet.weight} kg
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mb-3">{rec.rationale}</p>
            </div>

            {/* Apply Button */}
            {onApplyRecommendationToWorkout && (
              <button
                onClick={() => onApplyRecommendationToWorkout(rec)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#181820] hover:bg-[#D4FF00] hover:text-black border border-[#23232D] text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
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
