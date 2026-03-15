/**
 * Content moderation constants for COPPA compliance.
 * Client-side filtering of LLM output and user input.
 */

// Words/phrases inappropriate for kids ages 8-14
// Lowercase for case-insensitive matching
export const BLOCKED_WORDS = [
  // Violence
  "kill",
  "murder",
  "blood",
  "gore",
  "weapon",
  "gun",
  "knife",
  "bomb",
  "terrorist",
  "suicide",
  "torture",
  "massacre",
  // Explicit content
  "sex",
  "porn",
  "nude",
  "naked",
  "xxx",
  "hentai",
  "fetish",
  // Drugs/alcohol
  "cocaine",
  "heroin",
  "meth",
  "marijuana",
  "weed",
  "drunk",
  "vodka",
  "whiskey",
  "cigarette",
  // Hate speech
  "racist",
  "racism",
  "nazi",
  "supremacist",
  // Profanity (common)
  "fuck",
  "shit",
  "damn",
  "hell",
  "ass",
  "bitch",
  "bastard",
  "crap",
  // Gambling
  "gambling",
  "casino",
  "betting",
  "slot machine",
] as const;

// Patterns in generated code that should be stripped
export const BLOCKED_CODE_PATTERNS = [
  // External resource loading
  /https?:\/\/(?!localhost)/gi,
  // Cookie/storage access beyond what's needed
  /document\.cookie/gi,
  // Dynamic script injection
  /document\.write\s*\(/gi,
  /\.innerHTML\s*=.*<script/gi,
  // eval and related
  /\beval\s*\(/gi,
  /new\s+Function\s*\(/gi,
  // Data exfiltration
  /fetch\s*\(/gi,
  /XMLHttpRequest/gi,
  /navigator\.sendBeacon/gi,
  // iframe manipulation
  /parent\.\w+/gi,
  /top\.\w+/gi,
  /window\.opener/gi,
  // Crypto mining
  /crypto\s*miner/gi,
  /coinhive/gi,
] as const;

// Allow-listed patterns that look like blocked patterns but are safe
export const ALLOWED_CODE_PATTERNS = [
  // Our own game engine API
  /game\.\w+/gi,
  // Canvas drawing
  /ctx\.\w+/gi,
  // requestAnimationFrame
  /requestAnimationFrame/gi,
  // setTimeout/setInterval for game loops
  /setTimeout/gi,
  /setInterval/gi,
] as const;

// Kid-friendly rejection messages
export const MODERATION_MESSAGES = {
  "en-US": {
    inputBlocked:
      "Hmm, let's think of something more fun to build! How about a game or an art project?",
    codeBlocked:
      "I made something that wasn't quite right. Let me try again with something awesome!",
  },
  "zh-TW": {
    inputBlocked: "嗯，讓我們想些更有趣的東西來做吧！做個遊戲或藝術作品怎麼樣？",
    codeBlocked: "我做了一些不太對的東西。讓我重新做一個很棒的！",
  },
  "zh-CN": {
    inputBlocked: "嗯，让我们想些更有趣的东西来做吧！做个游戏或艺术作品怎么样？",
    codeBlocked: "我做了一些不太对的东西。让我重新做一个很棒的！",
  },
} as const;
