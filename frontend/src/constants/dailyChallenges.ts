import type { Language } from "../i18n/translations";

export interface DailyChallenge {
  id: string;
  emoji: string;
  prompt: Record<Language, string>;
  title: Record<Language, string>;
  difficulty: "easy" | "medium" | "hard";
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "bouncing-rainbow",
    emoji: "🌈",
    prompt: {
      "en-US": "Make a rainbow of bouncing balls that change color when they hit the walls!",
      "zh-TW": "做一個彩虹彈跳球，碰到牆壁時會變色！",
      "zh-CN": "做一个彩虹弹跳球，碰到墙壁时会变色！",
    },
    title: {
      "en-US": "Rainbow Bounce",
      "zh-TW": "彩虹彈跳",
      "zh-CN": "彩虹弹跳",
    },
    difficulty: "easy",
  },
  {
    id: "pet-simulator",
    emoji: "🐾",
    prompt: {
      "en-US": "Create a virtual pet that gets happy when you tap it and sad if you ignore it!",
      "zh-TW": "創造一個虛擬寵物，點擊它會開心，忽略它會難過！",
      "zh-CN": "创造一个虚拟宠物，点击它会开心，忽略它会难过！",
    },
    title: {
      "en-US": "Virtual Pet",
      "zh-TW": "虛擬寵物",
      "zh-CN": "虚拟宠物",
    },
    difficulty: "medium",
  },
  {
    id: "fireworks-show",
    emoji: "🎆",
    prompt: {
      "en-US": "Make a fireworks show! Tap anywhere to launch colorful fireworks that explode into sparkles!",
      "zh-TW": "做一個煙火秀！點擊任何地方發射彩色煙火！",
      "zh-CN": "做一个烟火秀！点击任何地方发射彩色烟火！",
    },
    title: {
      "en-US": "Fireworks Show",
      "zh-TW": "煙火秀",
      "zh-CN": "烟火秀",
    },
    difficulty: "easy",
  },
  {
    id: "maze-runner",
    emoji: "🏃",
    prompt: {
      "en-US": "Build a simple maze game where you drag a character through walls to reach a goal!",
      "zh-TW": "做一個簡單的迷宮遊戲，拖動角色穿過牆壁到達終點！",
      "zh-CN": "做一个简单的迷宫游戏，拖动角色穿过墙壁到达终点！",
    },
    title: {
      "en-US": "Maze Runner",
      "zh-TW": "迷宮跑者",
      "zh-CN": "迷宫跑者",
    },
    difficulty: "hard",
  },
  {
    id: "emoji-catch",
    emoji: "🎯",
    prompt: {
      "en-US": "Make a game where emojis fall from the sky and you tap them to score points! Add a timer!",
      "zh-TW": "做一個表情符號從天空掉落的遊戲，點擊它們得分！加上計時器！",
      "zh-CN": "做一个表情符号从天空掉落的游戏，点击它们得分！加上计时器！",
    },
    title: {
      "en-US": "Emoji Catcher",
      "zh-TW": "表情捕手",
      "zh-CN": "表情捕手",
    },
    difficulty: "medium",
  },
  {
    id: "music-visualizer",
    emoji: "🎵",
    prompt: {
      "en-US": "Create a music visualizer with colorful bars that bounce and pulse to a beat!",
      "zh-TW": "做一個音樂視覺化器，有彩色的長條隨節拍跳動！",
      "zh-CN": "做一个音乐可视化器，有彩色的长条随节拍跳动！",
    },
    title: {
      "en-US": "Beat Visualizer",
      "zh-TW": "節拍視覺化",
      "zh-CN": "节拍可视化",
    },
    difficulty: "medium",
  },
  {
    id: "space-dodge",
    emoji: "🚀",
    prompt: {
      "en-US": "Make a space game where a rocket dodges asteroids! Drag the rocket left and right!",
      "zh-TW": "做一個太空遊戲，火箭閃避隕石！拖動火箭左右移動！",
      "zh-CN": "做一个太空游戏，火箭闪避陨石！拖动火箭左右移动！",
    },
    title: {
      "en-US": "Space Dodge",
      "zh-TW": "太空閃避",
      "zh-CN": "太空闪避",
    },
    difficulty: "hard",
  },
  {
    id: "drawing-app",
    emoji: "🎨",
    prompt: {
      "en-US": "Create a drawing app with different colors and brush sizes! Add an eraser too!",
      "zh-TW": "做一個繪圖應用，有不同顏色和筆刷大小！加上橡皮擦！",
      "zh-CN": "做一个绘图应用，有不同颜色和画笔大小！加上橡皮擦！",
    },
    title: {
      "en-US": "Creative Canvas",
      "zh-TW": "創意畫布",
      "zh-CN": "创意画布",
    },
    difficulty: "medium",
  },
  {
    id: "whack-a-mole",
    emoji: "🔨",
    prompt: {
      "en-US": "Build a whack-a-mole game! Moles pop up randomly and you tap them before they hide!",
      "zh-TW": "做一個打地鼠遊戲！地鼠隨機出現，在它們躲起來前點擊它們！",
      "zh-CN": "做一个打地鼠游戏！地鼠随机出现，在它们躲起来前点击它们！",
    },
    title: {
      "en-US": "Whack-a-Mole",
      "zh-TW": "打地鼠",
      "zh-CN": "打地鼠",
    },
    difficulty: "hard",
  },
  {
    id: "snow-globe",
    emoji: "❄️",
    prompt: {
      "en-US": "Make a snow globe with falling snowflakes and a cute scene inside! Tap to shake it!",
      "zh-TW": "做一個雪花球，有飄落的雪花和可愛的場景！點擊搖動它！",
      "zh-CN": "做一个雪花球，有飘落的雪花和可爱的场景！点击摇动它！",
    },
    title: {
      "en-US": "Snow Globe",
      "zh-TW": "雪花球",
      "zh-CN": "雪花球",
    },
    difficulty: "easy",
  },
  {
    id: "countdown-timer",
    emoji: "⏱️",
    prompt: {
      "en-US": "Make a countdown timer with a big display! When it reaches zero, show confetti!",
      "zh-TW": "做一個倒數計時器！當到達零時，顯示彩紙！",
      "zh-CN": "做一个倒数计时器！当到达零时，显示彩纸！",
    },
    title: {
      "en-US": "Countdown",
      "zh-TW": "倒數計時",
      "zh-CN": "倒数计时",
    },
    difficulty: "easy",
  },
  {
    id: "bubble-pop",
    emoji: "🫧",
    prompt: {
      "en-US": "Create a bubble popping game with floating bubbles of different sizes! Pop them for points!",
      "zh-TW": "做一個泡泡破裂遊戲，有不同大小的漂浮泡泡！戳破它們得分！",
      "zh-CN": "做一个泡泡破裂游戏，有不同大小的漂浮泡泡！戳破它们得分！",
    },
    title: {
      "en-US": "Bubble Pop",
      "zh-TW": "泡泡破裂",
      "zh-CN": "泡泡破裂",
    },
    difficulty: "medium",
  },
  {
    id: "memory-match",
    emoji: "🃏",
    prompt: {
      "en-US": "Build a memory card matching game with emoji pairs! Flip cards to find matches!",
      "zh-TW": "做一個記憶配對遊戲，用表情符號配對！翻牌找出配對！",
      "zh-CN": "做一个记忆配对游戏，用表情符号配对！翻牌找出配对！",
    },
    title: {
      "en-US": "Memory Match",
      "zh-TW": "記憶配對",
      "zh-CN": "记忆配对",
    },
    difficulty: "hard",
  },
  {
    id: "lava-floor",
    emoji: "🌋",
    prompt: {
      "en-US": "Make a 'the floor is lava' game! Jump between platforms before they disappear!",
      "zh-TW": "做一個「地板是岩漿」遊戲！在平台消失前跳過去！",
      "zh-CN": "做一个「地板是岩浆」游戏！在平台消失前跳过去！",
    },
    title: {
      "en-US": "Lava Floor",
      "zh-TW": "岩漿地板",
      "zh-CN": "岩浆地板",
    },
    difficulty: "hard",
  },
];

/**
 * Gets today's daily challenge based on date.
 * Rotates through the list using day-of-year modulo.
 */
export function getTodayChallenge(): DailyChallenge {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

/**
 * Check if the user has already completed today's challenge.
 */
export function isChallengeCompleted(challengeId: string): boolean {
  try {
    const stored = localStorage.getItem("inspiror-daily-challenge");
    if (!stored) return false;
    const data = JSON.parse(stored);
    const today = new Date().toISOString().slice(0, 10);
    return data.date === today && data.challengeId === challengeId;
  } catch {
    return false;
  }
}

/**
 * Mark today's challenge as completed.
 */
export function markChallengeCompleted(challengeId: string): void {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(
    "inspiror-daily-challenge",
    JSON.stringify({ date: today, challengeId }),
  );
}
