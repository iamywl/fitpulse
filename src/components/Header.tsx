import React from 'react';
import { Dumbbell, Flame, Plus, RotateCcw, Sparkles, Smartphone, Monitor, Sun, Moon } from 'lucide-react';
import { TdsBadge } from './tds/TdsBadge';
import { TdsButton } from './tds/TdsButton';

interface HeaderProps {
  currentStreak: number;
  viewMode: 'mobile' | 'desktop';
  themeMode: 'dark' | 'light';
  onToggleViewMode: (mode: 'mobile' | 'desktop') => void;
  onToggleTheme: () => void;
  onOpenLogModal: () => void;
  onResetMockData: () => void;
  onClearData: () => void;
  onQuickSimulateToday: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStreak,
  viewMode,
  themeMode,
  onToggleViewMode,
  onToggleTheme,
  onOpenLogModal,
  onResetMockData,
  onClearData,
}) => {
  const isDark = themeMode === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-6 py-3 transition-colors ${
        isDark
          ? 'bg-[#101012]/90 border-[#2C2C2E] text-white'
          : 'bg-[#F2F4F6]/90 border-[#E5E8EB] text-[#191F28]'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#3182F6] text-white shadow-sm flex-shrink-0">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-black text-lg sm:text-xl tracking-tight ${isDark ? 'text-white' : 'text-[#191F28]'}`}>
                FitPulse
              </span>
              <TdsBadge size="xsmall" variant="weak" color="blue" isDark={isDark}>
                TDS
              </TdsBadge>
            </div>
            <p className={`text-xs font-medium hidden sm:block ${isDark ? 'text-[#8B95A1]' : 'text-[#6B7684]'}`}>
              성장하는 내 운동 기록
            </p>
          </div>
        </div>

        {/* Center: Device Mode & Theme Switcher */}
        <div className="flex items-center gap-2">
          {/* Device Switcher (Mobile vs Desktop) */}
          <div className={`flex items-center p-1 rounded-2xl transition-colors ${
            isDark ? 'bg-[#1C1C1E] border border-[#2C2C2E]' : 'bg-[#E5E8EB]/80'
          }`}>
            <button
              onClick={() => onToggleViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'mobile'
                  ? isDark
                    ? 'bg-[#2C2D33] text-white shadow-sm font-black'
                    : 'bg-white text-[#191F28] shadow-sm font-black'
                  : isDark
                  ? 'text-[#8B95A1] hover:text-white'
                  : 'text-[#6B7684] hover:text-[#191F28]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">모바일</span>
            </button>
            <button
              onClick={() => onToggleViewMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'desktop'
                  ? isDark
                    ? 'bg-[#2C2D33] text-white shadow-sm font-black'
                    : 'bg-white text-[#191F28] shadow-sm font-black'
                  : isDark
                  ? 'text-[#8B95A1] hover:text-white'
                  : 'text-[#6B7684] hover:text-[#191F28]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">데스크톱</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label="Toggle Theme"
            className={`p-2 rounded-2xl transition-all ${
              isDark
                ? 'bg-[#1C1C1E] text-[#B0B8C1] hover:text-white border border-[#2C2C2E]'
                : 'bg-white text-[#4E5968] hover:text-[#191F28] border border-slate-200 shadow-sm'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FF9F00]" /> : <Moon className="w-4 h-4 text-[#3182F6]" />}
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Current Streak */}
          <TdsBadge
            size="medium"
            variant="weak"
            color="red"
            isDark={isDark}
            icon={<Flame className="w-3.5 h-3.5 text-[#F04452]" />}
          >
            <strong className="font-mono-num">{currentStreak}</strong>일째 연속
          </TdsBadge>

          {/* Sample Mock Data load */}
          <button
            onClick={onResetMockData}
            title="샘플 데이터 채우기"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isDark
                ? 'bg-[#1C1C1E] text-[#B0B8C1] hover:text-white border border-[#2C2C2E]'
                : 'bg-white text-[#4E5968] hover:text-[#191F28] border border-slate-200 shadow-sm'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3182F6]" />
            <span>샘플</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onClearData}
            title="기록 초기화"
            className={`hidden md:flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isDark
                ? 'text-[#8B95A1] hover:text-[#F87171]'
                : 'text-[#8B95A1] hover:text-[#C92A38]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* New Workout CTA */}
          <TdsButton
            size="small"
            variant="primary"
            isDark={isDark}
            onClick={onOpenLogModal}
            leftIcon={<Plus className="w-3.5 h-3.5 stroke-[3]" />}
          >
            기록하기
          </TdsButton>
        </div>
      </div>
    </header>
  );
};
