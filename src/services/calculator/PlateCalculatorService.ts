/**
 * SOLID - Single Responsibility Principle (SRP)
 * 바벨 플레이트(원판) 최적 조합 계산 및 올림픽 규격 색상 매핑 전담 서비스
 */

export interface IPlateItem {
  weight: number;     // 원판 무게 (kg)
  count: number;      // 한쪽(Per Side)에 꽂을 개수
  color: string;      // 원판 배경색
  textColor: string;  // 텍스트 색상
  heightRem: number;  // 시각화 높이 비율
}

export interface IPlateCalculationResult {
  targetWeight: number;        // 목표 중량 (kg)
  barbellWeight: number;       // 바벨 봉 무게 (kg)
  weightPerSide: number;       // 한쪽에 꽂아야 할 무게 (kg)
  totalLoadedWeight: number;   // 실제 조립된 총 중량 (kg)
  remainder: number;           // 자투리 미달 중량 (kg)
  platesPerSide: IPlateItem[]; // 한쪽당 필요한 원판 목록
}

export class PlateCalculatorService {
  /**
   * 국제 올림픽 역도/파워리프팅 규격 및 TDS Mobile 조화 컬러 팔레트
   */
  static readonly AVAILABLE_PLATES: { weight: number; color: string; textColor: string; heightRem: number }[] = [
    { weight: 25, color: '#F04452', textColor: '#FFFFFF', heightRem: 4.8 },   // Red
    { weight: 20, color: '#3182F6', textColor: '#FFFFFF', heightRem: 4.5 },   // Toss Blue
    { weight: 15, color: '#FFB300', textColor: '#191F28', heightRem: 4.0 },   // Yellow
    { weight: 10, color: '#04B014', textColor: '#FFFFFF', heightRem: 3.5 },   // Green
    { weight: 5, color: '#6B7684', textColor: '#FFFFFF', heightRem: 2.8 },    // White/Slate
    { weight: 2.5, color: '#333D4B', textColor: '#FFFFFF', heightRem: 2.3 },  // Black
    { weight: 1.25, color: '#8B95A1', textColor: '#FFFFFF', heightRem: 1.8 }, // Chrome/Silver
  ];

  /**
   * 바벨 무게 기본 옵션 (kg)
   */
  static readonly BARBELL_OPTIONS = [
    { label: '20kg (표준 올림픽 바)', weight: 20 },
    { label: '15kg (여성용 / 테크닉 바)', weight: 15 },
    { label: '10kg (이지바 / 경량 바)', weight: 10 },
  ];

  /**
   * 목표 중량을 달성하기 위해 양쪽에 꽂을 최소 개수의 원판 조합 산출 (Greedy 탐욕 알고리즘)
   */
  static calculate(targetWeight: number, barbellWeight = 20): IPlateCalculationResult {
    const validTarget = Math.max(0, targetWeight);
    const validBarbell = Math.max(0, barbellWeight);

    // 목표 중량이 바벨 무게보다 작으면 원판 불필요
    if (validTarget <= validBarbell) {
      return {
        targetWeight: validTarget,
        barbellWeight: validBarbell,
        weightPerSide: 0,
        totalLoadedWeight: validBarbell,
        remainder: 0,
        platesPerSide: [],
      };
    }

    const netWeight = validTarget - validBarbell;
    const targetPerSide = netWeight / 2;
    let remainingPerSide = targetPerSide;

    const platesPerSide: IPlateItem[] = [];

    for (const plateDef of this.AVAILABLE_PLATES) {
      if (remainingPerSide <= 0) break;

      const count = Math.floor(remainingPerSide / plateDef.weight);
      if (count > 0) {
        platesPerSide.push({
          weight: plateDef.weight,
          count,
          color: plateDef.color,
          textColor: plateDef.textColor,
          heightRem: plateDef.heightRem,
        });
        remainingPerSide = Math.round((remainingPerSide - count * plateDef.weight) * 1000) / 1000;
      }
    }

    const loadedPerSide = targetPerSide - remainingPerSide;
    const totalLoadedWeight = validBarbell + loadedPerSide * 2;
    const remainder = Math.round((validTarget - totalLoadedWeight) * 10) / 10;

    return {
      targetWeight: validTarget,
      barbellWeight: validBarbell,
      weightPerSide: targetPerSide,
      totalLoadedWeight,
      remainder,
      platesPerSide,
    };
  }

  /**
   * 사람이 읽기 편한 한줄 요약 문자열 (예: "양쪽당: 20kg 1장, 10kg 1장, 1.25kg 1장")
   */
  static formatPlatesSummary(plates: IPlateItem[]): string {
    if (!plates || plates.length === 0) return '원판 없음 (빈 봉)';
    return plates.map(p => `${p.weight}kg × ${p.count}`).join(' + ');
  }
}
