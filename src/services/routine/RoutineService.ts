import { DayOfWeek, IWeeklyRoutineDay, IWeeklyRoutinePlan } from '../../models/routine';
import { IWeeklySplitDay } from '../../models/fitness';
import { DEFAULT_WEEKLY_SPLIT } from '../../data/splitRoutineData';
import { ROUTINE_PRESETS, RoutinePresetType } from '../../data/routinePresets';
import { storageService } from '../storage/LocalStorageService';

const STORAGE_ROUTINE_KEY = 'FITPULSE_WEEKLY_ROUTINE';
export const STORAGE_CUSTOM_SPLIT_KEY = 'FITPULSE_CUSTOM_WEEKLY_SPLIT';

export const DEFAULT_WEEKLY_PLAN: IWeeklyRoutinePlan = {
  id: 'default-4-split',
  name: '스트렝스 & 점진적 과부하 4분할 루틴',
  days: {
    mon: {
      dayOfWeek: 'mon',
      dayNumber: 1,
      koreanName: '월',
      fullKoreanName: '월요일',
      title: '가슴 & 삼두 (Chest & Triceps)',
      subtitle: '대흉근 상/중부 및 삼두 점진적 과부하',
      isRestDay: false,
      targetMuscles: ['가슴', '삼두'],
      exercises: [
        { id: 're-1', exerciseId: 'bench-press', exerciseName: '바벨 벤치프레스', targetSets: 4, targetReps: 8, targetWeight: 75, category: 'chest' },
        { id: 're-2', exerciseId: 'incline-db-press', exerciseName: '인클라인 덤벨 프레스', targetSets: 3, targetReps: 10, targetWeight: 26, category: 'chest' },
        { id: 're-3', exerciseId: 'cable-fly', exerciseName: '케이블 크로스오버 플라이', targetSets: 3, targetReps: 12, targetWeight: 17.5, category: 'chest' },
      ]
    },
    tue: {
      dayOfWeek: 'tue',
      dayNumber: 2,
      koreanName: '화',
      fullKoreanName: '화요일',
      title: '등 & 이두 (Back & Biceps)',
      subtitle: '광배근 두께감 및 견인 스트렝스',
      isRestDay: false,
      targetMuscles: ['등', '이두'],
      exercises: [
        { id: 're-4', exerciseId: 'deadlift', exerciseName: '컨벤셔널 데드리프트', targetSets: 4, targetReps: 5, targetWeight: 130, category: 'back' },
        { id: 're-5', exerciseId: 'barbell-row', exerciseName: '바벨 로우', targetSets: 4, targetReps: 8, targetWeight: 65, category: 'back' },
        { id: 're-6', exerciseId: 'lat-pulldown', exerciseName: '랫 풀다운', targetSets: 3, targetReps: 10, targetWeight: 55, category: 'back' },
      ]
    },
    wed: {
      dayOfWeek: 'wed',
      dayNumber: 3,
      koreanName: '수',
      fullKoreanName: '수요일',
      title: '하체 & 코어 (Legs & Core)',
      subtitle: '대퇴사두, 둔근 및 전신 파워 하체 데이',
      isRestDay: false,
      targetMuscles: ['하체', '둔근', '코어'],
      exercises: [
        { id: 're-7', exerciseId: 'squat', exerciseName: '바벨 백스쿼트', targetSets: 4, targetReps: 6, targetWeight: 110, category: 'legs' },
        { id: 're-8', exerciseId: 'leg-press', exerciseName: '레그 프레스', targetSets: 3, targetReps: 10, targetWeight: 180, category: 'legs' },
      ]
    },
    thu: {
      dayOfWeek: 'thu',
      dayNumber: 4,
      koreanName: '목',
      fullKoreanName: '목요일',
      title: '휴식 및 액티브 리커버리 (Rest)',
      subtitle: '근신경계 회복, 가벼운 스트레칭 및 수분 보충',
      isRestDay: true,
      targetMuscles: ['전신 회복'],
      exercises: []
    },
    fri: {
      dayOfWeek: 'fri',
      dayNumber: 5,
      koreanName: '금',
      fullKoreanName: '금요일',
      title: '어깨 & 삼각근 (Shoulders)',
      subtitle: '전면/측면/후면 삼각근 3D 입체 볼륨',
      isRestDay: false,
      targetMuscles: ['어깨', '승모근'],
      exercises: [
        { id: 're-9', exerciseId: 'ohp', exerciseName: '오버헤드 프레스 (OHP)', targetSets: 4, targetReps: 7, targetWeight: 47.5, category: 'shoulders' },
      ]
    },
    sat: {
      dayOfWeek: 'sat',
      dayNumber: 6,
      koreanName: '토',
      fullKoreanName: '토요일',
      title: '약점 보완 & 전신 복합 (Full Body)',
      subtitle: '벤치/스쿼트 보조 운동 및 유산소 인터벌',
      isRestDay: false,
      targetMuscles: ['전신', '약점보완'],
      exercises: [
        { id: 're-10', exerciseId: 'bench-press', exerciseName: '바벨 벤치프레스 (스피드)', targetSets: 3, targetReps: 8, targetWeight: 65, category: 'chest' },
      ]
    },
    sun: {
      dayOfWeek: 'sun',
      dayNumber: 0,
      koreanName: '일',
      fullKoreanName: '일요일',
      title: '완전 휴식 (Full Rest & Nutrition)',
      subtitle: '다음 주 점진적 과부하를 위한 수면 및 영양 집중',
      isRestDay: true,
      targetMuscles: ['휴식'],
      exercises: []
    }
  }
};

