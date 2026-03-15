import { z } from "zod";
import type { VoiceLanguage } from "./hooks/useVoice";

export const ALL_SUGGESTIONS_EN = [
  { emoji: "\u{1F3C0}", label: "Make a bouncing ball game" },
  { emoji: "\u{1F3A8}", label: "Create a neon paint app" },
  { emoji: "\u23F0", label: "Build a clock — tap to change style" },
  { emoji: "\u{1F680}", label: "Design a space adventure" },
  { emoji: "\u{1F40D}", label: "Build a snake game" },
  { emoji: "\u{1F3B9}", label: "Make a piano keyboard" },
  { emoji: "\u{1F308}", label: "Create a rainbow drawing tool" },
  { emoji: "\u{1F47E}", label: "Build a space invaders game" },
  { emoji: "\u{1F3B2}", label: "Make a dice roller app" },
  { emoji: "\u{1F9EE}", label: "Build a fun calculator" },
  { emoji: "\u{1F996}", label: "Make a dinosaur runner game" },
  { emoji: "\u{1F3AF}", label: "Create a target shooting game" },
  { emoji: "\u{1F30D}", label: "Build an interactive globe" },
  { emoji: "\u{1F431}", label: "Make a virtual pet simulator" },
  { emoji: "\u{1F3D3}", label: "Build a pong game" },
  { emoji: "\u{1F4A1}", label: "Create a quiz trivia app" },
  { emoji: "\u{1F3B5}", label: "Make a music beat maker" },
  { emoji: "\u{1F9E9}", label: "Build a jigsaw puzzle" },
  { emoji: "\u{1F3F0}", label: "Design a castle defense game" },
  { emoji: "\u{1F30A}", label: "Make ocean waves — tap to splash!" },
  { emoji: "\u{1F52E}", label: "Build a magic 8 ball" },
  { emoji: "\u{1F3AA}", label: "Create a whack-a-mole game" },
  { emoji: "\u{1F4DD}", label: "Make a to-do list — tap to check off!" },
  { emoji: "\u{1F338}", label: "Build a flower garden grower" },
  { emoji: "\u{1F697}", label: "Make a racing car game" },
  { emoji: "\u26A1", label: "Create a reaction speed tester" },
  { emoji: "\u{1F383}", label: "Build a spooky haunted house" },
  { emoji: "\u{1F9F2}", label: "Make a magnet physics toy" },
  { emoji: "\u{1F438}", label: "Build a frogger road crossing game" },
  { emoji: "\u{1F5FA}\uFE0F", label: "Create a treasure map adventure" },
  { emoji: "\u{1F9B8}", label: "Design a superhero creator" },
  { emoji: "\u{1F355}", label: "Make a pizza ordering app" },
  { emoji: "\u{1F3B0}", label: "Build a slot machine game" },
  { emoji: "\u{1F52C}", label: "Create a molecule builder" },
  {
    emoji: "\u2601\uFE0F",
    label: "Make a weather app — tap to change weather",
  },
  { emoji: "\u{1F3D7}\uFE0F", label: "Build a tower stacker game" },
  { emoji: "\u{1F3B8}", label: "Create a guitar string simulator" },
  { emoji: "\u{1F9EA}", label: "Make a color mixing lab" },
  { emoji: "\u{1F41D}", label: "Build a bee pollination game" },
  { emoji: "\u{1F30B}", label: "Create a volcano — tap to erupt!" },
];

/** @deprecated Use ALL_SUGGESTIONS_EN instead */
export const ALL_SUGGESTIONS = ALL_SUGGESTIONS_EN;

