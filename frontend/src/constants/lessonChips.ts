import type { LessonTopic } from "../hooks/useClassroomMode";
import type { VoiceLanguage } from "../hooks/useVoice";

interface Chip {
  emoji: string;
  label: string;
}

type LessonChipMap = Record<LessonTopic, Chip[]>;

const LESSON_CHIPS_EN: LessonChipMap = {
  physics: [
    { emoji: "🏀", label: "Make a bouncing ball with gravity" },
    { emoji: "🚀", label: "Build a rocket that flies up with thrust" },
    { emoji: "🎱", label: "Create a pool table with collisions" },
    { emoji: "🌍", label: "Make a planet orbiting a star" },
    { emoji: "⚡", label: "Build a pendulum that swings" },
    { emoji: "🎯", label: "Make a catapult that launches projectiles" },
    { emoji: "🪂", label: "Create a parachute with air resistance" },
    { emoji: "🏓", label: "Build a ping pong game with physics" },
  ],
  art: [
    { emoji: "🎨", label: "Make a drawing canvas — tap to paint" },
    { emoji: "🌈", label: "Create a rainbow color mixer" },
    { emoji: "✨", label: "Build a sparkle trail that follows your finger" },
    { emoji: "🖼️", label: "Make a kaleidoscope pattern" },
    { emoji: "🎭", label: "Create an emoji face builder" },
    { emoji: "🌸", label: "Make flowers bloom where you tap" },
    { emoji: "🎆", label: "Build a fireworks display" },
    { emoji: "🖌️", label: "Create a pixel art grid" },
  ],
  music: [
    { emoji: "🎹", label: "Make a piano with tappable keys" },
    { emoji: "🥁", label: "Build a drum machine — tap to play beats" },
    { emoji: "🎵", label: "Create a music box with different tones" },
    { emoji: "🎸", label: "Make guitar strings that vibrate when tapped" },
    { emoji: "🔔", label: "Build a xylophone with colored bars" },
    { emoji: "🎤", label: "Create a sound board with funny sounds" },
    { emoji: "🎺", label: "Make a trumpet simulator" },
    { emoji: "🎼", label: "Build a music sequencer with a grid" },
  ],
  animals: [
    { emoji: "🐱", label: "Make a virtual pet that you can feed" },
    { emoji: "🐟", label: "Build an aquarium with swimming fish" },
    { emoji: "🦋", label: "Create butterflies that fly to flowers" },
    { emoji: "🐸", label: "Make a frog that jumps on lily pads" },
    { emoji: "🐝", label: "Build a bee that collects honey" },
    { emoji: "🐢", label: "Create a turtle race game" },
    { emoji: "🦜", label: "Make a parrot that repeats after you" },
    { emoji: "🐙", label: "Build an octopus with wiggling tentacles" },
  ],
  space: [
    { emoji: "🚀", label: "Build a spaceship that dodges asteroids" },
    { emoji: "🌙", label: "Create a moon landing simulation" },
    { emoji: "⭐", label: "Make a constellation drawer" },
    { emoji: "🛸", label: "Build a UFO catcher game" },
    { emoji: "🌌", label: "Create a galaxy with spinning stars" },
    { emoji: "☄️", label: "Make a meteor shower — tap to catch them" },
    { emoji: "🪐", label: "Build a solar system explorer" },
    { emoji: "👾", label: "Create a space invaders game" },
  ],
};

const LESSON_CHIPS_ZH_TW: LessonChipMap = {
  physics: [
    { emoji: "🏀", label: "做一個有重力的彈跳球" },
    { emoji: "🚀", label: "做火箭 — 點擊發射升空" },
    { emoji: "🎱", label: "做撞球遊戲 — 球會碰撞" },
    { emoji: "🌍", label: "做行星繞恆星軌道" },
    { emoji: "⚡", label: "做一個擺動的鐘擺" },
    { emoji: "🎯", label: "做投石機發射遊戲" },
    { emoji: "🪂", label: "做降落傘 — 有空氣阻力" },
    { emoji: "🏓", label: "做乒乓球遊戲" },
  ],
  art: [
    { emoji: "🎨", label: "做畫布 — 點擊塗色" },
    { emoji: "🌈", label: "做彩虹調色盤" },
    { emoji: "✨", label: "做會跟著手指的閃光" },
    { emoji: "🖼️", label: "做萬花筒圖案" },
    { emoji: "🎭", label: "做表情組合器" },
    { emoji: "🌸", label: "點擊開花" },
    { emoji: "🎆", label: "做煙火表演" },
    { emoji: "🖌️", label: "做像素畫格子" },
  ],
  music: [
    { emoji: "🎹", label: "做鋼琴 — 點擊琴鍵" },
    { emoji: "🥁", label: "做鼓機 — 敲打節奏" },
    { emoji: "🎵", label: "做音樂盒" },
    { emoji: "🎸", label: "做吉他 — 撥動琴弦" },
    { emoji: "🔔", label: "做木琴 — 點彩色琴片" },
    { emoji: "🎤", label: "做有趣音效板" },
    { emoji: "🎺", label: "做小號模擬器" },
    { emoji: "🎼", label: "做音樂編曲器" },
  ],
  animals: [
    { emoji: "🐱", label: "做虛擬寵物 — 可以餵食" },
    { emoji: "🐟", label: "做水族箱 — 魚兒游泳" },
    { emoji: "🦋", label: "做蝴蝶飛向花朵" },
    { emoji: "🐸", label: "做青蛙跳荷葉" },
    { emoji: "🐝", label: "做蜜蜂採蜜遊戲" },
    { emoji: "🐢", label: "做烏龜賽跑" },
    { emoji: "🦜", label: "做鸚鵡學話" },
    { emoji: "🐙", label: "做章魚擺動觸手" },
  ],
  space: [
    { emoji: "🚀", label: "做太空船閃避隕石" },
    { emoji: "🌙", label: "做月球登陸遊戲" },
    { emoji: "⭐", label: "做星座繪製器" },
    { emoji: "🛸", label: "做飛碟夾娃娃機" },
    { emoji: "🌌", label: "做星系 — 星星旋轉" },
    { emoji: "☄️", label: "做流星雨 — 接住它們" },
    { emoji: "🪐", label: "做太陽系探索器" },
    { emoji: "👾", label: "做太空侵略者遊戲" },
  ],
};

