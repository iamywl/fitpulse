export type ExerciseCategory = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weight: number; // in kg
  reps: number;
  completed: boolean;
  isWarmup?: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  durationMinutes: number;
  exercises: ExerciseLog[];
  memo?: string;
  totalVolume: number; // sum of weight * reps for completed sets
}

export interface InBodyData {
  gender: 'male' | 'female';
  weight: number; // kg
  muscleMass: number; // kg (골격근량)
  bodyFatPercent: number; // %
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  updatedAt: string;
}

export interface RecommendedWeight {
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  estimated1RM: number;
  warmupSet: { weight: number; reps: number };
  hypertrophySet: { weight: number; reps: number }; // 8-10 reps
  strengthSet: { weight: number; reps: number };     // 5 reps
  rationale: string;
}
