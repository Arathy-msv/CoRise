/**
 * Copies text with the async Clipboard API, falling back to selecting `field` and using the
 * legacy copy command (older browsers, or pages not served over HTTPS). Returns false when both fail.
 */
export async function copyText(value: string, field?: HTMLInputElement | HTMLTextAreaElement | null): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the selection fallback.
  }
  try {
    if (!field) return false;
    field.focus();
    field.select();
    return document.execCommand("copy");
  } catch {
    return false;
  }
}
