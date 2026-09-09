import React, { useState } from 'react';
import { IExerciseLog, IExerciseSet, IRecommendedWeight, WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { X, Plus, Trash2, CheckCircle2, Dumbbell, Calendar, Clock, Flame, Check } from 'lucide-react';
import { ThemeMode } from '../theme/pantone';
import { TdsBadge, TdsButton } from './tds';

interface WorkoutLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWorkout: (workout: WorkoutSession) => void;
  initialPreset?: IRecommendedWeight | null;
  themeMode?: ThemeMode;
}

const DEFAULT_EXERCISE_OPTIONS = [
  { id: 'bench-press', name: '바벨 벤치프레스', category: 'chest' as const },
  { id: 'incline-db-press', name: '인클라인 덤벨 프레스', category: 'chest' as const },
  { id: 'squat', name: '바벨 백스쿼트', category: 'legs' as const },
  { id: 'leg-press', name: '레그 프레스', category: 'legs' as const },
  { id: 'deadlift', name: '컨벤셔널 데드리프트', category: 'back' as const },
  { id: 'barbell-row', name: '바벨 로우', category: 'back' as const },
  { id: 'ohp', name: '오버헤드 프레스 (OHP)', category: 'shoulders' as const },
  { id: 'lat-pulldown', name: '랫 풀다운', category: 'back' as const },
  { id: 'cable-fly', name: '케이블 크로스오버 플라이', category: 'chest' as const },
];

