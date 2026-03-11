import type { Block } from "../types/block";
import { substituteParams } from "./substituteParams";
import { RUNTIME_ENGINE } from "../runtime/engine";

/** Escape a string for safe use inside a JS string literal */
function escapeJsString(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
}

/** Strip sequences that could break out of a <style> tag */
function sanitizeCss(css: string): string {
  return css.replace(/<\/style>/gi, "/* stripped */");
}

/** Strip sequences that could break out of a JS comment */
function sanitizeComment(str: string): string {
  return str.replace(/\*\//g, "* /").replace(/\n/g, " ");
}

/**
 * Compile an array of Blocks into a self-contained HTML string
 * with the runtime engine and each block wrapped in an error-isolated IIFE.
 */
export function compileBlocks(blocks: Block[]): string {
  const enabled = blocks
    .filter((b) => b.enabled)
    .sort((a, b) => a.order - b.order);

  // Collect CSS from all enabled blocks, sanitized to prevent style-tag breakout
  const css = enabled
    .map((b) => (b.css ? sanitizeCss(b.css) : ""))
    .filter(Boolean)
    .join("\n");

  // Build block IIFEs with param substitution
  const blockScripts = enabled
    .map((block) => {
      const code = substituteParams(block.code, block.params);
      const safeId = escapeJsString(block.id);
      const safeLabel = sanitizeComment(block.label);
      return `
// --- Block: ${safeLabel} (${safeId}) ---
(function() {
  try {
    ${code}
  } catch(err) {
    console.error("[Block ${safeId}] Init error:", err);
    try {
      window.parent.postMessage({
        type: "iframe-error",
        message: "Block ${safeId} init error: " + String(err && err.message ? err.message : err),
        blockId: "${safeId}"
      }, "*");
    } catch(e) {}
  }
})();`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { overflow: hidden; background: #000; }
${css}
</style>
</head>
<body>
<script>
${RUNTIME_ENGINE}
</script>
<script>
${blockScripts}
</script>
</body>
</html>`;
}
