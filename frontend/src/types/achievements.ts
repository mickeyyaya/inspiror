export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  type: "builds" | "debugs" | "remixes" | "explores";
}

export interface AchievementState {
  unlockedIds: string[];
  stats: {
    builds: number;
    debugs: number;
    remixes: number;
    explores: number;
  };
}

export interface BuddyAvatar {
  id: string;
  emoji: string;
  name: string;
  requiredBuilds: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-build",
    title: "First Build!",
    description: "Build your very first app",
    icon: "🎉",
    threshold: 1,
    type: "builds",
  },
  {
    id: "five-builds",
    title: "Getting Started",
    description: "Build 5 apps",
    icon: "⭐",
    threshold: 5,
    type: "builds",
  },
  {
    id: "ten-builds",
    title: "Pro Builder",
    description: "Build 10 apps",
    icon: "🏆",
    threshold: 10,
    type: "builds",
  },
  {
    id: "twenty-builds",
    title: "Master Creator",
    description: "Build 20 apps",
    icon: "👑",
    threshold: 20,
    type: "builds",
  },
  {
    id: "first-debug",
    title: "Bug Squasher",
    description: "Fix your first bug with auto-fix",
    icon: "🐛",
    threshold: 1,
    type: "debugs",
  },
  {
    id: "five-debugs",
    title: "Debugging Hero",
    description: "Fix 5 bugs",
    icon: "🦸",
    threshold: 5,
    type: "debugs",
  },
  {
    id: "first-remix",
    title: "Code Explorer",
    description: "Edit code in Look Inside for the first time",
    icon: "🔍",
    threshold: 1,
    type: "remixes",
  },
  {
    id: "first-explore",
    title: "Curious Mind",
    description: "Try 3 different suggestion chips",
    icon: "🧠",
    threshold: 3,
    type: "explores",
  },
];

export const BUDDY_AVATARS: BuddyAvatar[] = [
  { id: "dog", emoji: "🐶", name: "Buddy", requiredBuilds: 0 },
  { id: "cat", emoji: "🐱", name: "Whiskers", requiredBuilds: 3 },
  { id: "dragon", emoji: "🐉", name: "Sparky", requiredBuilds: 5 },
  { id: "robot", emoji: "🤖", name: "Bolt", requiredBuilds: 10 },
  { id: "unicorn", emoji: "🦄", name: "Star", requiredBuilds: 20 },
];

export const DEFAULT_ACHIEVEMENT_STATE: AchievementState = {
  unlockedIds: [],
  stats: {
    builds: 0,
    debugs: 0,
    remixes: 0,
    explores: 0,
  },
};
