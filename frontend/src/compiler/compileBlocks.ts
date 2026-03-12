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
 * Build a script that runs self-verification checks after ~30 frames.
 * Each check is a JS expression that should evaluate to true.
 * Failed checks post an error message to the parent for auto-fix.
 */
function buildCheckRunner(checks: string[]): string {
  if (checks.length === 0) return "";
  const escaped = checks.map((c) => escapeJsString(c));
  return `
// --- Self-verification checks ---
(function() {
  var _checkFrame = 0;
  game.onUpdate("__self_check__", function() {
    _checkFrame++;
    if (_checkFrame !== 30) return;
    game.off("__self_check__");
    var checks = [${escaped.map((c) => `"${c}"`).join(",")}];
    for (var i = 0; i < checks.length; i++) {
      try {
        if (!eval(checks[i])) {
          window.parent.postMessage({
            type: "iframe-error",
            message: "Self-check failed: " + checks[i]
          }, "*");
          return;
        }
      } catch(err) {
        window.parent.postMessage({
          type: "iframe-error",
          message: "Self-check error: " + checks[i] + " — " + String(err && err.message ? err.message : err)
        }, "*");
        return;
      }
    }
  });
})();`;
}

/**
 * Compile an array of Blocks into a self-contained HTML string
 * with the runtime engine and each block wrapped in an error-isolated IIFE.
 */
export function compileBlocks(blocks: Block[], checks?: string[]): string {
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

  const checkScript = buildCheckRunner(checks ?? []);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { overflow: hidden; background: transparent; }
${css}
</style>
</head>
<body>
<script>
${RUNTIME_ENGINE}
</script>
<script>
${blockScripts}
${checkScript}
</script>
</body>
</html>`;
}
