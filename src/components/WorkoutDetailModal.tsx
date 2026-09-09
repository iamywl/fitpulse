import React from 'react';
import { WorkoutSession } from '../models/fitness';
import { VolumeService } from '../services/calculator/VolumeService';
import { X, Calendar, Clock, Trash2 } from 'lucide-react';
import { ThemeMode } from '../theme/pantone';
import { TdsBadge, TdsButton } from './tds';

interface WorkoutDetailModalProps {
  workout: WorkoutSession | null;
  onClose: () => void;
  onDelete?: (workoutId: string) => void;
  themeMode?: ThemeMode;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  workout,
  onClose,
  onDelete,
  themeMode = 'dark',
}) => {
  if (!workout) return null;
  const isLight = themeMode === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-all ${
          isLight ? 'bg-white border-slate-100 text-slate-900' : 'bg-[#1C1C1E] border-[#2C2C2E] text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${isLight ? 'border-slate-100' : 'border-[#2C2C2E]'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TdsBadge variant="weak" color="blue" size="small">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{workout.date}</span>
                </span>
              </TdsBadge>
            </div>
            <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{workout.title}</h2>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          <div className={`grid grid-cols-2 gap-3 p-4 rounded-2xl transition-colors ${isLight ? 'bg-[#F8F9FA] border border-slate-100' : 'bg-[#252528]'}`}>
            <div>
              <span className={`text-xs font-medium block mb-1 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>총 수행 볼륨</span>
              <div className="text-xl font-bold font-mono-num text-[#3182F6]">
                {VolumeService.formatKg(workout.totalVolume)}
              </div>
            </div>
            <div>
              <span className={`text-xs font-medium block mb-1 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>운동 시간</span>
              <div className="text-xl font-bold font-mono-num flex items-center gap-1 text-[#00BFA5]">
                <Clock className="w-4 h-4" />
                <span>{workout.durationMinutes}분</span>
              </div>
            </div>
          </div>

          {workout.memo && (
            <div className={`p-4 rounded-2xl text-xs leading-relaxed ${isLight ? 'bg-[#F8F9FA] text-slate-700' : 'bg-[#252528] text-slate-300'}`}>
              <span className={`font-semibold block mb-1 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>운동 메모</span>
              {workout.memo}
            </div>
          )}

          {/* Exercises & Sets */}
          <div className="space-y-3">
            <h3 className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              운동 세부 내역 ({workout.exercises.length}개 종목)
            </h3>
            {workout.exercises.map((ex, idx) => (
              <div
                key={ex.id || idx}
                className={`rounded-2xl p-4 transition-colors border ${
                  isLight ? 'bg-[#F8F9FA] border-slate-100' : 'bg-[#252528] border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{ex.exerciseName}</span>
                  <TdsBadge variant="weak" color="elephant" size="xsmall">
                    {ex.category}
                  </TdsBadge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {ex.sets.map((s, sIdx) => (
                    <div
                      key={s.id || sIdx}
                      className={`p-2.5 rounded-xl font-mono-num text-center transition-colors ${
                        s.completed
                          ? isLight
                            ? 'bg-white border border-blue-100 text-slate-900 shadow-sm'
                            : 'bg-[#1C1C1E] border border-blue-950/60 text-white'
                          : isLight
                          ? 'bg-slate-100 border-dashed border-slate-200 text-slate-400'
                          : 'bg-[#1C1C1E] border-dashed border-[#333D4B] text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">Set #{s.setNumber}</div>
                      <div className={`font-bold text-xs mt-0.5 ${s.completed ? 'text-[#3182F6]' : 'text-slate-400'}`}>
                        {s.weight}kg × {s.reps}회
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-between items-center ${isLight ? 'border-slate-100 bg-[#F8F9FA]' : 'border-[#2C2C2E] bg-[#1C1C1E]'}`}>
          {onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('이 운동 기록을 삭제하시겠습니까?')) {
                  onDelete(workout.id);
                  onClose();
                }
              }}
              className="text-xs text-[#F04452] font-semibold px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>기록 삭제</span>
            </button>
          ) : <div />}
          <TdsButton
            variant="secondary"
            size="small"
            onClick={onClose}
          >
            <span>닫기</span>
          </TdsButton>
        </div>
      </div>
    </div>
  );
};