export const WorkoutLogModal: React.FC<WorkoutLogModalProps> = ({
  isOpen,
  onClose,
  onSaveWorkout,
  initialPreset,
  themeMode = 'dark',
}) => {
  const isLight = themeMode === 'light';
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [title, setTitle] = useState<string>('오늘의 파워 루틴');
  const [durationMinutes, setDurationMinutes] = useState<number>(65);
  const [memo, setMemo] = useState<string>('');

  const [exercises, setExercises] = useState<IExerciseLog[]>(() => {
    if (initialPreset) {
      return [
        {
          id: 'ex-preset-1',
          exerciseId: initialPreset.exerciseId,
          exerciseName: initialPreset.exerciseName,
          category: initialPreset.category,
          sets: [
            { id: 's1', setNumber: 1, weight: initialPreset.warmupSet.weight, reps: initialPreset.warmupSet.reps, completed: true, isWarmup: true },
            { id: 's2', setNumber: 2, weight: initialPreset.hypertrophySet.weight, reps: initialPreset.hypertrophySet.reps, completed: true },
            { id: 's3', setNumber: 3, weight: initialPreset.hypertrophySet.weight, reps: initialPreset.hypertrophySet.reps, completed: true },
            { id: 's4', setNumber: 4, weight: initialPreset.hypertrophySet.weight, reps: initialPreset.hypertrophySet.reps, completed: true },
          ]
        }
      ];
    }
    return [
      {
        id: 'ex-default-1',
        exerciseId: 'bench-press',
        exerciseName: '바벨 벤치프레스',
        category: 'chest',
        sets: [
          { id: 's1', setNumber: 1, weight: 60, reps: 10, completed: true, isWarmup: true },
          { id: 's2', setNumber: 2, weight: 70, reps: 8, completed: true },
          { id: 's3', setNumber: 3, weight: 75, reps: 6, completed: true },
          { id: 's4', setNumber: 4, weight: 80, reps: 5, completed: true },
        ]
      }
    ];
  });

  if (!isOpen) return null;

  const currentTotalVolume = VolumeService.calculateSessionVolume(exercises);

  const handleAddExercise = (opt: typeof DEFAULT_EXERCISE_OPTIONS[0]) => {
    const newEx: IExerciseLog = {
      id: `ex-${Date.now()}`,
      exerciseId: opt.id,
      exerciseName: opt.name,
      category: opt.category,
      sets: [
        { id: `s-${Date.now()}-1`, setNumber: 1, weight: 60, reps: 10, completed: true }
      ]
    };
    setExercises(prev => [...prev, newEx]);
  };

  const handleRemoveExercise = (exId: string) => {
    setExercises(prev => prev.filter(e => e.id !== exId));
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: IExerciseSet = {
          id: `s-${Date.now()}-${ex.sets.length + 1}`,
          setNumber: ex.sets.length + 1,
          weight: lastSet ? lastSet.weight : 60,
          reps: lastSet ? lastSet.reps : 10,
          completed: true,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      })
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id !== exerciseId) return ex;
        if (ex.sets.length <= 1) return ex;
        const filtered = ex.sets.filter(s => s.id !== setId);
        const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...ex, sets: renumbered };
      })
    );
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps' | 'completed', value: any) => {
    setExercises(prev =>
      prev.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const updated = ex.sets.map(s => {
          if (s.id !== setId) return s;
          return { ...s, [field]: value };
        });
        return { ...ex, sets: updated };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      date,
      title: title || '오늘의 운동',
      durationMinutes: durationMinutes || 60,
      exercises,
      memo,
      totalVolume: currentTotalVolume,
    };
    onSaveWorkout(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-2xl rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border transition-all ${
          isLight ? 'bg-white border-slate-100 text-slate-900' : 'bg-[#1C1C1E] border-[#2C2C2E] text-white'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-5 border-b ${isLight ? 'border-slate-100' : 'border-[#2C2C2E]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#3182F6] flex items-center justify-center font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>운동 일지 작성</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>종목별 중량과 횟수를 적으면 총 볼륨을 자동으로 계산해요</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-[#252528] hover:bg-[#333D4B] text-slate-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                <Calendar className="w-3.5 h-3.5 text-[#3182F6]" />
                운동 날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none border transition-all ${
                  isLight
                    ? 'bg-[#F2F4F6] border-transparent text-slate-900 focus:bg-white focus:border-[#3182F6]'
                    : 'bg-[#252528] border-transparent text-white focus:border-[#3182F6]'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                루틴 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 가슴 & 삼두 파워 데이"
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none border transition-all ${
                  isLight
                    ? 'bg-[#F2F4F6] border-transparent text-slate-900 focus:bg-white focus:border-[#3182F6]'
                    : 'bg-[#252528] border-transparent text-white focus:border-[#3182F6]'
                }`}
                required
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                <Clock className="w-3.5 h-3.5 text-[#00BFA5]" />
                운동 시간 (분)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono-num outline-none border transition-all ${
                  isLight
                    ? 'bg-[#F2F4F6] border-transparent text-slate-900 focus:bg-white focus:border-[#3182F6]'
                    : 'bg-[#252528] border-transparent text-white focus:border-[#3182F6]'
                }`}
              />
            </div>
          </div>

          {/* Realtime Volume Preview Banner */}
          <div
            className={`rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-colors border ${
              isLight
                ? 'bg-blue-50/50 border-blue-100'
                : 'bg-[#252528] border-transparent'
            }`}
          >
            <div>
              <span className="text-xs font-semibold text-[#3182F6] block mb-1">
                실시간 세션 총 볼륨
              </span>
              <div className={`text-2xl sm:text-3xl font-bold font-mono-num ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {VolumeService.formatKg(currentTotalVolume)}
              </div>
            </div>
            <div className={`text-right text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              총 {exercises.length}개 종목 ·{' '}
              <strong className="font-bold font-mono-num text-[#3182F6]">
                {exercises.reduce((sum, e) => sum + e.sets.filter(s => s.completed).length, 0)}세트
              </strong>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            <h3 className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              수행 종목 및 세트
            </h3>

            {exercises.map((ex, exIdx) => {
              const exVol = VolumeService.calculateExerciseVolume(ex);
              return (
                <div
                  key={ex.id}
                  className={`rounded-2xl p-4 space-y-3 transition-colors border ${
                    isLight ? 'bg-[#F8F9FA] border-slate-100' : 'bg-[#252528] border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                        isLight ? 'bg-blue-100 text-[#3182F6]' : 'bg-[#1C1C1E] text-[#3182F6]'
                      }`}>
                        {exIdx + 1}
                      </span>
                      <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{ex.exerciseName}</span>
                      <TdsBadge variant="weak" color="elephant" size="xsmall">
                        {ex.category}
                      </TdsBadge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono-num text-[#3182F6]">
                        {VolumeService.formatKg(exVol)}
                      </span>
                      {exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(ex.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sets */}
                  <div className="space-y-2">
                    {ex.sets.map((set) => (
                      <div
                        key={set.id}
                        className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${
                          isLight ? 'bg-white' : 'bg-[#1C1C1E]'
                        }`}
                      >
                        <span className="text-xs font-bold w-12 text-slate-400">
                          #{set.setNumber}
                        </span>

                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => handleUpdateSet(ex.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                            className={`w-20 rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono-num outline-none border ${
                              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#252528] border-transparent text-white'
                            }`}
                            placeholder="kg"
                          />
                          <span className="text-xs text-slate-400">kg</span>

                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => handleUpdateSet(ex.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                            className={`w-16 rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono-num outline-none border ${
                              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#252528] border-transparent text-white'
                            }`}
                            placeholder="회"
                          />
                          <span className="text-xs text-slate-400">회</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUpdateSet(ex.id, set.id, 'completed', !set.completed)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            set.completed
                              ? 'bg-[#3182F6] text-white'
                              : isLight ? 'bg-slate-100 text-slate-300' : 'bg-[#252528] text-slate-600'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        {ex.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(ex.id, set.id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddSet(ex.id)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border border-dashed ${
                        isLight ? 'border-slate-200 text-slate-500 hover:bg-white' : 'border-[#333D4B] text-slate-400 hover:bg-[#1C1C1E]'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 text-[#3182F6]" />
                      <span>세트 추가</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Exercise Chips */}
            <div>
              <span className={`block text-xs font-semibold mb-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                빠른 종목 추가
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_EXERCISE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleAddExercise(opt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                      isLight
                        ? 'bg-[#F2F4F6] hover:bg-slate-200 text-slate-700'
                        : 'bg-[#252528] hover:bg-[#333D4B] text-slate-300'
                    }`}
                  >
                    <Plus className="w-3 h-3 text-[#3182F6]" />
                    <span>{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Memo textarea */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              운동 메모 (컨디션, 특이사항)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="오늘 벤치프레스 세트 증량 성공, 어깨 가동범위 양호..."
              rows={2}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border transition-all ${
                isLight
                  ? 'bg-[#F2F4F6] border-transparent text-slate-900 focus:bg-white focus:border-[#3182F6]'
                  : 'bg-[#252528] border-transparent text-white focus:border-[#3182F6]'
              }`}
            />
          </div>

          {/* Footer Submit */}
          <div className={`pt-3 flex items-center justify-end gap-3 border-t ${isLight ? 'border-slate-100' : 'border-[#2C2C2E]'}`}>
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
              onClick={() => {}}
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>기록 저장 및 볼륨 반영</span>
              </div>
            </TdsButton>
          </div>
        </form>
      </div>
    </div>
  );
};
