export interface AppTheme {
  id: string;
  name: string;
  emoji: string;
  backgroundColor: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
}

export const APP_THEMES: AppTheme[] = [
  {
    id: "soft-clouds",
    name: "Soft Clouds",
    emoji: "☁️",
    backgroundColor: "#87CEEB",
    backgroundImage: "url('/assets/theme-nano-0.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "tiny-stars",
    name: "Tiny Stars",
    emoji: "✨",
    backgroundColor: "#2c3e50",
    backgroundImage: "url('/assets/theme-nano-1.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "floating-bubbles",
    name: "Floating Bubbles",
    emoji: "🫧",
    backgroundColor: "#e0f7fa",
    backgroundImage: "url('/assets/theme-nano-2.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "wavy-lines",
    name: "Wavy Lines",
    emoji: "🌊",
    backgroundColor: "#1e3a8a",
    backgroundImage: "url('/assets/theme-nano-3.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "confetti-sprinkles",
    name: "Confetti Sprinkles",
    emoji: "🎉",
    backgroundColor: "#1f2937",
    backgroundImage: "url('/assets/theme-nano-4.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "rainbow-arches",
    name: "Rainbow Arches",
    emoji: "🌈",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-5.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "paw-prints",
    name: "Paw Prints",
    emoji: "🐾",
    backgroundColor: "#dcfce7",
    backgroundImage: "url('/assets/theme-nano-6.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "music-notes",
    name: "Music Notes",
    emoji: "🎵",
    backgroundColor: "#fef08a",
    backgroundImage: "url('/assets/theme-nano-7.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "daisy-flowers",
    name: "Daisy Flowers",
    emoji: "🌼",
    backgroundColor: "#86efac",
    backgroundImage: "url('/assets/theme-nano-8.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "paint-splatters",
    name: "Paint Splatters",
    emoji: "🎨",
    backgroundColor: "#1e293b",
    backgroundImage: "url('/assets/theme-nano-9.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "polka-dots",
    name: "Polka Dots",
    emoji: "🔴",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-10.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "abstract-waves",
    name: "Abstract Waves",
    emoji: "〰️",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-11.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "paper-airplanes",
    name: "Paper Airplanes",
    emoji: "✈️",
    backgroundColor: "#bae6fd",
    backgroundImage: "url('/assets/theme-nano-12.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "geometric-triangles",
    name: "Triangles",
    emoji: "🔺",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-13.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "zig-zag",
    name: "Zig Zag",
    emoji: "〰️",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-14.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "jigsaw-puzzle",
    name: "Jigsaw Puzzle",
    emoji: "🧩",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-15.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "snowflakes",
    name: "Snowflakes",
    emoji: "❄️",
    backgroundColor: "#bfdbfe",
    backgroundImage: "url('/assets/theme-nano-16.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "abstract-blobs",
    name: "Abstract Blobs",
    emoji: "💧",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-17.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "grid-paper",
    name: "Grid Paper",
    emoji: "📐",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-18.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "leaves",
    name: "Leaves",
    emoji: "🍂",
    backgroundColor: "#ffedd5",
    backgroundImage: "url('/assets/theme-nano-19.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "bouncing-balls",
    name: "Bouncing Balls",
    emoji: "🥎",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-20.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "gingham-check",
    name: "Gingham Check",
    emoji: "🧺",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-21.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "sunburst",
    name: "Sunburst",
    emoji: "☀️",
    backgroundColor: "#fef08a",
    backgroundImage: "url('/assets/theme-nano-22.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "cactus",
    name: "Cactus",
    emoji: "🌵",
    backgroundColor: "#fef3c7",
    backgroundImage: "url('/assets/theme-nano-23.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "colorful-circles",
    name: "Colorful Circles",
    emoji: "🔵",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-nano-24.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "default",
    name: "Cartoon Buddy",
    emoji: "🐶",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/cartoon-pattern.png')",
    backgroundSize: "300px 300px"
  },
  {
    id: "space-adventure",
    name: "Space Adventure",
    emoji: "🚀",
    backgroundColor: "#0B0C10",
    backgroundImage: "url('/assets/theme-space.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "candy-land",
    name: "Candy Land",
    emoji: "🍭",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-candy.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "dino-park",
    name: "Dino Park",
    emoji: "🦖",
    backgroundColor: "var(--color-candy-green)",
    backgroundImage: "url('/assets/theme-dino.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "under-sea",
    name: "Under the Sea",
    emoji: "🐠",
    backgroundColor: "var(--color-candy-blue)",
    backgroundImage: "url('/assets/theme-ocean.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "magic-castle",
    name: "Magic Castle",
    emoji: "🏰",
    backgroundColor: "var(--color-candy-purple)",
    backgroundImage: "url('/assets/theme-magic.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "candy-polka",
    name: "Candy Polka",
    emoji: "🍬",
    backgroundColor: "#fffaf0",
    backgroundImage: "url('/assets/theme-legacy-0.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "mint-stripes",
    name: "Mint Stripes",
    emoji: "🌿",
    backgroundColor: "var(--color-candy-green)",
    backgroundImage: "url('/assets/theme-legacy-1.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "purple-grid",
    name: "Purple Grid",
    emoji: "🟪",
    backgroundColor: "var(--color-candy-purple)",
    backgroundImage: "url('/assets/theme-legacy-2.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "starry-night",
    name: "Starry Night",
    emoji: "⭐",
    backgroundColor: "#2c3e50",
    backgroundImage: "url('/assets/theme-legacy-3.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "sunny-chevrons",
    name: "Sunny Chevrons",
    emoji: "☀️",
    backgroundColor: "var(--color-candy-yellow)",
    backgroundImage: "url('/assets/theme-legacy-4.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "watermelon",
    name: "Watermelon",
    emoji: "🍉",
    backgroundColor: "var(--color-candy-pink)",
    backgroundImage: "url('/assets/theme-legacy-5.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "lemonade",
    name: "Lemonade",
    emoji: "🍋",
    backgroundColor: "#fff3b0",
    backgroundImage: "url('/assets/theme-legacy-6.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    emoji: "🎈",
    backgroundColor: "#ffb7b2",
    backgroundImage: "url('/assets/theme-legacy-7.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "electric-blue",
    name: "Electric Blue",
    emoji: "⚡",
    backgroundColor: "var(--color-candy-blue)",
    backgroundImage: "url('/assets/theme-legacy-8.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "neon-lights",
    name: "Neon Lights",
    emoji: "🏮",
    backgroundColor: "#111",
    backgroundImage: "url('/assets/theme-legacy-9.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "checkerboard",
    name: "Checkerboard",
    emoji: "🏁",
    backgroundColor: "#fff",
    backgroundImage: "url('/assets/theme-legacy-10.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "rainbow-gradient",
    name: "Rainbow",
    emoji: "🌈",
    backgroundColor: "#ff7b00",
    backgroundImage: "url('/assets/theme-legacy-11.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    backgroundColor: "#ff9f1c",
    backgroundImage: "url('/assets/theme-legacy-12.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "blue-sky",
    name: "Blue Sky",
    emoji: "☁️",
    backgroundColor: "#87CEEB",
    backgroundImage: "url('/assets/theme-legacy-13.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "grass-field",
    name: "Grass Field",
    emoji: "🌱",
    backgroundColor: "#7CFC00",
    backgroundImage: "url('/assets/theme-legacy-14.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "fireball",
    name: "Fireball",
    emoji: "🔥",
    backgroundColor: "var(--color-candy-orange)",
    backgroundImage: "url('/assets/theme-legacy-15.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "cotton-candy",
    name: "Cotton Candy",
    emoji: "🍡",
    backgroundColor: "var(--color-candy-pink)",
    backgroundImage: "url('/assets/theme-legacy-16.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "gummy-bear",
    name: "Gummy Bear",
    emoji: "🧸",
    backgroundColor: "var(--color-candy-green)",
    backgroundImage: "url('/assets/theme-legacy-17.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "chocolate-chip",
    name: "Chocolate Chip",
    emoji: "🍪",
    backgroundColor: "#D2B48C",
    backgroundImage: "url('/assets/theme-legacy-18.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "strawberry",
    name: "Strawberry",
    emoji: "🍓",
    backgroundColor: "#ff4d4d",
    backgroundImage: "url('/assets/theme-legacy-19.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "magic-carpet",
    name: "Magic Carpet",
    emoji: "🧞",
    backgroundColor: "var(--color-candy-purple)",
    backgroundImage: "url('/assets/theme-legacy-20.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "treasure-map",
    name: "Treasure Map",
    emoji: "🗺️",
    backgroundColor: "#F5DEB3",
    backgroundImage: "url('/assets/theme-legacy-21.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "fairy-dust",
    name: "Fairy Dust",
    emoji: "✨",
    backgroundColor: "var(--color-candy-pink)",
    backgroundImage: "url('/assets/theme-legacy-22.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "space-void",
    name: "Space",
    emoji: "🚀",
    backgroundColor: "#0B0C10",
    backgroundImage: "url('/assets/theme-legacy-23.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    emoji: "🦑",
    backgroundColor: "#001f3f",
    backgroundImage: "url('/assets/theme-legacy-24.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "watermelon-sugar",
    name: "Watermelon Sugar",
    emoji: "🍉",
    backgroundColor: "var(--color-candy-green)",
    backgroundImage: "url('/assets/theme-legacy-25.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "confetti-party",
    name: "Confetti",
    emoji: "🎉",
    backgroundColor: "#fff",
    backgroundImage: "url('/assets/theme-legacy-26.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "tiger-stripes",
    name: "Tiger Stripes",
    emoji: "🐅",
    backgroundColor: "var(--color-candy-orange)",
    backgroundImage: "url('/assets/theme-legacy-27.png')",
    backgroundSize: "400px 400px"
  },
  {
    id: "honeycomb",
    name: "Honeycomb",
    emoji: "🐝",
    backgroundColor: "var(--color-candy-yellow)",
    backgroundImage: "url('/assets/theme-legacy-28.png')",
    backgroundSize: "400px 400px"
  }
];
