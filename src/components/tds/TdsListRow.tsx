import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface TdsListRowProps {
  left?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  badge?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  isDark?: boolean;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

export const TdsListRow: React.FC<TdsListRowProps> = ({
  left,
  title,
  subtitle,
  right,
  badge,
  showChevron = false,
  onClick,
  isDark = false,
  active = false,
  disabled = false,
  className = '',
}) => {
  const isClickable = !!onClick && !disabled;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all select-none ${
        isClickable ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${
        active
          ? isDark
            ? 'bg-[#242529] border border-[#3A3B42]'
            : 'bg-[#F2F4F6] border border-slate-200'
          : isDark
          ? 'hover:bg-[#242529]/60'
          : 'hover:bg-slate-50'
      } ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}
    >
      {/* Left Slot + Title & Subtitle */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {left && (
          <div className="flex-shrink-0 flex items-center justify-center">
            {left}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`text-sm sm:text-base font-bold truncate leading-snug ${
                isDark ? 'text-white' : 'text-[#191F28]'
              }`}
            >
              {title}
            </div>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>

          {subtitle && (
            <div
              className={`text-xs mt-0.5 leading-normal ${
                isDark ? 'text-[#8B95A1]' : 'text-[#4E5968]'
              }`}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right Slot + Chevron */}
      <div className="flex items-center gap-2 flex-shrink-0 pl-1">
        {right && <div>{right}</div>}
        {showChevron && (
          <ChevronRight
            className={`w-4 h-4 flex-shrink-0 ${
              isDark ? 'text-[#6B7684]' : 'text-[#B0B8C1]'
            }`}
          />
        )}
      </div>
    </div>
  );
};
