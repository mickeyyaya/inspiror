import { sanitizeFilename } from "./downloadHtml";

/**
 * Returns true if the browser supports the Web Share API.
 */
export function canWebShare(): boolean {
  return typeof navigator.share === "function";
}

/**
 * Shares the project HTML via the Web Share API.
 * If the browser supports file sharing, attaches the HTML as a file.
 * Otherwise falls back to a text-only share with the project title.
 * Silently catches AbortError (user cancelled the share sheet).
 */
export async function shareProject(
  html: string,
  title: string,
): Promise<void> {
  const filename = sanitizeFilename(title);

  // Try file-based sharing first
  const file = new File([html], filename, { type: "text/html" });
  const canShareFiles =
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  try {
    if (canShareFiles) {
      await navigator.share({
        files: [file],
        title,
        text: `Check out "${title}" — made with Inspiror!`,
      });
    } else {
      await navigator.share({
        title,
        text: `Check out "${title}" — made with Inspiror!`,
      });
    }
  } catch (err) {
    // User cancelled — not an error
    if (err instanceof DOMException && err.name === "AbortError") {
      return;
    }
    throw err;
  }
}

/**
 * Copies the HTML string to the clipboard.
 * Returns true on success, false on failure.
 */
export async function copyHtmlToClipboard(html: string): Promise<boolean> {
  try {
    if (!navigator.clipboard) return false;
    await navigator.clipboard.writeText(html);
    return true;
  } catch {
    return false;
  }
}
