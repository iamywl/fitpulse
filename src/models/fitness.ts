/**
 * SOLID - Interface Segregation Principle (ISP)
 * 도메인 모델 인터페이스 분리 정의
 */

export type ExerciseCategory = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';

export interface IExerciseSet {
  id: string;
  setNumber: number;
  weight: number;      // 무게 (kg)
  reps: number;        // 반복 횟수 (회)
  completed: boolean;  // 수행 완료 여부
  isWarmup?: boolean;  // 웜업 세트 플래그
  rpe?: number;        // 운동자각도 (옵션)
}

export interface IExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  sets: IExerciseSet[];
}

export interface IWorkoutSession {
  id: string;
  date: string;        // YYYY-MM-DD
  title: string;
  durationMinutes: number;
  exercises: IExerciseLog[];
  memo?: string;
  totalVolume: number; // 세션 총 볼륨 (kg)
}

export interface IInBodyData {
  gender: 'male' | 'female';
  weight: number;          // 체중 (kg)
  muscleMass: number;      // 골격근량 (kg)
  bodyFatPercent: number;  // 체지방률 (%)
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  updatedAt: string;
}

export interface IRecommendedWeight {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  estimated1RM: number;
  warmupSet: { weight: number; reps: number };
  hypertrophySet: { weight: number; reps: number };
  strengthSet: { weight: number; reps: number };
  rationale: string;
}

export interface IVolumeComparison {
  currentVolume: number;
  previousVolume: number;
  volumeDelta: number;
  percentDelta: number;
  isOverload: boolean;
  isDeload: boolean;
}

/**
 * 과거 볼륨 및 피로도(RPE) 기반 다음 세트 추천 모델
 */
export interface INextSetRecommendation {
  targetWeight: number;            // 추천 무게 (kg)
  targetReps: number;              // 추천 반복수 (회)
  recommendedRestSeconds: number;  // 추천 휴식시간 (초)
  reason: string;                  // 추천 근거 (예: "직전 세션 대비 +3% 과부하 달성 추천")
  statusBadge: 'overload' | 'maintain' | 'fatigue_care';
  statusText: string;              // "과부하 증량" | "페이스 유지" | "피로 관리"
  expectedSetVolume: number;       // 예상 세트 볼륨 (kg)
  restFormatted: string;           // 휴식시간 포맷 (예: "2분", "1분 30초")
  priorVolume?: number;            // 직전 동일 종목 볼륨
}

// 요일별 분할 루틴 모델 (Weekly Split Routine Planner / Viewer)
export interface IWeeklySplitExercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  intensity: 'High' | 'Moderate' | 'Recovery';
  restSeconds: number;
  target1RMPercent?: number;
  tip?: string;
}

export interface IWeeklySplitDay {
  dayIndex: number; // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  dayName: '월' | '화' | '수' | '목' | '금' | '토' | '일';
  dayKey: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  englishShort: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  title: string;
  categoryDesc: string;
  targetMuscles: string[];
  isRestDay: boolean;
  colorType: 'volt' | 'cyan' | 'crimson' | 'rest';
  estimatedMinutes: number;
  exercises: IWeeklySplitExercise[];
}

// 기존 types/fitness.ts 호환 별칭
export type ExerciseSet = IExerciseSet;
export type ExerciseLog = IExerciseLog;
export type WorkoutSession = IWorkoutSession;
export type InBodyData = IInBodyData;
export type RecommendedWeight = IRecommendedWeight;
export type WeeklySplitDay = IWeeklySplitDay;
export type WeeklySplitExercise = IWeeklySplitExercise;
