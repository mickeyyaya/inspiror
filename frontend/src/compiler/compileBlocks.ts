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

/** Strip sequences that could break out of a <script> tag */
function sanitizeScript(code: string): string {
  return code.replace(/<\/script/gi, "<\\/script");
}

/** Valid JS comparison operators for allowlisted check expressions */
const CMP = "(?:===|!==|==|!=|>=|<=|>|<)";

/** Allowlist of safe check expression patterns (no arbitrary eval) */
const SAFE_CHECK_PATTERNS = [
  // game.getEntity('id') !== null
  new RegExp(`^game\\.getEntity\\("[^"]+?"\\)\\s*!==?\\s*(null|undefined)$`),
  new RegExp(`^game\\.getEntity\\('[^']+?'\\)\\s*!==?\\s*(null|undefined)$`),
  // game.get('key') === 42
  new RegExp(`^game\\.get\\("[^"]+?"\\)\\s*${CMP}\\s*[\\d.]+$`),
  new RegExp(`^game\\.get\\('[^']+?'\\)\\s*${CMP}\\s*[\\d.]+$`),
  // game.get('key') !== null/undefined
  new RegExp(`^game\\.get\\("[^"]+?"\\)\\s*!==?\\s*(null|undefined)$`),
  new RegExp(`^game\\.get\\('[^']+?'\\)\\s*!==?\\s*(null|undefined)$`),
  // game.allEntities().length >= 3
  new RegExp(`^game\\.allEntities\\(\\)\\.length\\s*${CMP}\\s*\\d+$`),
  // typeof game.getEntity('id') === "object"
  new RegExp(
    `^typeof\\s+game\\.getEntity\\("[^"]+?"\\)\\s*${CMP}\\s*"(object|undefined)"$`,
  ),
  new RegExp(
    `^typeof\\s+game\\.getEntity\\('[^']+?'\\)\\s*${CMP}\\s*"(object|undefined)"$`,
  ),
  // typeof game.get('key') === "number"/"string"
  new RegExp(
    `^typeof\\s+game\\.get\\("[^"]+?"\\)\\s*${CMP}\\s*"(number|string|boolean|undefined)"$`,
  ),
  new RegExp(
    `^typeof\\s+game\\.get\\('[^']+?'\\)\\s*${CMP}\\s*"(number|string|boolean|undefined)"$`,
  ),
  // game.getEntity('id').width > 0 (property access with numeric comparison)
  new RegExp(
    `^game\\.getEntity\\("[^"]+?"\\)\\.(width|height|x|y|opacity|value)\\s*${CMP}\\s*[\\d.]+$`,
  ),
  new RegExp(
    `^game\\.getEntity\\('[^']+?'\\)\\.(width|height|x|y|opacity|value)\\s*${CMP}\\s*[\\d.]+$`,
  ),
  // game.width()/game.height() comparisons
  new RegExp(`^game\\.(width|height)\\(\\)\\s*${CMP}\\s*\\d+$`),
];

function isSafeCheckExpression(expr: string): boolean {
  const trimmed = expr.trim();
  return SAFE_CHECK_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Build a script that runs self-verification checks after ~30 frames.
 * Each check is a JS expression from a safe allowlist — no arbitrary eval.
 * Failed checks post an error message to the parent for auto-fix.
 */
function buildCheckRunner(checks: string[]): string {
  const safeChecks = checks.filter(isSafeCheckExpression);
  if (safeChecks.length === 0) return "";
  // Sanitize check expressions to prevent </script> breakout in entity names
  const sanitized = safeChecks.map((c) => sanitizeScript(c));
  const escaped = sanitized.map((c) => escapeJsString(c));
  return `
// --- Self-verification checks ---
(function() {
  var _checkFrame = 0;
  game.onUpdate("__self_check__", function() {
    _checkFrame++;
    if (_checkFrame !== 30) return;
    game.off("__self_check__");
    var checks = [${escaped.map((c) => `"${c}"`).join(",")}];
    var fns = [${sanitized.map((c) => `function(){ return (${c}); }`).join(",")}];
    for (var i = 0; i < fns.length; i++) {
      try {
        if (!fns[i]()) {
          window.parent.postMessage({
            type: "iframe-error",
            message: "Self-check failed: " + checks[i]
          }, window.location.origin);
          return;
        }
      } catch(err) {
        window.parent.postMessage({
          type: "iframe-error",
          message: "Self-check error: " + checks[i] + " — " + String(err && err.message ? err.message : err)
        }, window.location.origin);
        return;
      }
    }
  });
})();`;
}

// Re-export for testing
export { isSafeCheckExpression };

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
      const code = sanitizeScript(substituteParams(block.code, block.params));
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
      }, window.location.origin);
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
