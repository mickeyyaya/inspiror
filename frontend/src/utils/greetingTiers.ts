import type { Language } from "../i18n/translations";
import type { BuddyPersonality } from "../constants/buddyPersonalities";
import { getPersonality } from "../constants/buddyPersonalities";
import type { BuddyAvatar } from "../types/achievements";

export type GreetingTier =
  | "new_user"
  | "returning"
  | "active"
  | "streak_champion"
  | "veteran";

export function getGreetingTier(
  totalBuilds: number,
  streakDays: number,
): GreetingTier {
  if (totalBuilds === 0) return "new_user";
  if (streakDays >= 5 && totalBuilds >= 10) return "streak_champion";
  if (totalBuilds >= 20) return "veteran";
  if (totalBuilds >= 5) return "active";
  return "returning";
}

interface GreetingTemplates {
  new_user: string;
  returning: string;
  active: string;
  streak_champion: string;
  veteran: string;
}

const GREETING_TEMPLATES: Record<Language, GreetingTemplates> = {
  "en-US": {
    new_user:
      "Hi! I'm {buddyName}, your builder buddy. {catchphrase} What do you want to create today?",
    returning:
      "{greetingFlavor} You've built {builds} things so far! What shall we create next?",
    active:
      "{greetingFlavor} {builds} builds and counting! You're getting really good at this. What's the plan today?",
    streak_champion:
      "{greetingFlavor} {streak}-day streak! {streakCelebration} With {builds} builds under your belt, you're unstoppable! What's next?",
    veteran:
      "{greetingFlavor} The legend returns! {builds} builds, {streak}-day streak! {streakCelebration} What masterpiece are we making today?",
  },
  "zh-TW": {
    new_user:
      "嗨！我是{buddyName}，你的建築夥伴。{catchphrase}今天你想創造什麼呢？",
    returning:
      "{greetingFlavor}你已經做了 {builds} 個作品了！接下來想做什麼呢？",
    active:
      "{greetingFlavor}已經 {builds} 個作品了！你越來越厲害了。今天有什麼計畫？",
    streak_champion:
      "{greetingFlavor}連續 {streak} 天！{streakCelebration}已經做了 {builds} 個作品，你無可阻擋！接下來呢？",
    veteran:
      "{greetingFlavor}傳奇回歸！{builds} 個作品，連續 {streak} 天！{streakCelebration}今天要做什麼傑作？",
  },
  "zh-CN": {
    new_user:
      "嗨！我是{buddyName}，你的建筑伙伴。{catchphrase}今天你想创造什么呢？",
    returning:
      "{greetingFlavor}你已经做了 {builds} 个作品了！接下来想做什么呢？",
    active:
      "{greetingFlavor}已经 {builds} 个作品了！你越来越厉害了。今天有什么计划？",
    streak_champion:
      "{greetingFlavor}连续 {streak} 天！{streakCelebration}已经做了 {builds} 个作品，你无可阻挡！接下来呢？",
    veteran:
      "{greetingFlavor}传奇回归！{builds} 个作品，连续 {streak} 天！{streakCelebration}今天要做什么杰作？",
  },
};

export function getPersonalizedGreeting(
  totalBuilds: number,
  streakDays: number,
  avatar: BuddyAvatar,
  language: Language,
): string {
  const tier = getGreetingTier(totalBuilds, streakDays);
  const personality: BuddyPersonality = getPersonality(avatar.id);
  const template = GREETING_TEMPLATES[language][tier];

  return template
    .replace("{buddyName}", avatar.name)
    .replace("{builds}", String(totalBuilds))
    .replace("{streak}", String(streakDays))
    .replace("{catchphrase}", personality.catchphrase[language])
    .replace("{greetingFlavor}", personality.greetingFlavor[language])
    .replace("{streakCelebration}", personality.streakCelebration[language]);
}
