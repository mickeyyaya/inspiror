import type { Block } from "../types/block";
import type { VoiceLanguage } from "../hooks/useVoice";

interface FollowUp {
  emoji: string;
  label: string;
}

// Map block categories to contextual follow-up suggestions
const FOLLOW_UPS_EN: Record<string, FollowUp[]> = {
  setup: [
    { emoji: "🎨", label: "Change the background color" },
    { emoji: "🌌", label: "Add a gradient background" },
  ],
  character: [
    { emoji: "🏃", label: "Make the character move faster" },
    { emoji: "🎭", label: "Add another character" },
    { emoji: "📏", label: "Make the character bigger" },
  ],
  movement: [
    { emoji: "🔄", label: "Add bouncing off walls" },
    { emoji: "⬆️", label: "Change the movement direction" },
    { emoji: "🌀", label: "Add spinning animation" },
  ],
  collision: [
    { emoji: "💥", label: "Add an explosion effect on collision" },
    { emoji: "🔊", label: "Play a sound on collision" },
    { emoji: "⭐", label: "Add points when things collide" },
  ],
  event: [
    { emoji: "👆", label: "Add a double-tap action" },
    { emoji: "🖱️", label: "Add a drag interaction" },
    { emoji: "🔔", label: "Add a sound when tapped" },
  ],
  score: [
    { emoji: "🏆", label: "Add a high score display" },
    { emoji: "⏱️", label: "Add a countdown timer" },
    { emoji: "🎯", label: "Set a winning score" },
  ],
  timer: [
    { emoji: "⏰", label: "Change the timer speed" },
    { emoji: "🔄", label: "Make something happen when time runs out" },
  ],
  visual: [
    { emoji: "✨", label: "Add sparkle particles" },
    { emoji: "🌈", label: "Add a color-changing effect" },
    { emoji: "💫", label: "Add a glow effect" },
  ],
  sound: [
    { emoji: "🎵", label: "Change the sound to a different note" },
    { emoji: "🥁", label: "Add a rhythm pattern" },
    { emoji: "🔇", label: "Add a mute button" },
  ],
  custom: [
    { emoji: "🎮", label: "Add interactivity to this block" },
    { emoji: "🔧", label: "Tweak the parameters" },
  ],
};

const FOLLOW_UPS_ZH_TW: Record<string, FollowUp[]> = {
  setup: [
    { emoji: "🎨", label: "換一個背景顏色" },
    { emoji: "🌌", label: "加漸層背景" },
  ],
  character: [
    { emoji: "🏃", label: "讓角色移動更快" },
    { emoji: "🎭", label: "再加一個角色" },
    { emoji: "📏", label: "把角色變大" },
  ],
  movement: [
    { emoji: "🔄", label: "加上碰到牆壁反彈" },
    { emoji: "⬆️", label: "改變移動方向" },
    { emoji: "🌀", label: "加旋轉動畫" },
  ],
  collision: [
    { emoji: "💥", label: "碰撞時加爆炸效果" },
    { emoji: "🔊", label: "碰撞時播放聲音" },
    { emoji: "⭐", label: "碰撞時加分" },
  ],
  event: [
    { emoji: "👆", label: "加連點動作" },
    { emoji: "🖱️", label: "加拖曳互動" },
    { emoji: "🔔", label: "點擊時播放聲音" },
  ],
  score: [
    { emoji: "🏆", label: "加最高分顯示" },
    { emoji: "⏱️", label: "加倒數計時" },
    { emoji: "🎯", label: "設定獲勝分數" },
  ],
  timer: [
    { emoji: "⏰", label: "改變計時器速度" },
    { emoji: "🔄", label: "時間到時發生什麼" },
  ],
  visual: [
    { emoji: "✨", label: "加閃光粒子" },
    { emoji: "🌈", label: "加變色效果" },
    { emoji: "💫", label: "加發光效果" },
  ],
  sound: [
    { emoji: "🎵", label: "換一個不同的音符" },
    { emoji: "🥁", label: "加節奏模式" },
    { emoji: "🔇", label: "加靜音按鈕" },
  ],
  custom: [
    { emoji: "🎮", label: "加互動功能" },
    { emoji: "🔧", label: "調整參數" },
  ],
};

const FOLLOW_UPS_ZH_CN: Record<string, FollowUp[]> = {
  setup: [
    { emoji: "🎨", label: "换一个背景颜色" },
    { emoji: "🌌", label: "加渐变背景" },
  ],
  character: [
    { emoji: "🏃", label: "让角色移动更快" },
    { emoji: "🎭", label: "再加一个角色" },
    { emoji: "📏", label: "把角色变大" },
  ],
  movement: [
    { emoji: "🔄", label: "加上碰到墙壁反弹" },
    { emoji: "⬆️", label: "改变移动方向" },
    { emoji: "🌀", label: "加旋转动画" },
  ],
  collision: [
    { emoji: "💥", label: "碰撞时加爆炸效果" },
    { emoji: "🔊", label: "碰撞时播放声音" },
    { emoji: "⭐", label: "碰撞时加分" },
  ],
  event: [
    { emoji: "👆", label: "加连点动作" },
    { emoji: "🖱️", label: "加拖拽互动" },
    { emoji: "🔔", label: "点击时播放声音" },
  ],
  score: [
    { emoji: "🏆", label: "加最高分显示" },
    { emoji: "⏱️", label: "加倒数计时" },
    { emoji: "🎯", label: "设定获胜分数" },
  ],
  timer: [
    { emoji: "⏰", label: "改变计时器速度" },
    { emoji: "🔄", label: "时间到时发生什么" },
  ],
  visual: [
    { emoji: "✨", label: "加闪光粒子" },
    { emoji: "🌈", label: "加变色效果" },
    { emoji: "💫", label: "加发光效果" },
  ],
  sound: [
    { emoji: "🎵", label: "换一个不同的音符" },
    { emoji: "🥁", label: "加节奏模式" },
    { emoji: "🔇", label: "加静音按钮" },
  ],
  custom: [
    { emoji: "🎮", label: "加互动功能" },
    { emoji: "🔧", label: "调整参数" },
  ],
};

function getFollowUps(language: VoiceLanguage): Record<string, FollowUp[]> {
  if (language === "zh-TW") return FOLLOW_UPS_ZH_TW;
  if (language === "zh-CN") return FOLLOW_UPS_ZH_CN;
  return FOLLOW_UPS_EN;
}

/**
 * Generate 2-3 contextual follow-up suggestions based on the block types
 * present in the current project. Picks from categories that are already
 * in use so suggestions feel relevant to what the child just built.
 */
export function generateFollowUps(
  blocks: Block[],
  language: VoiceLanguage,
): FollowUp[] {
  if (blocks.length === 0) return [];

  const followUps = getFollowUps(language);
  const categories = [...new Set(blocks.map((b) => b.type))];

  // Collect all possible suggestions from active categories
  const candidates: FollowUp[] = [];
  for (const cat of categories) {
    const catSuggestions = followUps[cat];
    if (catSuggestions) {
      candidates.push(...catSuggestions);
    }
  }

  if (candidates.length === 0) return [];

  // Shuffle and pick 2-3
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const count = Math.min(3, shuffled.length);
  return shuffled.slice(0, count);
}
