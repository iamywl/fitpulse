import React from 'react';

export type TdsButtonSize = 'small' | 'medium' | 'large' | 'xlarge';
export type TdsButtonVariant = 'primary' | 'secondary' | 'weak' | 'danger';

export interface TdsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: TdsButtonSize;
  variant?: TdsButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  isDark?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const SIZE_STYLES: Record<TdsButtonSize, string> = {
  small: 'min-h-[36px] px-3.5 py-1.5 text-xs rounded-xl font-bold',
  medium: 'min-h-[44px] px-4 py-2.5 text-sm rounded-xl font-bold',
  large: 'min-h-[52px] px-5 py-3 text-base rounded-2xl font-bold',
  xlarge: 'min-h-[56px] px-6 py-3.5 text-base rounded-2xl font-black',
};

export const TdsButton: React.FC<TdsButtonProps> = ({
  size = 'medium',
  variant = 'primary',
  fullWidth = false,
  loading = false,
  isDark = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  let variantStyle = '';

  if (variant === 'primary') {
    variantStyle = 'bg-[#3182F6] hover:bg-[#1B64DA] active:bg-[#1552B5] text-white shadow-sm';
  } else if (variant === 'secondary') {
    variantStyle = isDark
      ? 'bg-[#242529] hover:bg-[#2C2D33] text-white border border-[#33343A]'
      : 'bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#333D4B]';
  } else if (variant === 'weak') {
    variantStyle = isDark
      ? 'bg-[#3182F6]/15 hover:bg-[#3182F6]/25 text-[#5B9DF8]'
      : 'bg-[#E8F3FF] hover:bg-[#D4E8FF] text-[#1B64DA]';
  } else if (variant === 'danger') {
    variantStyle = isDark
      ? 'bg-[#F04452]/20 hover:bg-[#F04452]/30 text-[#F87171] border border-[#F04452]/30'
      : 'bg-[#FEECEE] hover:bg-[#FCD8DC] text-[#C92A38]';
  }

  const disabledStyle = disabled || loading
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer active:scale-[0.98] transition-all duration-150';

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 select-none tracking-tight ${SIZE_STYLES[size]} ${variantStyle} ${disabledStyle} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        leftIcon && <span className="flex-shrink-0 flex items-center justify-center">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="flex-shrink-0 flex items-center justify-center">{rightIcon}</span>
      )}
    </button>
  );
};
