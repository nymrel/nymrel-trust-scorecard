export async function copyText(value: string): Promise<boolean> {
  if (!globalThis.navigator?.clipboard?.writeText) return false;
  try {
    await globalThis.navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
