/** Asks the browser not to evict the app's data under storage pressure. Best effort. */
export async function requestPersistentStorage(): Promise<void> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    // Unsupported or refused: the app still works, the data is just evictable.
  }
}
