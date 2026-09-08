/**
 * SOLID - Single Responsibility & Open/Closed Principle (SRP & OCP)
 * 인바디 분석 및 추천 중량 산출 서비스
 */
import { IInBodyData, IRecommendedWeight } from '../../models/fitness';

export interface IExerciseConfig {
  exerciseId: string;
  exerciseName: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
  baseRatio: number;
  part: 'chest' | 'legs' | 'back' | 'shoulders';
  desc: string;
}

export class InBodyService {
  // OCP: 확장 가능한 기본 종목 레지스트리
  private static registeredExercises: IExerciseConfig[] = [
    {
      exerciseId: 'bench-press',
      exerciseName: '바벨 벤치프레스',
      category: 'chest',
      baseRatio: 1.0,
      part: 'chest',
      desc: '가슴/삼두 복합 프레스'
    },
    {
      exerciseId: 'squat',
      exerciseName: '바벨 백스쿼트',
      category: 'legs',
      baseRatio: 1.4,
      part: 'legs',
      desc: '하체 근력 및 전신 안정성'
    },
    {
      exerciseId: 'deadlift',
      exerciseName: '컨벤셔널 데드리프트',
      category: 'back',
      baseRatio: 1.6,
      part: 'back',
      desc: '후면 사슬 및 기립근 강화'
    },
    {
      exerciseId: 'ohp',
      exerciseName: '오버헤드 프레스 (OHP)',
      category: 'shoulders',
      baseRatio: 0.65,
      part: 'shoulders',
      desc: '어깨와 수직 밀기 스트렝스'
    },
    {
      exerciseId: 'barbell-row',
      exerciseName: '바벨 로우',
      category: 'back',
      baseRatio: 0.85,
      part: 'back',
      desc: '등 두께감 및 광배근 견인력'
    }
  ];

  static registerExercise(config: IExerciseConfig) {
    this.registeredExercises.push(config);
  }

  static calculateFFM(weight: number, bodyFatPercent: number): number {
    const ffm = weight * (1 - bodyFatPercent / 100);
    return Math.round(ffm * 10) / 10;
  }

  static calculateMuscleRatio(weight: number, muscleMass: number): number {
    if (weight <= 0) return 0;
    return Math.round((muscleMass / weight) * 100);
  }

  static calculateRecommendations(inbody: IInBodyData): IRecommendedWeight[] {
    const { gender, weight, muscleMass, experienceLevel } = inbody;
    const standardRatio = gender === 'male' ? 0.44 : 0.34;
    const currentRatio = weight > 0 ? muscleMass / weight : standardRatio;
    const muscleBonus = Math.max(-0.2, Math.min(0.3, (currentRatio - standardRatio) * 1.5));

    const expMultiplier = {
      beginner: 0.85,
      intermediate: 1.0,
      advanced: 1.25,
    }[experienceLevel];

    const genderMultiplier = {
      chest: gender === 'male' ? 1.0 : 0.6,
      legs: gender === 'male' ? 1.0 : 0.78,
      back: gender === 'male' ? 1.0 : 0.7,
      shoulders: gender === 'male' ? 1.0 : 0.55,
    };

    const roundToPlate = (val: number) => Math.max(20, Math.round(val / 2.5) * 2.5);

    return this.registeredExercises.map(cfg => {
      const raw1RM = weight * cfg.baseRatio * expMultiplier * genderMultiplier[cfg.part] * (1 + muscleBonus);
      const estimated1RM = roundToPlate(raw1RM);
      const warmupWeight = roundToPlate(estimated1RM * 0.5);
      const hypertrophyWeight = roundToPlate(estimated1RM * 0.72);
      const strengthWeight = roundToPlate(estimated1RM * 0.82);

      return {
        exerciseId: cfg.exerciseId,
        exerciseName: cfg.exerciseName,
        category: cfg.category,
        estimated1RM,
        warmupSet: { weight: warmupWeight, reps: 12 },
        hypertrophySet: { weight: hypertrophyWeight, reps: 8 },
        strengthSet: { weight: strengthWeight, reps: 5 },
        rationale: `골격근량 ${muscleMass}kg(${Math.round(currentRatio * 100)}%) 기준 추천 (${cfg.desc})`,
      };
    });
  }
}
