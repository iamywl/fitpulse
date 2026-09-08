import React, { useState } from 'react';
import { IWeeklySplitDay, IWeeklySplitExercise } from '../models/fitness';
import { ROUTINE_PRESETS, RoutinePresetType } from '../data/routinePresets';
import { MASTER_EXERCISE_LIBRARY, IMasterExercise } from '../data/exerciseLibrary';
import { ThemeMode } from '../theme/pantone';
import { 
  X, 
  Sparkles, 
  SlidersHorizontal, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Dumbbell, 
  Search, 
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoutineBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSplit: IWeeklySplitDay[];
  onSaveSplit: (newSplit: IWeeklySplitDay[]) => void;
  themeMode?: ThemeMode;
}

export const RoutineBuilderModal: React.FC<RoutineBuilderModalProps> = ({
  isOpen,
  onClose,
  currentSplit,
  onSaveSplit,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';

  // Active Tab: 'presets' (추천 프리셋) vs 'custom' (요일별 직접 커스텀)
  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialTab = queryParams?.get('builderTab') === 'custom' ? 'custom' : 'presets';
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>(initialTab);

  // Working copy of split schedule
  const [workingSplit, setWorkingSplit] = useState<IWeeklySplitDay[]>(() => {
    return JSON.parse(JSON.stringify(currentSplit));
  });

  // Selected Day Index for custom editor (default to 1: Mon)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);

  // Exercise Library Drawer / Picker state
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState<boolean>(false);
  const [exerciseSearch, setExerciseSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  // Ordered days: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  const orderedDays = [
    ...workingSplit.filter(d => d.dayIndex !== 0),
    ...workingSplit.filter(d => d.dayIndex === 0),
  ];

  const activeDay = workingSplit.find(d => d.dayIndex === selectedDayIndex) || workingSplit[0];

  // Apply Preset Handler
  const handleApplyPreset = (presetId: RoutinePresetType) => {
    const preset = ROUTINE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    if (window.confirm(`[${preset.title}]\n이 프리셋으로 주간 루틴을 교체하시겠습니까?`)) {
      const cloned = JSON.parse(JSON.stringify(preset.splitDays));
      setWorkingSplit(cloned);
      onSaveSplit(cloned);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      onClose();
    }
  };

  // Day Property Updaters
  const updateActiveDayField = <K extends keyof IWeeklySplitDay>(field: K, value: IWeeklySplitDay[K]) => {
    setWorkingSplit(prev => prev.map(day => {
      if (day.dayIndex === selectedDayIndex) {
        return { ...day, [field]: value };
      }
      return day;
    }));
  };

  // Exercise Management in Active Day
  const handleAddExerciseFromLibrary = (masterEx: IMasterExercise) => {
    const newExercise: IWeeklySplitExercise = {
      id: `custom-ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: masterEx.name,
      targetMuscle: masterEx.targetMuscle,
      sets: masterEx.defaultSets,
      reps: masterEx.defaultReps,
      intensity: masterEx.intensity,
      restSeconds: masterEx.defaultRestSeconds,
      target1RMPercent: masterEx.target1RMPercent,
      tip: masterEx.tip,
    };

    setWorkingSplit(prev => prev.map(day => {
      if (day.dayIndex === selectedDayIndex) {
        return {
          ...day,
          isRestDay: false,
          exercises: [...day.exercises, newExercise],
        };
      }
      return day;
    }));

    setIsExercisePickerOpen(false);
  };

  const handleUpdateExercise = (exerciseId: string, updates: Partial<IWeeklySplitExercise>) => {
    setWorkingSplit(prev => prev.map(day => {
      if (day.dayIndex === selectedDayIndex) {
        return {
          ...day,
          exercises: day.exercises.map(ex => ex.id === exerciseId ? { ...ex, ...updates } : ex),
        };
      }
      return day;
    }));
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setWorkingSplit(prev => prev.map(day => {
      if (day.dayIndex === selectedDayIndex) {
        const remaining = day.exercises.filter(ex => ex.id !== exerciseId);
        return {
          ...day,
          exercises: remaining,
          isRestDay: remaining.length === 0 ? true : day.isRestDay,
        };
      }
      return day;
    }));
  };

  const handleMoveExercise = (exerciseIndex: number, direction: 'up' | 'down') => {
    setWorkingSplit(prev => prev.map(day => {
      if (day.dayIndex === selectedDayIndex) {
        const list = [...day.exercises];
        const targetIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1;
        if (targetIndex < 0 || targetIndex >= list.length) return day;

        const temp = list[exerciseIndex];
        list[exerciseIndex] = list[targetIndex];
        list[targetIndex] = temp;

        return { ...day, exercises: list };
      }
      return day;
    }));
  };

  // Toggle Rest Day for Active Day
  const handleToggleRestDay = () => {
    const nextRest = !activeDay.isRestDay;
    updateActiveDayField('isRestDay', nextRest);
    if (nextRest) {
      updateActiveDayField('colorType', 'rest');
      updateActiveDayField('title', `${activeDay.dayName}요일 휴식 및 회복 (Rest Day)`);
    } else {
      updateActiveDayField('colorType', 'volt');
      updateActiveDayField('title', `${activeDay.dayName}요일 커스텀 트레이닝`);
    }
  };

  // Save All Custom Routine
  const handleSaveAll = () => {
    onSaveSplit(workingSplit);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  // Filter master library exercises
  const filteredLibrary = MASTER_EXERCISE_LIBRARY.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
                        item.targetMuscle.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#111115] border-[#272732] text-white'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-[#272732] bg-[#18181F]/40'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${
              isLight ? 'bg-[#D4FF00]/20 border-lime-400 text-lime-800' : 'bg-[#D4FF00]/10 border-[#D4FF00]/30 text-[#D4FF00]'
            }`}>
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>루틴 빌더 (Routine Builder)</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isLight ? 'bg-lime-100 text-lime-800 border border-lime-300' : 'bg-[#D4FF00] text-black'
                }`}>
                  CUSTOM
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                나만의 분할 루틴을 커스텀하거나 검증된 운동 프리셋을 선택하세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1F1F2A] text-[#94A3B8]'
            }`}
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className={`grid grid-cols-2 p-1.5 mx-4 mt-3 rounded-2xl border ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#18181F] border-[#272732]'
        }`}>
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'presets'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-[#D4FF00] text-black shadow-md'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ 추천 프리셋 선택</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'custom'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-[#D4FF00] text-black shadow-md'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🛠️ 요일별 직접 커스텀</span>
          </button>
        </div>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: PRESET SELECTOR */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                isLight ? 'bg-lime-50 border-lime-200 text-lime-900' : 'bg-[#D4FF00]/10 border-[#D4FF00]/20 text-[#D4FF00]'
              }`}>
                💡 프리셋을 선택하면 요일별 운동 종목, 세트 수, 목표 반복수, 권장 휴식 시간이 한 번에 최적 세팅됩니다.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROUTINE_PRESETS.map((preset) => {
                  return (
                    <div
                      key={preset.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isLight
                          ? 'bg-white border-slate-200 hover:border-lime-500 shadow-sm'
                          : 'bg-[#18181F] border-[#272732] hover:border-[#D4FF00]/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            isLight ? 'bg-lime-100 text-lime-800' : 'bg-[#D4FF00]/20 text-[#D4FF00]'
                          }`}>
                            {preset.badge}
                          </span>
                          <span className={`text-[11px] font-mono ${isLight ? 'text-slate-400' : 'text-[#64748B]'}`}>
                            {preset.frequency}
                          </span>
                        </div>

                        <h3 className="text-sm font-black mb-1">{preset.title}</h3>
                        <p className={`text-xs line-clamp-2 mb-3 ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                          {preset.description}
                        </p>

                        {/* Split Days Preview Chips */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {preset.splitDays.filter(d => !d.isRestDay).slice(0, 4).map(d => (
                            <span
                              key={d.dayKey}
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isLight ? 'bg-slate-100 text-slate-700' : 'bg-[#22222D] text-slate-300'
                              }`}
                            >
                              {d.dayName}: {d.title.split('(')[0]}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplyPreset(preset.id)}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 min-h-[42px] ${
                          isLight
                            ? 'bg-slate-900 hover:bg-black text-white shadow-sm'
                            : 'bg-[#D4FF00] hover:bg-[#CCFF00] text-black font-black'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>이 루틴으로 적용하기</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM DAY EDITOR */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              {/* Day Selector Chips (Mon ~ Sun) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {orderedDays.map((day) => {
                  const isSelected = day.dayIndex === selectedDayIndex;
                  return (
                    <button
                      key={day.dayKey}
                      onClick={() => setSelectedDayIndex(day.dayIndex)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all min-h-[56px] ${
                        isSelected
                          ? isLight
                            ? 'bg-white border-2 border-lime-600 shadow-md'
                            : 'bg-[#18181F] border-2 border-[#D4FF00] shadow-[0_0_12px_rgba(212,255,0,0.3)]'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          : 'bg-[#18181F]/50 border-[#272732] text-[#94A3B8] hover:bg-[#18181F]'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold">{day.englishShort}</span>
                      <span className={`text-xs font-black ${isSelected ? (isLight ? 'text-slate-900' : 'text-white') : ''}`}>
                        {day.dayName}
                      </span>
                      <span className="mt-0.5">
                        {day.isRestDay ? (
                          <span className={`w-1.5 h-1.5 rounded-full block ${isLight ? 'bg-slate-300' : 'bg-slate-600'}`} />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full block ${isLight ? 'bg-lime-600' : 'bg-[#D4FF00]'}`} />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Meta Card */}
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#18181F] border-[#272732]'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <label className={`block text-[11px] font-semibold mb-1 ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                      {activeDay.dayName}요일 루틴 타이틀
                    </label>
                    <input
                      type="text"
                      value={activeDay.title}
                      onChange={(e) => updateActiveDayField('title', e.target.value)}
                      placeholder="예: 가슴 & 삼두 (Chest & Triceps)"
                      className={`w-full px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border outline-none transition-colors ${
                        isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-lime-500' : 'bg-[#111115] border-[#272732] text-white focus:border-[#D4FF00]'
                      }`}
                    />
                  </div>

                  {/* Rest Day Toggle */}
                  <div className="flex items-center gap-2 pt-1 sm:pt-4">
                    <button
                      type="button"
                      onClick={handleToggleRestDay}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 min-h-[38px] ${
                        activeDay.isRestDay
                          ? isLight
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isLight
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-[#272732] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <span>{activeDay.isRestDay ? '😴 휴식일(Rest Day) 해제' : '☕ 이 날은 휴식일로 지정'}</span>
                    </button>
                  </div>
                </div>

                {/* Exercises List in Active Day */}
                {!activeDay.isRestDay && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        운동 종목 리스트 ({activeDay.exercises.length}개)
                      </span>

                      <button
                        onClick={() => setIsExercisePickerOpen(true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 min-h-[36px] ${
                          isLight
                            ? 'bg-lime-600 hover:bg-lime-700 text-white shadow-sm'
                            : 'bg-[#D4FF00] hover:bg-[#CCFF00] text-black font-black'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>종목 추가하기</span>
                      </button>
                    </div>

                    {activeDay.exercises.length === 0 ? (
                      <div className={`p-6 text-center rounded-2xl border border-dashed text-xs ${
                        isLight ? 'border-slate-300 text-slate-500' : 'border-[#272732] text-[#94A3B8]'
                      }`}>
                        종목이 없습니다. 위의 <strong>[+ 종목 추가하기]</strong> 버튼을 눌러 운동을 구성해보세요!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeDay.exercises.map((ex, idx) => (
                          <div
                            key={ex.id}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isLight ? 'bg-white border-slate-200' : 'bg-[#111115] border-[#272732]'
                            }`}
                          >
                            {/* Left Info */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-400' : 'text-[#64748B]'}`}>
                                0{idx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs sm:text-sm font-black truncate">{ex.name}</h4>
                                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                                  {ex.targetMuscle} · 휴식 {ex.restSeconds}초
                                </span>
                              </div>
                            </div>

                            {/* Center Steppers: Sets & Reps */}
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                              <div className="flex items-center gap-1">
                                <span className={`text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-[#64748B]'}`}>세트</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={15}
                                  value={ex.sets}
                                  onChange={(e) => handleUpdateExercise(ex.id, { sets: Math.max(1, parseInt(e.target.value) || 1) })}
                                  className={`w-12 px-2 py-1 text-xs text-center font-mono font-bold rounded-lg border outline-none ${
                                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181F] border-[#272732] text-white'
                                  }`}
                                />
                              </div>

                              <div className="flex items-center gap-1">
                                <span className={`text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-[#64748B]'}`}>목표</span>
                                <input
                                  type="text"
                                  value={ex.reps}
                                  onChange={(e) => handleUpdateExercise(ex.id, { reps: e.target.value })}
                                  className={`w-16 px-2 py-1 text-xs text-center font-mono font-bold rounded-lg border outline-none ${
                                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#18181F] border-[#272732] text-white'
                                  }`}
                                />
                              </div>

                              {/* Reorder and Delete Actions */}
                              <div className="flex items-center gap-1 pl-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveExercise(idx, 'up')}
                                  className={`p-1.5 rounded-lg border transition-colors disabled:opacity-30 ${
                                    isLight ? 'hover:bg-slate-100 border-slate-200' : 'hover:bg-[#272732] border-[#272732]'
                                  }`}
                                  aria-label="위로 이동"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === activeDay.exercises.length - 1}
                                  onClick={() => handleMoveExercise(idx, 'down')}
                                  className={`p-1.5 rounded-lg border transition-colors disabled:opacity-30 ${
                                    isLight ? 'hover:bg-slate-100 border-slate-200' : 'hover:bg-[#272732] border-[#272732]'
                                  }`}
                                  aria-label="아래로 이동"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExercise(ex.id)}
                                  className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                                  aria-label="삭제"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Fixed Action Bar */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#18181F] border-[#272732]'
        }`}>
          <button
            onClick={() => {
              if (window.confirm('기본 4분할 루틴으로 완전히 초기화하시겠습니까?')) {
                const def = JSON.parse(JSON.stringify(ROUTINE_PRESETS[0].splitDays));
                setWorkingSplit(def);
                onSaveSplit(def);
                onClose();
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 min-h-[44px] ${
              isLight ? 'border-slate-300 text-slate-600 hover:bg-slate-200' : 'border-[#272732] text-[#94A3B8] hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본값 리셋</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              취소
            </button>
            <button
              onClick={handleSaveAll}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shadow-lg min-h-[44px] ${
                isLight
                  ? 'bg-lime-600 hover:bg-lime-700 text-white shadow-lime-500/20'
                  : 'bg-[#D4FF00] hover:bg-[#CCFF00] text-black shadow-[#D4FF00]/25'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>루틴 저장 및 적용</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXERCISE PICKER DRAWER / MODAL */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-lg max-h-[80vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#18181F] border-[#272732] text-white'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-[#272732]'}`}>
              <h3 className="text-sm font-black flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-lime-500" />
                <span>운동 종목 라이브러리에서 선택</span>
              </h3>
              <button
                onClick={() => setIsExercisePickerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Category Chips */}
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  placeholder="종목명 또는 부위 검색 (예: 벤치, 데드, 광배)"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-[#111115] border-[#272732] text-white'
                  }`}
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'chest', label: '가슴' },
                  { id: 'back', label: '등' },
                  { id: 'legs', label: '하체' },
                  { id: 'shoulders', label: '어깨' },
                  { id: 'arms', label: '팔' },
                  { id: 'core', label: '코어' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 transition-colors ${
                      selectedCategory === c.id
                        ? isLight
                          ? 'bg-slate-900 text-white'
                          : 'bg-[#D4FF00] text-black font-black'
                        : isLight
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-[#111115] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredLibrary.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddExerciseFromLibrary(item)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-lime-500 hover:bg-lime-50/40'
                      : 'bg-[#111115] border-[#272732] hover:border-[#D4FF00]/50 hover:bg-[#1F1F2A]'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-black">{item.name}</h4>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                      {item.targetMuscle} · 기본 {item.defaultSets}세트 × {item.defaultReps}
                    </span>
                  </div>

                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    isLight ? 'bg-slate-200 text-slate-800' : 'bg-[#272732] text-[#D4FF00]'
                  }`}>
                    + 추가
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
