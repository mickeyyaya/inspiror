/**
 * Sanitizes a project title into a safe filename.
 * Strips non-alphanumeric chars (except spaces/hyphens), replaces spaces with hyphens,
 * truncates to 50 chars, and appends .html.
 */
export function sanitizeFilename(title: string): string {
  const cleaned = title
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(0, 50);
  return (cleaned || "my-project") + ".html";
}

/**
 * Triggers a browser download of the given HTML string as a .html file.
 */
export function downloadHtml(html: string, title: string): void {
  const filename = sanitizeFilename(title);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
