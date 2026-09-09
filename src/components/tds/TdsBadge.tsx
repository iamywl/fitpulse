import React from 'react';

export type TdsBadgeSize = 'xsmall' | 'small' | 'medium' | 'large';
export type TdsBadgeVariant = 'fill' | 'weak';
export type TdsBadgeColor = 'blue' | 'teal' | 'green' | 'red' | 'yellow' | 'elephant';

export interface TdsBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: TdsBadgeSize;
  variant?: TdsBadgeVariant;
  color?: TdsBadgeColor;
  isDark?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const SIZE_STYLES: Record<TdsBadgeSize, string> = {
  xsmall: 'text-[10px] px-1.5 py-0.5 rounded-md leading-tight font-medium',
  small: 'text-[11px] px-2 py-0.5 rounded-lg leading-tight font-semibold',
  medium: 'text-xs px-2.5 py-1 rounded-lg leading-tight font-bold',
  large: 'text-sm px-3 py-1.5 rounded-xl leading-tight font-bold',
};

export const TdsBadge: React.FC<TdsBadgeProps> = ({
  size = 'small',
  variant = 'weak',
  color = 'blue',
  isDark = false,
  icon,
  children,
  className = '',
  ...rest
}) => {
  let colorStyle = '';

  if (variant === 'fill') {
    switch (color) {
      case 'blue':
        colorStyle = 'bg-[#3182F6] text-white';
        break;
      case 'teal':
        colorStyle = 'bg-[#00BFA5] text-white';
        break;
      case 'green':
        colorStyle = 'bg-[#00C73C] text-white';
        break;
      case 'red':
        colorStyle = 'bg-[#F04452] text-white';
        break;
      case 'yellow':
        colorStyle = 'bg-[#FF9F00] text-[#191F28]';
        break;
      case 'elephant':
        colorStyle = 'bg-[#6B7684] text-white';
        break;
    }
  } else {
    // weak variant
    if (isDark) {
      switch (color) {
        case 'blue':
          colorStyle = 'bg-[#3182F6]/20 text-[#5B9DF8] border border-[#3182F6]/30';
          break;
        case 'teal':
          colorStyle = 'bg-[#00BFA5]/20 text-[#2DD4BF] border border-[#00BFA5]/30';
          break;
        case 'green':
          colorStyle = 'bg-[#00C73C]/20 text-[#34D399] border border-[#00C73C]/30';
          break;
        case 'red':
          colorStyle = 'bg-[#F04452]/20 text-[#F87171] border border-[#F04452]/30';
          break;
        case 'yellow':
          colorStyle = 'bg-[#FF9F00]/20 text-[#FBBF24] border border-[#FF9F00]/30';
          break;
        case 'elephant':
          colorStyle = 'bg-[#2C2C2E] text-[#94A3B8] border border-[#3A3A3C]';
          break;
      }
    } else {
      switch (color) {
        case 'blue':
          colorStyle = 'bg-[#E8F3FF] text-[#1B64DA]';
          break;
        case 'teal':
          colorStyle = 'bg-[#E0F7F4] text-[#00897B]';
          break;
        case 'green':
          colorStyle = 'bg-[#E8F9EE] text-[#00962B]';
          break;
        case 'red':
          colorStyle = 'bg-[#FEECEE] text-[#C92A38]';
          break;
        case 'yellow':
          colorStyle = 'bg-[#FFF6E6] text-[#B86A00]';
          break;
        case 'elephant':
          colorStyle = 'bg-[#F2F4F6] text-[#4E5968]';
          break;
      }
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 flex-shrink-0 whitespace-nowrap tracking-tight transition-colors ${SIZE_STYLES[size]} ${colorStyle} ${className}`}
      {...rest}
    >
      {icon && <span className="flex-shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};
