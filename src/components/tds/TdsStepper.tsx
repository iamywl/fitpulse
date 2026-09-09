import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface TdsStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  isDark?: boolean;
  label?: string;
  quickChips?: number[];
  className?: string;
}

export const TdsStepper: React.FC<TdsStepperProps> = ({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  unit = '',
  isDark = false,
  label,
  quickChips,
  className = '',
}) => {
  const handleDecrement = () => {
    const next = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(next);
  };

  const handleChipClick = (delta: number) => {
    const next = Math.max(min, Math.min(max, Math.round((value + delta) * 10) / 10));
    onChange(next);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span
          className={`text-xs font-semibold ${
            isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'
          }`}
        >
          {label}
        </span>
      )}

      {/* Stepper Control Box */}
      <div
        className={`flex items-center justify-between p-1.5 rounded-2xl border transition-all ${
          isDark
            ? 'bg-[#1C1C1E] border-[#2C2C2E]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all active:scale-95 select-none ${
            value <= min
              ? 'opacity-30 cursor-not-allowed'
              : isDark
              ? 'bg-[#2C2D33] hover:bg-[#383A42] text-white'
              : 'bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#191F28]'
          }`}
          aria-label="감소"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="flex items-baseline gap-1 px-3">
          <span
            className={`text-lg sm:text-xl font-black font-mono-num ${
              isDark ? 'text-white' : 'text-[#191F28]'
            }`}
          >
            {value}
          </span>
          {unit && (
            <span
              className={`text-xs font-bold ${
                isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'
              }`}
            >
              {unit}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all active:scale-95 select-none ${
            value >= max
              ? 'opacity-30 cursor-not-allowed'
              : isDark
              ? 'bg-[#2C2D33] hover:bg-[#383A42] text-white'
              : 'bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#191F28]'
          }`}
          aria-label="증가"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Optional Quick Delta Chips */}
      {quickChips && quickChips.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
          {quickChips.map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => handleChipClick(delta)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 select-none ${
                isDark
                  ? 'bg-[#242529] hover:bg-[#2C2D33] text-[#B0B8C1] border border-[#2E3036]'
                  : 'bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] border border-slate-200'
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
