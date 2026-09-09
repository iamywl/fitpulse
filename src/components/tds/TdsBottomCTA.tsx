import React from 'react';
import { TdsButton, TdsButtonVariant } from './TdsButton';

export interface TdsBottomCTAProps {
  text: string;
  onClick: () => void;
  subText?: string;
  variant?: TdsButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secondaryAction?: {
    text: string;
    onClick: () => void;
    variant?: TdsButtonVariant;
  };
  isDark?: boolean;
  className?: string;
  isSimulator?: boolean;
}

export const TdsBottomCTA: React.FC<TdsBottomCTAProps> = ({
  text,
  onClick,
  subText,
  variant = 'primary',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  secondaryAction,
  isDark = false,
  className = '',
  isSimulator = false,
}) => {
  return (
    <div
      className={
        isSimulator
          ? `sticky bottom-0 left-0 right-0 z-20 pointer-events-none px-2 pb-2 transition-all ${className}`
          : `fixed bottom-0 left-0 right-0 z-30 pointer-events-none px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] transition-colors ${className}`
      }
    >
      <div className="max-w-md mx-auto w-full pointer-events-auto">
        <div
          className={`p-2.5 rounded-2xl shadow-xl backdrop-blur-xl border transition-all ${
            isDark
              ? 'bg-[#1C1C1E]/95 border-[#2C2C2E]/90 shadow-black/60'
              : 'bg-white/95 border-slate-200/90 shadow-slate-300/60'
          }`}
        >
          {subText && (
            <p
              className={`text-center text-xs font-semibold mb-1.5 truncate ${
                isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'
              }`}
            >
              {subText}
            </p>
          )}

          <div className="flex items-center gap-2">
            {secondaryAction && (
              <TdsButton
                variant={secondaryAction.variant || 'secondary'}
                size="large"
                isDark={isDark}
                onClick={secondaryAction.onClick}
                className="flex-1"
              >
                {secondaryAction.text}
              </TdsButton>
            )}

            <TdsButton
              variant={variant}
              size="large"
              fullWidth={!secondaryAction}
              disabled={disabled}
              loading={loading}
              isDark={isDark}
              onClick={onClick}
              leftIcon={leftIcon}
              rightIcon={rightIcon}
              className={secondaryAction ? 'flex-[2]' : 'w-full'}
            >
              {text}
            </TdsButton>
          </div>
        </div>
      </div>
    </div>
  );
};
