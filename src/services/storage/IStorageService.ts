/**
 * SOLID - Dependency Inversion Principle (DIP)
 * 스토리지 인터페이스 추상화
 */
export interface IStorageService {
  getItem<T>(key: string, defaultValue: T): T;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}
