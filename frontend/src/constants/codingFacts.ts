import type { VoiceLanguage } from "../hooks/useVoice";

const FACTS_EN = [
  "HTML stands for HyperText Markup Language - it builds the structure of web pages!",
  "CSS is like a paintbrush for websites - it adds colors, fonts, and layouts!",
  "JavaScript makes websites interactive - like adding buttons that actually do things!",
  "A variable is like a labeled box that holds data - you can name it anything!",
  "Loops let you repeat actions - like telling a robot to jump 10 times!",
  "Functions are reusable blocks of code - write once, use many times!",
  "An array is like a shopping list - it stores multiple items in order!",
  "Bugs are mistakes in code - even the best programmers make them!",
  "The first computer bug was a real moth stuck in a machine in 1947!",
  "Indentation makes code readable - like paragraphs in a story!",
  "Comments in code are notes for humans - the computer ignores them!",
  "An if-statement is like a fork in the road - the code picks a path!",
  "Pixels are tiny dots that make up everything you see on screen!",
  "RGB stands for Red, Green, Blue - mix them to make any color!",
  "The internet was invented in 1969 - older than most of your parents!",
  "Coding is like learning a new language - practice makes perfect!",
  "A boolean is simple: it's either true or false, like a light switch!",
  "AI can write code too - but it needs creative humans to guide it!",
];

const FACTS_TW = [
  "HTML 的全名是超文本標記語言 - 它建構了網頁的結構！",
  "CSS 就像網站的畫筆 - 它加上顏色、字體和排版！",
  "JavaScript 讓網站變得互動 - 就像加上真的會動的按鈕！",
  "變數就像貼了標籤的盒子 - 裡面可以放資料！",
  "迴圈讓你重複動作 - 就像告訴機器人跳 10 次！",
  "函式是可重複使用的程式碼 - 寫一次，用好多次！",
  "陣列就像購物清單 - 按順序存放很多東西！",
  "Bug 是程式裡的錯誤 - 連最厲害的工程師都會犯！",
  "第一個電腦 Bug 是 1947 年卡在機器裡的真蛾子！",
  "縮排讓程式碼更好讀 - 就像故事裡的段落！",
  "註解是給人看的筆記 - 電腦會忽略它們！",
  "if 判斷就像岔路口 - 程式會選一條走！",
  "像素是組成螢幕畫面的小點點！",
  "RGB 代表紅、綠、藍 - 混合就能調出任何顏色！",
  "網際網路在 1969 年發明 - 比大部分爸媽都老！",
  "寫程式就像學新語言 - 多練習就會進步！",
  "布林值很簡單：不是 true 就是 false，像開關一樣！",
  "AI 也能寫程式 - 但需要有創意的人來引導它！",
];

const FACTS_CN = [
  "HTML 的全名是超文本标记语言 - 它构建了网页的结构！",
  "CSS 就像网站的画笔 - 它加上颜色、字体和排版！",
  "JavaScript 让网站变得互动 - 就像加上真的会动的按钮！",
  "变量就像贴了标签的盒子 - 里面可以放数据！",
  "循环让你重复动作 - 就像告诉机器人跳 10 次！",
  "函数是可重复使用的代码 - 写一次，用好多次！",
  "数组就像购物清单 - 按顺序存放很多东西！",
  "Bug 是程序里的错误 - 连最厉害的工程师都会犯！",
  "第一个电脑 Bug 是 1947 年卡在机器里的真飞蛾！",
  "缩进让代码更好读 - 就像故事里的段落！",
  "注释是给人看的笔记 - 电脑会忽略它们！",
  "if 判断就像岔路口 - 程序会选一条走！",
  "像素是组成屏幕画面的小点点！",
  "RGB 代表红、绿、蓝 - 混合就能调出任何颜色！",
  "互联网在 1969 年发明 - 比大部分爸妈都老！",
  "写程序就像学新语言 - 多练习就会进步！",
  "布尔值很简单：不是 true 就是 false，像开关一样！",
  "AI 也能写程序 - 但需要有创意的人来引导它！",
];

const FACTS_MAP: Record<string, string[]> = {
  "en-US": FACTS_EN,
  "zh-TW": FACTS_TW,
  "zh-CN": FACTS_CN,
};

export function getCodingFacts(language: VoiceLanguage): string[] {
  return FACTS_MAP[language] || FACTS_EN;
}
