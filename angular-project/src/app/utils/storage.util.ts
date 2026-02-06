export class StorageUtil {
  static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  static getItem(key: string): string | null {
    if (!this.isBrowser()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  static setItem(key: string, value: string): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail in SSR
    }
  }

  static removeItem(key: string): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail in SSR
    }
  }
}