export const ALL_SUGGESTIONS_ZH_TW = [
  { emoji: "\u{1F3C0}", label: "做一個彈跳球遊戲" },
  { emoji: "\u{1F3A8}", label: "創建霓虹塗鴉應用" },
  { emoji: "\u23F0", label: "建造時鐘 — 點擊換風格" },
  { emoji: "\u{1F680}", label: "設計太空冒險" },
  { emoji: "\u{1F40D}", label: "做一個貪吃蛇遊戲" },
  { emoji: "\u{1F3B9}", label: "製作鋼琴鍵盤" },
  { emoji: "\u{1F308}", label: "創建彩虹繪圖工具" },
  { emoji: "\u{1F47E}", label: "做太空入侵者遊戲" },
  { emoji: "\u{1F3B2}", label: "製作骰子滾動應用" },
  { emoji: "\u{1F9EE}", label: "建造一個有趣計算機" },
  { emoji: "\u{1F996}", label: "做恐龍跑酷遊戲" },
  { emoji: "\u{1F3AF}", label: "創建射擊目標遊戲" },
  { emoji: "\u{1F30D}", label: "建造互動地球儀" },
  { emoji: "\u{1F431}", label: "製作虛擬寵物模擬器" },
  { emoji: "\u{1F3D3}", label: "做一個乒乓球遊戲" },
  { emoji: "\u{1F4A1}", label: "創建問答搶答應用" },
  { emoji: "\u{1F3B5}", label: "製作音樂節拍器" },
  { emoji: "\u{1F9E9}", label: "建造拼圖遊戲" },
  { emoji: "\u{1F3F0}", label: "設計城堡防衛遊戲" },
  { emoji: "\u{1F30A}", label: "做海浪 — 點擊濺水花！" },
  { emoji: "\u{1F52E}", label: "建造神奇魔法球" },
  { emoji: "\u{1F3AA}", label: "創建打地鼠遊戲" },
  { emoji: "\u{1F4DD}", label: "做待辦事項 — 點擊打勾！" },
  { emoji: "\u{1F338}", label: "建造花園種植遊戲" },
  { emoji: "\u{1F697}", label: "做賽車遊戲" },
  { emoji: "\u26A1", label: "創建反應速度測試" },
  { emoji: "\u{1F383}", label: "建造鬼屋遊戲" },
  { emoji: "\u{1F9F2}", label: "製作磁鐵物理玩具" },
  { emoji: "\u{1F438}", label: "做青蛙過馬路遊戲" },
  { emoji: "\u{1F5FA}\uFE0F", label: "創建尋寶藏圖冒險" },
  { emoji: "\u{1F9B8}", label: "設計超級英雄創造器" },
  { emoji: "\u{1F355}", label: "製作披薩訂購應用" },
  { emoji: "\u{1F3B0}", label: "做老虎機遊戲" },
  { emoji: "\u{1F52C}", label: "創建分子建構器" },
  { emoji: "\u2601\uFE0F", label: "做天氣應用 — 點擊換天氣" },
  { emoji: "\u{1F3D7}\uFE0F", label: "做疊塔積木遊戲" },
  { emoji: "\u{1F3B8}", label: "創建吉他弦模擬器" },
  { emoji: "\u{1F9EA}", label: "製作顏色混合實驗室" },
  { emoji: "\u{1F41D}", label: "做蜜蜂採花遊戲" },
  { emoji: "\u{1F30B}", label: "做火山 — 點擊噴發！" },
];

export const ALL_SUGGESTIONS_ZH_CN = [
  { emoji: "\u{1F3C0}", label: "做一个弹跳球游戏" },
  { emoji: "\u{1F3A8}", label: "创建霓虹涂鸦应用" },
  { emoji: "\u23F0", label: "建造时钟 — 点击换风格" },
  { emoji: "\u{1F680}", label: "设计太空冒险" },
  { emoji: "\u{1F40D}", label: "做一个贪吃蛇游戏" },
  { emoji: "\u{1F3B9}", label: "制作钢琴键盘" },
  { emoji: "\u{1F308}", label: "创建彩虹绘图工具" },
  { emoji: "\u{1F47E}", label: "做太空入侵者游戏" },
  { emoji: "\u{1F3B2}", label: "制作骰子滚动应用" },
  { emoji: "\u{1F9EE}", label: "建造一个有趣计算器" },
  { emoji: "\u{1F996}", label: "做恐龙跑酷游戏" },
  { emoji: "\u{1F3AF}", label: "创建射击目标游戏" },
  { emoji: "\u{1F30D}", label: "建造互动地球仪" },
  { emoji: "\u{1F431}", label: "制作虚拟宠物模拟器" },
  { emoji: "\u{1F3D3}", label: "做一个乒乓球游戏" },
  { emoji: "\u{1F4A1}", label: "创建问答抢答应用" },
  { emoji: "\u{1F3B5}", label: "制作音乐节拍器" },
  { emoji: "\u{1F9E9}", label: "建造拼图游戏" },
  { emoji: "\u{1F3F0}", label: "设计城堡防卫游戏" },
  { emoji: "\u{1F30A}", label: "做海浪 — 点击溅水花！" },
  { emoji: "\u{1F52E}", label: "建造神奇魔法球" },
  { emoji: "\u{1F3AA}", label: "创建打地鼠游戏" },
  { emoji: "\u{1F4DD}", label: "做待办事项 — 点击打勾！" },
  { emoji: "\u{1F338}", label: "建造花园种植游戏" },
  { emoji: "\u{1F697}", label: "做赛车游戏" },
  { emoji: "\u26A1", label: "创建反应速度测试" },
  { emoji: "\u{1F383}", label: "建造鬼屋游戏" },
  { emoji: "\u{1F9F2}", label: "制作磁铁物理玩具" },
  { emoji: "\u{1F438}", label: "做青蛙过马路游戏" },
  { emoji: "\u{1F5FA}\uFE0F", label: "创建寻宝藏图冒险" },
  { emoji: "\u{1F9B8}", label: "设计超级英雄创造器" },
  { emoji: "\u{1F355}", label: "制作披萨订购应用" },
  { emoji: "\u{1F3B0}", label: "做老虎机游戏" },
  { emoji: "\u{1F52C}", label: "创建分子构建器" },
  { emoji: "\u2601\uFE0F", label: "做天气应用 — 点击换天气" },
  { emoji: "\u{1F3D7}\uFE0F", label: "做叠塔积木游戏" },
  { emoji: "\u{1F3B8}", label: "创建吉他弦模拟器" },
  { emoji: "\u{1F9EA}", label: "制作颜色混合实验室" },
  { emoji: "\u{1F41D}", label: "做蜜蜂采花游戏" },
  { emoji: "\u{1F30B}", label: "做火山 — 点击喷发！" },
];

