/**
 * SOLID - Single Responsibility Principle (SRP)
 * 브라우저 백그라운드 전환 시 Web Notification(웹 푸시 알림) 및 Haptic 진동(Vibration API) 전담 서비스
 */
export class WebNotificationService {
  /**
   * 브라우저 알림 권한 상태 확인
   */
  static getPermission(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * 브라우저 푸시 알림 권한 요청
   */
  static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * 기기 진동(Haptic Feedback) 울리기
   * @param pattern 진동 패턴 (ms 단위 배열)
   */
  static triggerVibration(pattern: number[] = [200, 100, 200, 100, 400]): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        console.warn('Vibration API not supported or blocked:', err);
      }
    }
  }

  /**
   * 휴식 타이머 종료 시 웹 푸시 알림 및 진동 발송
   */
  static notifyRestComplete(options?: {
    exerciseName?: string;
    nextSetNumber?: number;
  }): void {
    // 1. 진동 발송
    this.triggerVibration([250, 120, 250, 120, 500]);

    // 2. 백그라운드 탭 또는 최소화 상태이거나 알림 권한이 허용된 경우 시스템 알림 발송
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      const title = 'FitPulse · 휴식 시간 완료! 🔔';
      const body = options?.exerciseName
        ? `${options.exerciseName} ${options.nextSetNumber ? `${options.nextSetNumber}세트` : '다음 세트'}를 시작할 시간이에요. 힘내세요!`
        : '설정한 휴식 시간이 끝났습니다. 다음 세트로 넘어가볼까요?';

      try {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'fitpulse-rest-timer',
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // 6초 후 자동 닫기
        setTimeout(() => notification.close(), 6000);
      } catch (err) {
        console.warn('Web Notification failed to display:', err);
      }
    }
  }
}
