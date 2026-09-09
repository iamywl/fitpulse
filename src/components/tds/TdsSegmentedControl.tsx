import React from 'react';

export interface TdsSegmentOption<T extends string = string> {
  value: T;
  label: string;
  badge?: React.ReactNode;
}

export interface TdsSegmentedControlProps<T extends string = string> {
  options: TdsSegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  isDark?: boolean;
  size?: 'small' | 'medium';
  className?: string;
}

export function TdsSegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  isDark = false,
  size = 'medium',
  className = '',
}: TdsSegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl w-full select-none transition-colors ${
        isDark ? 'bg-[#1C1C1E] border border-[#2C2C2E]' : 'bg-[#F2F4F6]'
      } ${className}`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl transition-all duration-150 font-bold ${
              size === 'small' ? 'py-1.5 text-xs' : 'py-2 text-xs sm:text-sm'
            } ${
              isSelected
                ? isDark
                  ? 'bg-[#2C2D33] text-white shadow-sm font-black'
                  : 'bg-white text-[#191F28] shadow-sm font-black'
                : isDark
                ? 'text-[#8B95A1] hover:text-white'
                : 'text-[#6B7684] hover:text-[#191F28]'
            }`}
          >
            <span className="whitespace-nowrap">{opt.label}</span>
            {opt.badge && <span className="flex-shrink-0">{opt.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
