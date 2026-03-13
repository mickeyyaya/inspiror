/**
 * Safely writes to localStorage, catching QuotaExceededError.
 * Returns true on success, false on failure.
 */
export function safeSave(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.error(
      `[safeSave] Failed to write to localStorage key="${key}":`,
      err,
    );
    return false;
  }
}
