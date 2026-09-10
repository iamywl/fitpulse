/**
 * SOLID - Single Responsibility Principle (SRP)
 * 운동 종목 라이브러리 및 사용자 정의(커스텀) 종목 영속화 관리 서비스
 */
import { IMasterExercise, MASTER_EXERCISE_LIBRARY } from '../../data/exerciseLibrary';
import { storageService } from '../storage/LocalStorageService';

export interface ICustomExerciseInput {
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
  equipment: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';
  targetMuscle: string;
  defaultSets?: number;
  defaultReps?: string;
  defaultRestSeconds?: number;
  tip?: string;
}

const STORAGE_CUSTOM_EXERCISES_KEY = 'FITPULSE_CUSTOM_EXERCISES';

export class ExerciseLibraryService {
  /**
   * 로컬 스토리지에 저장된 사용자 정의 커스텀 운동 목록 조회
   */
  static getCustomExercises(): IMasterExercise[] {
    return storageService.getItem<IMasterExercise[]>(STORAGE_CUSTOM_EXERCISES_KEY, []);
  }

  /**
   * 신규 커스텀 운동 등록 및 영구 저장
   */
  static addCustomExercise(input: ICustomExerciseInput): IMasterExercise {
    const existing = this.getCustomExercises();
    const id = `custom-ex-${Date.now()}`;
    const newEx: IMasterExercise = {
      id,
      name: input.name.trim(),
      category: input.category,
      targetMuscle: input.targetMuscle.trim() || this.getDefaultMuscleName(input.category),
      defaultSets: input.defaultSets || 3,
      defaultReps: input.defaultReps || '10-12회',
      defaultRestSeconds: input.defaultRestSeconds || 90,
      intensity: 'Moderate',
      tip: input.tip?.trim() || `${input.equipment} 운동`,
    };

    const updated = [newEx, ...existing];
    storageService.setItem(STORAGE_CUSTOM_EXERCISES_KEY, updated);
    return newEx;
  }

  /**
   * 커스텀 운동 삭제
   */
  static deleteCustomExercise(id: string): void {
    const existing = this.getCustomExercises();
    const filtered = existing.filter(ex => ex.id !== id);
    storageService.setItem(STORAGE_CUSTOM_EXERCISES_KEY, filtered);
  }

  /**
   * 기본 마스터 라이브러리와 사용자 정의 커스텀 운동을 결합한 전체 목록 반환
   */
  static getAllExercises(): IMasterExercise[] {
    const custom = this.getCustomExercises();
    return [...custom, ...MASTER_EXERCISE_LIBRARY];
  }

  private static getDefaultMuscleName(cat: string): string {
    switch (cat) {
      case 'chest': return '가슴 (전체)';
      case 'back': return '등 / 광배근';
      case 'legs': return '하체 / 대퇴사두';
      case 'shoulders': return '어깨 / 삼각근';
      case 'arms': return '팔 / 이두·삼두';
      case 'core': return '코어 / 복근';
      default: return '전신';
    }
  }
}
