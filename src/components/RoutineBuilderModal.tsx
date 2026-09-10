import React, { useState } from 'react';
import { IWeeklySplitDay, IWeeklySplitExercise } from '../models/fitness';
import { ROUTINE_PRESETS, RoutinePresetType } from '../data/routinePresets';
import { IMasterExercise } from '../data/exerciseLibrary';
import { ExerciseLibraryService } from '../services/exercise/ExerciseLibraryService';
import { CustomExerciseCreateModal } from './CustomExerciseCreateModal';
import { RoutineService } from '../services/routine/RoutineService';
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
  Layers,
  Share2,
  Copy,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TdsBadge, TdsButton } from './tds';

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
  const [exerciseLibrary, setExerciseLibrary] = useState<IMasterExercise[]>(() => ExerciseLibraryService.getAllExercises());
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState<boolean>(false);
  const [isCustomExerciseModalOpen, setIsCustomExerciseModalOpen] = useState<boolean>(false);
  const [exerciseSearch, setExerciseSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Copy Feedback Toast State
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopyText = async () => {
    const text = RoutineService.exportRoutineToText(workingSplit);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('루틴 텍스트가 복사되었어요! 카카오톡이나 메모장에 붙여넣어 보세요.');
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch {
      setCopyFeedback('클립보드 복사에 실패했습니다.');
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

  const handleCopyJSON = async () => {
    const jsonStr = RoutineService.exportRoutineToJSON(workingSplit);
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopyFeedback('루틴 JSON 데이터가 클립보드에 복사되었어요.');
      setTimeout(() => setCopyFeedback(null), 3000);
    } catch {
      setCopyFeedback('클립보드 복사에 실패했습니다.');
      setTimeout(() => setCopyFeedback(null), 2500);
    }
  };

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

  // Filter master & custom library exercises
  const filteredLibrary = exerciseLibrary.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
                        item.targetMuscle.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-[28px] sm:rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-100 text-slate-900' : 'bg-[#1C1C1E] border-[#2C2C2E] text-white'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-5 border-b ${isLight ? 'border-slate-100' : 'border-[#2C2C2E]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#3182F6] flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">루틴 만들기</h2>
                <TdsBadge variant="weak" color="blue" size="xsmall">맞춤 설정</TdsBadge>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                나만의 분할 루틴을 구성하거나 추천 프리셋을 선택해보세요
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyText}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-[#252528] hover:bg-[#333D4B] text-slate-300 border-[#333D4B]'
              }`}
              title="카카오톡/메모장 공유용 텍스트 복사"
            >
              <Share2 className="w-3.5 h-3.5 text-[#3182F6]" />
              <span className="hidden sm:inline">루틴 내보내기</span>
              <span className="sm:hidden">공유</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-[#252528] hover:bg-[#333D4B] text-slate-300'
              }`}
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copy Feedback Toast Banner */}
        {copyFeedback && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 text-[#3182F6] text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCheck className="w-4 h-4 flex-shrink-0" />
            <span>{copyFeedback}</span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className={`grid grid-cols-2 p-1.5 mx-5 mt-4 rounded-2xl ${
          isLight ? 'bg-slate-100' : 'bg-[#252528]'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'presets'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-[#3182F6] text-white shadow-sm'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>추천 프리셋</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'custom'
                ? isLight
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-[#3182F6] text-white shadow-sm'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>직접 만들기</span>
          </button>
        </div>

        {/* Modal Body Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: PRESET SELECTOR */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                isLight ? 'bg-blue-50/60 text-blue-900' : 'bg-blue-950/30 text-blue-200'
              }`}>
                💡 프리셋을 고르면 요일별 운동 종목, 세트 수, 목표 반복수, 권장 휴식 시간이 한 번에 알맞게 설정돼요.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {ROUTINE_PRESETS.map((preset) => {
                  return (
                    <div
                      key={preset.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        isLight
                          ? 'bg-[#F8F9FA] border-slate-100 hover:border-slate-200 shadow-sm'
                          : 'bg-[#252528] border-transparent hover:border-[#333D4B]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <TdsBadge variant="weak" color="blue" size="xsmall">
                            {preset.badge}
                          </TdsBadge>
                          <span className={`text-xs font-medium ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                            {preset.frequency}
                          </span>
                        </div>

                        <h3 className="text-base font-bold mb-1">{preset.title}</h3>
                        <p className={`text-xs line-clamp-2 mb-3 leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {preset.description}
                        </p>

                        {/* Split Days Preview Chips */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {preset.splitDays.filter(d => !d.isRestDay).slice(0, 4).map(d => (
                            <span
                              key={d.dayKey}
                              className={`text-[11px] px-2 py-0.5 rounded-lg ${
                                isLight ? 'bg-white text-slate-700 border border-slate-100' : 'bg-[#1C1C1E] text-slate-300'
                              }`}
                            >
                              {d.dayName}: {d.title.split('(')[0]}
                            </span>
                          ))}
                        </div>
                      </div>

                      <TdsButton
                        variant="primary"
                        size="medium"
                        fullWidth
                        onClick={() => handleApplyPreset(preset.id)}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>이 루틴으로 시작하기</span>
                        </div>
                      </TdsButton>
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
                      type="button"
                      onClick={() => setSelectedDayIndex(day.dayIndex)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all min-h-[56px] ${
                        isSelected
                          ? isLight
                            ? 'bg-white border-2 border-[#3182F6] shadow-sm'
                            : 'bg-[#252528] border-2 border-[#3182F6]'
                          : isLight
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-[#252528]/50 text-slate-400 hover:bg-[#252528]'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-semibold">{day.englishShort}</span>
                      <span className={`text-xs font-bold ${isSelected ? (isLight ? 'text-slate-900' : 'text-white') : ''}`}>
                        {day.dayName}
                      </span>
                      <span className="mt-1">
                        {day.isRestDay ? (
                          <span className={`w-1.5 h-1.5 rounded-full block ${isLight ? 'bg-slate-300' : 'bg-slate-600'}`} />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full block bg-[#3182F6]" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Meta Card */}
              <div className={`p-5 rounded-2xl border ${isLight ? 'bg-[#F8F9FA] border-slate-100' : 'bg-[#252528] border-transparent'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {activeDay.dayName}요일 루틴 이름
                    </label>
                    <input
                      type="text"
                      value={activeDay.title}
                      onChange={(e) => updateActiveDayField('title', e.target.value)}
                      placeholder="예: 가슴 & 삼두 (Chest & Triceps)"
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border outline-none transition-all ${
                        isLight ? 'bg-white border-slate-200 text-slate-900 focus:border-[#3182F6]' : 'bg-[#1C1C1E] border-transparent text-white focus:border-[#3182F6]'
                      }`}
                    />
                  </div>

                  {/* Rest Day Toggle */}
                  <div className="flex items-center gap-2 pt-1 sm:pt-4">
                    <button
                      type="button"
                      onClick={handleToggleRestDay}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                        activeDay.isRestDay
                          ? isLight
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-amber-500/20 text-amber-300'
                          : isLight
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-[#333D4B] text-slate-300 hover:text-white'
                      }`}
                    >
                      <span>{activeDay.isRestDay ? '😴 휴식일 해제' : '☕ 이 날은 휴식일로 하기'}</span>
                    </button>
                  </div>
                </div>

                {/* Exercises List in Active Day */}
                {!activeDay.isRestDay && (
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        운동 종목 ({activeDay.exercises.length}개)
                      </span>

                      <button
                        type="button"
                        onClick={() => setIsExercisePickerOpen(true)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#3182F6] hover:bg-[#1B64DA] text-white transition-all flex items-center gap-1 min-h-[36px]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>종목 추가하기</span>
                      </button>
                    </div>

                    {activeDay.exercises.length === 0 ? (
                      <div className={`p-6 text-center rounded-2xl border border-dashed text-xs ${
                        isLight ? 'border-slate-200 text-slate-400' : 'border-[#333D4B] text-slate-400'
                      }`}>
                        종목이 아직 없어요. 위의 <strong>[+ 종목 추가하기]</strong> 버튼을 눌러 운동을 구성해보세요!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {activeDay.exercises.map((ex, idx) => (
                          <div
                            key={ex.id}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isLight ? 'bg-white border-slate-100' : 'bg-[#1C1C1E] border-transparent'
                            }`}
                          >
                            {/* Left Info */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className={`text-xs font-mono font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                0{idx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs sm:text-sm font-bold truncate">{ex.name}</h4>
                                <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                                  {ex.targetMuscle} · 휴식 {ex.restSeconds}초
                                </span>
                              </div>
                            </div>

                            {/* Center Steppers: Sets & Reps */}
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-slate-400">세트</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={15}
                                  value={ex.sets}
                                  onChange={(e) => handleUpdateExercise(ex.id, { sets: Math.max(1, parseInt(e.target.value) || 1) })}
                                  className={`w-12 px-2 py-1 text-xs text-center font-mono font-bold rounded-lg border outline-none ${
                                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#252528] border-transparent text-white'
                                  }`}
                                />
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-slate-400">목표</span>
                                <input
                                  type="text"
                                  value={ex.reps}
                                  onChange={(e) => handleUpdateExercise(ex.id, { reps: e.target.value })}
                                  className={`w-16 px-2 py-1 text-xs text-center font-mono font-bold rounded-lg border outline-none ${
                                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#252528] border-transparent text-white'
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
                                    isLight ? 'hover:bg-slate-100 border-slate-200' : 'hover:bg-[#333D4B] border-[#333D4B]'
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
                                    isLight ? 'hover:bg-slate-100 border-slate-200' : 'hover:bg-[#333D4B] border-[#333D4B]'
                                  }`}
                                  aria-label="아래로 이동"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExercise(ex.id)}
                                  className="p-1.5 rounded-lg text-[#F04452] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
          isLight ? 'bg-slate-50 border-slate-100' : 'bg-[#1C1C1E] border-[#2C2C2E]'
        }`}>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('기본 4분할 루틴으로 완전히 초기화하시겠습니까?')) {
                const def = JSON.parse(JSON.stringify(ROUTINE_PRESETS[0].splitDays));
                setWorkingSplit(def);
                onSaveSplit(def);
                onClose();
              }
            }}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 min-h-[44px] ${
              isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본값 리셋</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJSON}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 min-h-[44px] border ${
              isLight ? 'text-slate-500 border-slate-200 hover:bg-slate-100' : 'text-slate-400 border-[#333D4B] hover:bg-[#2C2C2E]'
            }`}
            title="JSON 데이터로 내보내기"
          >
            <Copy className="w-3 h-3" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <div className="flex items-center gap-2">
            <TdsButton
              variant="weak"
              size="medium"
              onClick={onClose}
            >
              <span>취소</span>
            </TdsButton>
            <TdsButton
              variant="primary"
              size="medium"
              onClick={handleSaveAll}
            >
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>루틴 저장 및 적용</span>
              </div>
            </TdsButton>
          </div>
        </div>
      </div>

      {/* EXERCISE PICKER DRAWER / MODAL */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-lg max-h-[80vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            isLight ? 'bg-white border-slate-100 text-slate-900' : 'bg-[#1C1C1E] border-[#2C2C2E] text-white'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-slate-100' : 'border-[#2C2C2E]'}`}>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#3182F6]" />
                <h3 className="text-sm font-bold">운동 종목 선택</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomExerciseModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#3182F6] hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-bold transition-all min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>직접 등록</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExercisePickerOpen(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#252528] text-slate-300'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search & Category Chips */}
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  placeholder="종목명 또는 부위 검색 (예: 벤치, 데드, 광배)"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border outline-none transition-all ${
                    isLight ? 'bg-[#F2F4F6] border-transparent text-slate-900 focus:bg-white focus:border-[#3182F6]' : 'bg-[#252528] border-transparent text-white focus:border-[#3182F6]'
                  }`}
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
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
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${
                      selectedCategory === c.id
                        ? 'bg-[#3182F6] text-white font-bold'
                        : isLight
                        ? 'bg-[#F2F4F6] text-slate-600 hover:bg-slate-200'
                        : 'bg-[#252528] text-slate-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredLibrary.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddExerciseFromLibrary(item)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isLight
                      ? 'bg-[#F8F9FA] border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'
                      : 'bg-[#252528] border-transparent hover:border-[#333D4B] hover:bg-[#2C2C2E]'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold">{item.name}</h4>
                    <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                      {item.targetMuscle} · 기본 {item.defaultSets}세트 × {item.defaultReps}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#3182F6] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40">
                    + 추가
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <CustomExerciseCreateModal
        isOpen={isCustomExerciseModalOpen}
        onClose={() => setIsCustomExerciseModalOpen(false)}
        themeMode={themeMode}
        onExerciseCreated={(newEx) => {
          const updated = ExerciseLibraryService.getAllExercises();
          setExerciseLibrary(updated);
          handleAddExerciseFromLibrary(newEx);
          setIsExercisePickerOpen(false);
        }}
      />
    </div>
  );
};
