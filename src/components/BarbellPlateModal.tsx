import React, { useState } from 'react';
import { X, Disc, Check } from 'lucide-react';
import { PlateCalculatorService } from '../services/calculator/PlateCalculatorService';
import { ThemeMode } from '../theme/pantone';
import { TdsBadge, TdsButton } from './tds';

interface BarbellPlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeight?: number;
  onApplyWeight?: (newWeight: number) => void;
  themeMode?: ThemeMode;
}

export const BarbellPlateModal: React.FC<BarbellPlateModalProps> = ({
  isOpen,
  onClose,
  initialWeight = 82.5,
  onApplyWeight,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';

  const [weight, setWeight] = useState<number>(initialWeight);
  const [barbellWeight, setBarbellWeight] = useState<number>(20);

  // Sync initial weight when opened
  React.useEffect(() => {
    if (isOpen) {
      setWeight(initialWeight);
    }
  }, [isOpen, initialWeight]);

  if (!isOpen) return null;

  const result = PlateCalculatorService.calculate(weight, barbellWeight);

  const handleAdjustWeight = (delta: number) => {
    setWeight(prev => Math.max(barbellWeight, Math.round((prev + delta) * 10) / 10));
  };

  const handleConfirm = () => {
    if (onApplyWeight) {
      onApplyWeight(weight);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border transition-all flex flex-col ${
          isLight
            ? 'bg-white border-slate-100 text-slate-900 shadow-slate-300/50'
            : 'bg-[#1C1C1E] border-[#2C2C2E] text-white shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#3182F6] flex items-center justify-center">
              <Disc className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  바벨 원판 계산기
                </h3>
                <TdsBadge variant="weak" color="blue" size="xsmall">
                  양쪽 대칭
                </TdsBadge>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                양쪽에 똑같이 꽂아야 할 최적 원판 조합이에요
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#252528] text-slate-300 hover:bg-[#333D4B]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Weight & Quick Adjustment Steppers */}
        <div
          className={`p-4 rounded-2xl mb-4 border text-center transition-all ${
            isLight ? 'bg-[#F8F9FA] border-slate-100' : 'bg-[#252528] border-transparent'
          }`}
        >
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            목표 중량
          </span>
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleAdjustWeight(-5)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-[#1C1C1E] text-slate-300 hover:bg-[#333D4B]'
              }`}
            >
              -5
            </button>
            <button
              type="button"
              onClick={() => handleAdjustWeight(-2.5)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-[#1C1C1E] text-slate-300 hover:bg-[#333D4B]'
              }`}
            >
              -2.5
            </button>

            <span className="text-3xl sm:text-4xl font-black font-mono-num text-[#3182F6] px-2 tracking-tight">
              {weight} <span className="text-lg font-bold text-slate-400">kg</span>
            </span>

            <button
              type="button"
              onClick={() => handleAdjustWeight(2.5)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isLight ? 'bg-blue-50 text-[#3182F6] hover:bg-blue-100' : 'bg-blue-950/40 text-[#3182F6] hover:bg-blue-900/50'
              }`}
            >
              +2.5
            </button>
            <button
              type="button"
              onClick={() => handleAdjustWeight(5)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isLight ? 'bg-blue-50 text-[#3182F6] hover:bg-blue-100' : 'bg-blue-950/40 text-[#3182F6] hover:bg-blue-900/50'
              }`}
            >
              +5
            </button>
          </div>

          {/* Barbell Weight Selector */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/50 dark:border-[#333D4B]/50">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">봉 무게:</span>
            {PlateCalculatorService.BARBELL_OPTIONS.map(opt => (
              <button
                key={opt.weight}
                type="button"
                onClick={() => setBarbellWeight(opt.weight)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  barbellWeight === opt.weight
                    ? 'bg-[#3182F6] text-white shadow-sm'
                    : isLight
                    ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    : 'bg-[#1C1C1E] text-slate-400 hover:text-white border border-[#333D4B]'
                }`}
              >
                {opt.weight}kg
              </button>
            ))}
          </div>
        </div>

        {/* Visual Barbell Representation Graphic */}
        <div
          className={`p-4 rounded-2xl mb-4 border flex flex-col items-center justify-center overflow-x-auto min-h-[120px] transition-all ${
            isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#101012] border-[#2C2C2E]'
          }`}
        >
          <span className="text-[11px] font-semibold text-slate-400 mb-2">
            바벨 장착 시각화 (한쪽 기준)
          </span>

          <div className="flex items-center justify-center gap-1 w-full max-w-xs">
            {/* Center Barbell Shaft */}
            <div className="h-4 w-12 rounded-l-md bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 shadow-inner">
              봉 {barbellWeight}k
            </div>

            {/* Collar Stop */}
            <div className="h-10 w-2 rounded-sm bg-slate-400 dark:bg-slate-500" />

            {/* Loaded Plates Stack (Inside -> Outside) */}
            {result.platesPerSide.length > 0 ? (
              <div className="flex items-center gap-1">
                {result.platesPerSide.flatMap((plate, pIdx) =>
                  Array.from({ length: plate.count }).map((_, cIdx) => (
                    <div
                      key={`plate-${pIdx}-${cIdx}`}
                      style={{
                        height: `${plate.heightRem}rem`,
                        backgroundColor: plate.color,
                        color: plate.textColor,
                      }}
                      className="w-5 sm:w-6 rounded-md shadow-md flex flex-col items-center justify-center text-[10px] font-black font-mono-num select-none border border-black/20"
                      title={`${plate.weight}kg 원판`}
                    >
                      <span className="leading-none transform -rotate-90 whitespace-nowrap">
                        {plate.weight}
                      </span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-xs font-semibold text-slate-400 py-4 px-2">
                추가 원판 없음 (빈 바벨만 사용)
              </div>
            )}

            {/* Sleeve End Pin */}
            <div className="h-4 w-6 rounded-r-md bg-slate-300 dark:bg-slate-600" />
          </div>
        </div>

        {/* Breakdown Card List */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              한쪽(Per Side) 세팅 가이드
            </span>
            <span className="text-xs font-black font-mono-num text-[#3182F6]">
              한쪽당 {result.weightPerSide} kg
            </span>
          </div>

          {result.platesPerSide.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {result.platesPerSide.map(plate => (
                <div
                  key={plate.weight}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-[#F8F9FA] border-slate-100' : 'bg-[#252528] border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: plate.color }}
                      className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
                    />
                    <span className="text-xs font-bold">
                      {plate.weight} kg
                    </span>
                  </div>
                  <span className="text-xs font-black font-mono-num text-[#3182F6] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40">
                    × {plate.count} 장
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">
              봉 무게({barbellWeight}kg) 자체로 진행하시면 됩니다.
            </p>
          )}

          {result.remainder > 0 && (
            <p className="text-[11px] text-amber-500 mt-2 font-medium">
              ⚠️ {result.remainder}kg의 자투리 무게는 규격 원판(1.25kg 이상)으로 구성할 수 없어 제외되었습니다.
            </p>
          )}
        </div>

        {/* Bottom CTA */}
        <TdsButton
          variant="primary"
          size="medium"
          fullWidth
          onClick={handleConfirm}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>이 무게({result.totalLoadedWeight}kg)로 운동하기</span>
          </div>
        </TdsButton>
      </div>
    </div>
  );
};
