import React, { useState } from 'react';
import { X, Dumbbell, Plus } from 'lucide-react';
import { ExerciseLibraryService, ICustomExerciseInput } from '../services/exercise/ExerciseLibraryService';
import { IMasterExercise } from '../data/exerciseLibrary';
import { ThemeMode } from '../theme/pantone';
import { TdsBadge, TdsButton } from './tds';
import confetti from 'canvas-confetti';

export interface CustomExerciseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseCreated: (newEx: IMasterExercise) => void;
  themeMode?: ThemeMode;
}

export const CustomExerciseCreateModal: React.FC<CustomExerciseCreateModalProps> = ({
  isOpen,
  onClose,
  onExerciseCreated,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core'>('chest');
  const [equipment, setEquipment] = useState<'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight'>('machine');
  const [targetMuscle, setTargetMuscle] = useState<string>('');
  const [defaultSets, setDefaultSets] = useState<number>(3);
  const [defaultReps, setDefaultReps] = useState<string>('10-12회');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('운동 종목 이름을 입력해 주세요.');
      return;
    }

    const input: ICustomExerciseInput = {
      name: name.trim(),
      category,
      equipment,
      targetMuscle: targetMuscle.trim(),
      defaultSets,
      defaultReps,
      defaultRestSeconds: equipment === 'barbell' ? 120 : 90,
    };

    const created = ExerciseLibraryService.addCustomExercise(input);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onExerciseCreated(created);
    onClose();
  };

  const categories = [
    { id: 'chest', label: '가슴' },
    { id: 'back', label: '등' },
    { id: 'legs', label: '하체' },
    { id: 'shoulders', label: '어깨' },
    { id: 'arms', label: '팔' },
    { id: 'core', label: '코어' },
  ] as const;

  const equipments = [
    { id: 'barbell', label: '바벨 (Barbell)' },
    { id: 'dumbbell', label: '덤벨 (Dumbbell)' },
    { id: 'machine', label: '머신 (Machine)' },
    { id: 'cable', label: '케이블 (Cable)' },
    { id: 'bodyweight', label: '맨몸 (Bodyweight)' },
  ] as const;

  return (
    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border transition-all flex flex-col ${
          isLight ? 'bg-white border-slate-100 text-slate-900' : 'bg-[#1C1C1E] border-[#2C2C2E] text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#3182F6] flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  새 운동 종목 등록
                </h3>
                <TdsBadge variant="weak" color="blue" size="xsmall">커스텀</TdsBadge>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                다니시는 헬스장의 특정 기구나 종목을 추가해보세요
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exercise Name */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              운동 종목 이름 <span className="text-[#F04452]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 해머스트렝스 인클라인 체스트 프레스"
              required
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border outline-none transition-all ${
                isLight ? 'bg-[#F2F4F6] border-transparent text-slate-900 focus:bg-white focus:border-[#3182F6]' : 'bg-[#252528] border-transparent text-white focus:border-[#3182F6]'
              }`}
            />
          </div>

          {/* Target Muscle Detail (Optional) */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              세부 자극 부위 <span className="text-slate-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={targetMuscle}
              onChange={(e) => setTargetMuscle(e.target.value)}
              placeholder="예: 상부 가슴, 광배근 하부, 측면 삼각근"
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border outline-none transition-all ${
                isLight ? 'bg-[#F2F4F6] border-transparent text-slate-900 focus:bg-white focus:border-[#3182F6]' : 'bg-[#252528] border-transparent text-white focus:border-[#3182F6]'
              }`}
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              목표 부위
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    category === cat.id
                      ? 'bg-[#3182F6] text-white shadow-sm'
                      : isLight
                      ? 'bg-[#F2F4F6] text-slate-600 hover:bg-slate-200'
                      : 'bg-[#252528] text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Selector */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              운동 기구 형태
            </label>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {equipments.map((eq) => (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => setEquipment(eq.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    equipment === eq.id
                      ? 'bg-[#00BFA5] text-white font-bold'
                      : isLight
                      ? 'bg-[#F2F4F6] text-slate-600 hover:bg-slate-200'
                      : 'bg-[#252528] text-slate-400 hover:text-white'
                  }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sets & Reps Defaults */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                기본 세트수
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={defaultSets}
                onChange={(e) => setDefaultSets(parseInt(e.target.value) || 3)}
                className={`w-full px-3 py-2 text-xs font-bold font-mono-num rounded-xl border outline-none ${
                  isLight ? 'bg-[#F2F4F6] border-transparent text-slate-900' : 'bg-[#252528] border-transparent text-white'
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                목표 반복수
              </label>
              <input
                type="text"
                value={defaultReps}
                onChange={(e) => setDefaultReps(e.target.value)}
                placeholder="예: 10-12회"
                className={`w-full px-3 py-2 text-xs font-bold font-mono-num rounded-xl border outline-none ${
                  isLight ? 'bg-[#F2F4F6] border-transparent text-slate-900' : 'bg-[#252528] border-transparent text-white'
                }`}
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <TdsButton
              type="submit"
              variant="primary"
              size="medium"
              fullWidth
            >
              <div className="flex items-center justify-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>새 운동 종목 등록 완료</span>
              </div>
            </TdsButton>
          </div>
        </form>
      </div>
    </div>
  );
};
