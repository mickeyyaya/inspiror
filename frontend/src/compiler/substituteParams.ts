import type { BlockParam } from "../types/block";

/**
 * Replace {{key}} placeholders in code with JSON-escaped param values.
 * Prevents injection via user-edited params by properly escaping strings.
 */
export function substituteParams(
  code: string,
  params: BlockParam[],
): string {
  let result = code;
  for (const param of params) {
    const placeholder = `{{${param.key}}}`;
    if (!result.includes(placeholder)) continue;

    let replacement: string;
    if (typeof param.value === "string") {
      // JSON.stringify adds quotes and escapes special chars
      replacement = JSON.stringify(param.value);
    } else if (typeof param.value === "boolean") {
      replacement = param.value ? "true" : "false";
    } else {
      // number — ensure it's a finite number
      const num = Number(param.value);
      replacement = Number.isFinite(num) ? String(num) : "0";
    }

    result = result.split(placeholder).join(replacement);
  }
  return result;
}