export const CHIPS_PER_SET = 4;
export const SCAFFOLD_CHIPS_PER_SET = 2;
export const CONFETTI_COUNT = 80;

const SCAFFOLD_TEMPLATES_EN = [
  { emoji: "🎮", label: "Make a game where ___ tries to catch ___" },
  { emoji: "🌟", label: "Create a ___ that glows when you click it" },
  { emoji: "🏃", label: "Build a ___ that moves ___ across the screen" },
  { emoji: "🎵", label: "Make a ___ that plays a sound when ___" },
  { emoji: "🎨", label: "Create a ___ that changes color to ___" },
  { emoji: "💥", label: "Build a game where ___ bounces off ___" },
];

const SCAFFOLD_TEMPLATES_ZH_TW = [
  { emoji: "🎮", label: "做一個___試著去抓___的遊戲" },
  { emoji: "🌟", label: "創造一個點擊會發光的___" },
  { emoji: "🏃", label: "做一個___在畫面上___移動" },
  { emoji: "🎵", label: "做一個___當___時會發出聲音" },
  { emoji: "🎨", label: "創造一個___會變成___顏色" },
  { emoji: "💥", label: "做一個___會彈開___的遊戲" },
];

const SCAFFOLD_TEMPLATES_ZH_CN = [
  { emoji: "🎮", label: "做一个___试着去抓___的游戏" },
  { emoji: "🌟", label: "创造一个点击会发光的___" },
  { emoji: "🏃", label: "做一个___在画面上___移动" },
  { emoji: "🎵", label: "做一个___当___时会发出声音" },
  { emoji: "🎨", label: "创造一个___会变成___颜色" },
  { emoji: "💥", label: "做一个___会弹开___的游戏" },
];

const blockParamSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["number", "color", "string", "boolean", "enum"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  options: z.array(z.string()).optional(),
});

const blockSchema = z.object({
  id: z.string(),
  type: z.enum([
    "setup",
    "character",
    "movement",
    "collision",
    "event",
    "score",
    "timer",
    "visual",
    "sound",
    "custom",
  ]),
  label: z.string(),
  emoji: z.string(),
  enabled: z.boolean(),
  params: z.array(blockParamSchema),
  code: z.string(),
  css: z.string().optional(),
  order: z.number(),
});

export const generationSchema = z.object({
  reply: z.string(),
  blocks: z.array(blockSchema),
  checks: z.array(z.string()).optional(),
  tip: z.string().optional(),
  isComplete: z.boolean().optional(),
  nextPhasePlan: z.string().optional(),
});

export function getSuggestions(language: VoiceLanguage) {
  if (language === "zh-TW") return ALL_SUGGESTIONS_ZH_TW;
  if (language === "zh-CN") return ALL_SUGGESTIONS_ZH_CN;
  return ALL_SUGGESTIONS_EN;
}

export function pickRandomChips(language?: VoiceLanguage) {
  const pool = language ? getSuggestions(language) : ALL_SUGGESTIONS_EN;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, CHIPS_PER_SET);
}

function getScaffoldTemplates(language: VoiceLanguage) {
  if (language === "zh-TW") return SCAFFOLD_TEMPLATES_ZH_TW;
  if (language === "zh-CN") return SCAFFOLD_TEMPLATES_ZH_CN;
  return SCAFFOLD_TEMPLATES_EN;
}

export function pickRandomScaffolds(language?: VoiceLanguage) {
  const pool = language
    ? getScaffoldTemplates(language)
    : SCAFFOLD_TEMPLATES_EN;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, SCAFFOLD_CHIPS_PER_SET);
}

export function withId(
  role: "user" | "assistant" | "system",
  content: string,
  type?: "tip",
): {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: "tip";
} {
  const msg: { id: string; role: typeof role; content: string; type?: "tip" } =
    { id: crypto.randomUUID(), role, content };
  if (type) msg.type = type;
  return msg;
}
