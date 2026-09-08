/**
 * 요일별 운동 루틴 모델 인터페이스 (Weekly Split Routine)
 */

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface IRoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number; // kg
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
}

export interface IWeeklyRoutineDay {
  dayOfWeek: DayOfWeek;
  dayNumber: number; // 0: 일, 1: 월, 2: 화, 3: 수, 4: 목, 5: 금, 6: 토
  koreanName: string; // '월', '화', ...
  fullKoreanName: string; // '월요일', '화요일', ...
  title: string; // '가슴 & 삼두 (Push)'
  subtitle: string; // '대흉근 상/중부 및 삼두 집중 과부하'
  isRestDay: boolean;
  targetMuscles: string[];
  exercises: IRoutineExercise[];
}

export interface IWeeklyRoutinePlan {
  id: string;
  name: string; // '3대 500 지향 4분할 루틴', '클래식 PPL 3분할'
  days: Record<DayOfWeek, IWeeklyRoutineDay>;
}
