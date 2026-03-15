import {
  BLOCKED_WORDS,
  BLOCKED_CODE_PATTERNS,
} from "../constants/moderation";

export interface ModerationResult {
  isBlocked: boolean;
  cleanedText: string;
  blockedTerms: string[];
}

/**
 * Check user text input for inappropriate content.
 * Returns whether the input should be blocked and which terms triggered it.
 */
export function moderateInput(text: string): ModerationResult {
  const lower = text.toLowerCase();
  const blockedTerms: string[] = [];

  for (const word of BLOCKED_WORDS) {
    // Word boundary check to avoid false positives
    // e.g., "shell" shouldn't match "hell"
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
    if (regex.test(lower)) {
      blockedTerms.push(word);
    }
  }

  return {
    isBlocked: blockedTerms.length > 0,
    cleanedText: text,
    blockedTerms,
  };
}

/**
 * Scan generated code for dangerous patterns.
 * Strips matched patterns and returns cleaned code.
 */
export function moderateCode(code: string): ModerationResult {
  let cleaned = code;
  const blockedTerms: string[] = [];

  for (const pattern of BLOCKED_CODE_PATTERNS) {
    // Reset regex lastIndex for global patterns
    const regex = new RegExp(pattern.source, pattern.flags);
    const matches = cleaned.match(regex);
    if (matches) {
      blockedTerms.push(...matches);
      cleaned = cleaned.replace(regex, "/* removed */");
    }
  }

  return {
    isBlocked: blockedTerms.length > 0,
    cleanedText: cleaned,
    blockedTerms,
  };
}

/**
 * Moderate LLM reply text (not code) for inappropriate content.
 */
export function moderateReply(reply: string): ModerationResult {
  return moderateInput(reply);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