const LESSON_CHIPS_ZH_CN: LessonChipMap = {
  physics: [
    { emoji: "🏀", label: "做一个有重力的弹跳球" },
    { emoji: "🚀", label: "做火箭 — 点击发射升空" },
    { emoji: "🎱", label: "做撞球游戏 — 球会碰撞" },
    { emoji: "🌍", label: "做行星绕恒星轨道" },
    { emoji: "⚡", label: "做一个摆动的钟摆" },
    { emoji: "🎯", label: "做投石机发射游戏" },
    { emoji: "🪂", label: "做降落伞 — 有空气阻力" },
    { emoji: "🏓", label: "做乒乓球游戏" },
  ],
  art: [
    { emoji: "🎨", label: "做画布 — 点击涂色" },
    { emoji: "🌈", label: "做彩虹调色板" },
    { emoji: "✨", label: "做会跟着手指的闪光" },
    { emoji: "🖼️", label: "做万花筒图案" },
    { emoji: "🎭", label: "做表情组合器" },
    { emoji: "🌸", label: "点击开花" },
    { emoji: "🎆", label: "做烟火表演" },
    { emoji: "🖌️", label: "做像素画格子" },
  ],
  music: [
    { emoji: "🎹", label: "做钢琴 — 点击琴键" },
    { emoji: "🥁", label: "做鼓机 — 敲打节奏" },
    { emoji: "🎵", label: "做音乐盒" },
    { emoji: "🎸", label: "做吉他 — 拨动琴弦" },
    { emoji: "🔔", label: "做木琴 — 点彩色琴片" },
    { emoji: "🎤", label: "做有趣音效板" },
    { emoji: "🎺", label: "做小号模拟器" },
    { emoji: "🎼", label: "做音乐编曲器" },
  ],
  animals: [
    { emoji: "🐱", label: "做虚拟宠物 — 可以喂食" },
    { emoji: "🐟", label: "做水族箱 — 鱼儿游泳" },
    { emoji: "🦋", label: "做蝴蝶飞向花朵" },
    { emoji: "🐸", label: "做青蛙跳荷叶" },
    { emoji: "🐝", label: "做蜜蜂采蜜游戏" },
    { emoji: "🐢", label: "做乌龟赛跑" },
    { emoji: "🦜", label: "做鹦鹉学话" },
    { emoji: "🐙", label: "做章鱼摆动触手" },
  ],
  space: [
    { emoji: "🚀", label: "做太空船闪避陨石" },
    { emoji: "🌙", label: "做月球登陆游戏" },
    { emoji: "⭐", label: "做星座绘制器" },
    { emoji: "🛸", label: "做飞碟夹娃娃机" },
    { emoji: "🌌", label: "做星系 — 星星旋转" },
    { emoji: "☄️", label: "做流星雨 — 接住它们" },
    { emoji: "🪐", label: "做太阳系探索器" },
    { emoji: "👾", label: "做太空侵略者游戏" },
  ],
};

export function getLessonChips(
  topic: LessonTopic,
  language: VoiceLanguage,
): Chip[] {
  if (language === "zh-TW") return LESSON_CHIPS_ZH_TW[topic];
  if (language === "zh-CN") return LESSON_CHIPS_ZH_CN[topic];
  return LESSON_CHIPS_EN[topic];
}

const TOPIC_EMOJI: Record<LessonTopic, string> = {
  physics: "🔬",
  art: "🎨",
  music: "🎵",
  animals: "🐾",
  space: "🚀",
};

const TOPIC_LABEL_EN: Record<LessonTopic, string> = {
  physics: "Physics Class",
  art: "Art Class",
  music: "Music Class",
  animals: "Animals Class",
  space: "Space Class",
};

const TOPIC_LABEL_ZH_TW: Record<LessonTopic, string> = {
  physics: "物理課",
  art: "美術課",
  music: "音樂課",
  animals: "動物課",
  space: "太空課",
};

const TOPIC_LABEL_ZH_CN: Record<LessonTopic, string> = {
  physics: "物理课",
  art: "美术课",
  music: "音乐课",
  animals: "动物课",
  space: "太空课",
};

export function getTopicEmoji(topic: LessonTopic): string {
  return TOPIC_EMOJI[topic];
}

export function getTopicLabel(
  topic: LessonTopic,
  language: VoiceLanguage,
): string {
  if (language === "zh-TW") return TOPIC_LABEL_ZH_TW[topic];
  if (language === "zh-CN") return TOPIC_LABEL_ZH_CN[topic];
  return TOPIC_LABEL_EN[topic];
}
