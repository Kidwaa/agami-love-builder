export const STORAGE_PREFIX = "agami-cms-demo";

const withPrefix = (key: string) => `${STORAGE_PREFIX}:${key}`;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(withPrefix(key));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error("Failed to read storage", error);
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(withPrefix(key), JSON.stringify(value));
  } catch (error) {
    console.error("Failed to write storage", error);
  }
}

export function ensureStorage<T>(key: string, factory: () => T): T {
  const current = readStorage<T | null>(key, null);
  if (current) return current;
  const value = factory();
  writeStorage(key, value);
  return value;
}

export function clearStorage(key: string) {
  try {
    localStorage.removeItem(withPrefix(key));
  } catch (error) {
    console.error("Failed to clear storage", error);
  }
}
