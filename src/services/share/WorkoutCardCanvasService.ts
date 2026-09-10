/**
 * SOLID - Single Responsibility Principle (SRP)
 * 인스타그램 스토리 규격(1080x1920, 9:16) 고해상도 '오운완' 인증 카드 Canvas 렌더링 및 다운로드 전담 서비스
 */
import { WorkoutSession } from '../../models/fitness';
import { VolumeService } from '../calculator/VolumeService';

export class WorkoutCardCanvasService {
  /**
   * 캔버스에 라운드 사각형(Rounded Rect) 그리기 유틸리티
   */
  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * 고해상도(1080 × 1920) 인스타그램 스토리 규격 오운완 인증 카드 생성
   */
  static async generateWorkoutStoryDataUrl(session: WorkoutSession): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D Context를 초기화할 수 없습니다.');

    // 1. 프리미엄 딥 다크 배경 및 앰비언트 글로우 (#101012 ~ #162032)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, '#0D1117');
    bgGrad.addColorStop(0.3, '#101012');
    bgGrad.addColorStop(0.7, '#141824');
    bgGrad.addColorStop(1, '#0A0D14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. 상단 & 하단 부드러운 Toss Blue 글로우 원
    const glowTop = ctx.createRadialGradient(200, 200, 10, 200, 200, 600);
    glowTop.addColorStop(0, 'rgba(49, 130, 246, 0.22)');
    glowTop.addColorStop(1, 'rgba(49, 130, 246, 0)');
    ctx.fillStyle = glowTop;
    ctx.fillRect(0, 0, 1080, 800);

    const glowBottom = ctx.createRadialGradient(880, 1600, 10, 880, 1600, 700);
    glowBottom.addColorStop(0, 'rgba(0, 191, 165, 0.18)');
    glowBottom.addColorStop(1, 'rgba(0, 191, 165, 0)');
    ctx.fillStyle = glowBottom;
    ctx.fillRect(0, 1000, 1080, 920);

    // 3. 탑 헤더 바 (FitPulse 엠블럼 + 오운완 뱃지)
    ctx.fillStyle = '#3182F6';
    this.roundRect(ctx, 90, 120, 64, 64, 20);
    ctx.fill();

    // 펄스 아이콘 심볼
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', 122, 166);

    // 앱 타이틀
    ctx.font = '900 44px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('FitPulse', 175, 168);

    // 오운완 인증 뱃지
    ctx.fillStyle = 'rgba(49, 130, 246, 0.2)';
    this.roundRect(ctx, 760, 126, 230, 52, 26);
    ctx.fill();
    ctx.strokeStyle = 'rgba(49, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#5B9DF8';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 오운완 인증', 875, 161);

    // 4. 메인 세션 타이틀 & 날짜
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8B95A1';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    const dateFormatted = session.date || new Date().toISOString().split('T')[0];
    ctx.fillText(`${dateFormatted} · ${session.durationMinutes || 60}분 운동 완료`, 90, 270);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 56px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    const sessionTitle = session.title || '오늘의 웨이트 트레이닝 세션';
    ctx.fillText(sessionTitle.length > 18 ? sessionTitle.slice(0, 17) + '...' : sessionTitle, 90, 350);

    // 5. 총 볼륨 하이라이트 메가 카드 (Top Hero Box)
    ctx.fillStyle = '#1C1C1E';
    this.roundRect(ctx, 90, 420, 900, 320, 36);
    ctx.fill();
    ctx.strokeStyle = 'rgba(49, 130, 246, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#8B95A1';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText('오늘 완주한 총 볼륨 (Total Volume)', 140, 490);

    ctx.fillStyle = '#3182F6';
    ctx.font = '900 96px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(VolumeService.formatKg(session.totalVolume || 0), 140, 610);

    ctx.fillStyle = '#00BFA5';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText('✨ 점진적 과부하를 멋지게 달성했어요!', 140, 675);

    // 6. 서브 메트릭 3개 카드 (3 Columns)
    const completedSetsCount = session.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
      0
    );
    const exerciseCount = session.exercises.length;
    const allSets = session.exercises.flatMap(e => e.sets);
    const avgRpe = VolumeService.getAverageRPE(allSets);

    const subCards = [
      { label: '완주 종목', value: `${exerciseCount}개 종목`, color: '#FFFFFF' },
      { label: '완료 세트', value: `${completedSetsCount} 세트`, color: '#FFFFFF' },
      { label: '평균 강도', value: avgRpe ? `RPE ${avgRpe}` : '완주 성공', color: '#FFB300' },
    ];

    const cardWidth = 280;
    const cardGap = 30;
    const cardY = 780;

    subCards.forEach((c, idx) => {
      const cx = 90 + idx * (cardWidth + cardGap);
      ctx.fillStyle = '#1C1C1E';
      this.roundRect(ctx, cx, cardY, cardWidth, 200, 28);
      ctx.fill();
      ctx.strokeStyle = '#2C2C2E';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#8B95A1';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, cx + cardWidth / 2, cardY + 65);

      ctx.fillStyle = c.color;
      ctx.font = '900 42px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(c.value, cx + cardWidth / 2, cardY + 140);
    });

    // 7. 완주 종목 리스트 섹션 (Detailed Exercise Pills)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText('완주한 운동 목록', 90, 1060);

    const startExY = 1110;
    const exRowHeight = 110;
    const maxExToShow = Math.min(session.exercises.length, 4);

    for (let i = 0; i < maxExToShow; i++) {
      const ex = session.exercises[i];
      const ey = startExY + i * exRowHeight;
      const setsCount = ex.sets.filter(s => s.completed).length;
      const exVol = VolumeService.calculateExerciseVolume(ex);

      ctx.fillStyle = '#16171A';
      this.roundRect(ctx, 90, ey, 900, 92, 22);
      ctx.fill();
      ctx.strokeStyle = '#2C2C2E';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 인덱스
      ctx.fillStyle = '#3182F6';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(`0${i + 1}`, 125, ey + 58);

      // 종목명
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(ex.exerciseName.length > 15 ? ex.exerciseName.slice(0, 14) + '...' : ex.exerciseName, 185, ey + 58);

      // 세트 & 볼륨
      ctx.fillStyle = '#8B95A1';
      ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${setsCount}세트 · ${VolumeService.formatKg(exVol)}`, 950, ey + 58);
      ctx.textAlign = 'left';
    }

    if (session.exercises.length > 4) {
      ctx.fillStyle = '#6B7684';
      ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`외 ${session.exercises.length - 4}개 종목 추가 완주 (+More)`, 540, startExY + 4 * exRowHeight + 35);
    }

    // 8. 하단 토스 감성 브랜딩 푸터
    const footerY = 1680;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(90, footerY);
    ctx.lineTo(990, footerY);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText('당연한 것을 더 쉽고 명확하게 · FitPulse', 540, footerY + 80);

    ctx.fillStyle = '#8B95A1';
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText('Instagram @fitpulse · fitpulse.app', 540, footerY + 130);

    return canvas.toDataURL('image/png');
  }

  /**
   * 브라우저에서 원클릭으로 PNG 이미지 다운로드
   */
  static async downloadWorkoutStoryImage(session: WorkoutSession, filename?: string): Promise<void> {
    const dataUrl = await this.generateWorkoutStoryDataUrl(session);
    const dateStr = session.date || new Date().toISOString().split('T')[0];
    const actualFilename = filename || `FitPulse_오운완_${dateStr}.png`;

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = actualFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