export class RoutineService {
  /**
   * 커스텀 주간 분할 루틴 목록 조회 (IWeeklySplitDay[])
   * LocalStorage에 저장된 사용자 정의 루틴이 있으면 반환하고, 없으면 기본 4분할 반환
   */
  static getWeeklySplit(): IWeeklySplitDay[] {
    return storageService.getItem<IWeeklySplitDay[]>(STORAGE_CUSTOM_SPLIT_KEY, DEFAULT_WEEKLY_SPLIT);
  }

  /**
   * 커스텀 주간 분할 루틴 저장
   */
  static saveWeeklySplit(splitList: IWeeklySplitDay[]): void {
    storageService.setItem(STORAGE_CUSTOM_SPLIT_KEY, splitList);
  }

  /**
   * 특정 프리셋으로 루틴 리셋 및 반환
   */
  static resetToPreset(presetId: RoutinePresetType): IWeeklySplitDay[] {
    const preset = ROUTINE_PRESETS.find(p => p.id === presetId);
    const splitDays = preset ? preset.splitDays : DEFAULT_WEEKLY_SPLIT;
    this.saveWeeklySplit(splitDays);
    return splitDays;
  }

  /**
   * 오늘 요일에 해당하는 루틴 분할 반환
   */
  static getTodaySplitDay(customSplit?: IWeeklySplitDay[]): IWeeklySplitDay {
    const splitList = customSplit || this.getWeeklySplit();
    const currentDayIndex = new Date().getDay(); // 0: Sun, 1: Mon, ...
    return splitList.find(d => d.dayIndex === currentDayIndex) || splitList[1] || DEFAULT_WEEKLY_SPLIT[1];
  }

  // 레거시 모델 호환
  static getWeeklyPlan(): IWeeklyRoutinePlan {
    return storageService.getItem<IWeeklyRoutinePlan>(STORAGE_ROUTINE_KEY, DEFAULT_WEEKLY_PLAN);
  }

  static saveWeeklyPlan(plan: IWeeklyRoutinePlan): void {
    storageService.setItem(STORAGE_ROUTINE_KEY, plan);
  }

  static getTodayDayOfWeek(): DayOfWeek {
    const dayIndex = new Date().getDay();
    const map: Record<number, DayOfWeek> = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat'
    };
    return map[dayIndex];
  }

  static getTodayRoutine(): IWeeklyRoutineDay {
    const plan = this.getWeeklyPlan();
    const todayKey = this.getTodayDayOfWeek();
    return plan.days[todayKey];
  }
}
