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
    backgroundImage: "radial-gradient(var(--color-candy-yellow) 4px, transparent 4px), radial-gradient(var(--color-candy-pink) 4px, transparent 4px)",
    backgroundSize: "40px 40px",
    backgroundPosition: "0 0, 20px 20px"
  },
  {
    id: "mint-stripes",
    name: "Mint Stripes",
    emoji: "🌿",
    backgroundColor: "var(--color-candy-green)",
    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)"
  },
  {
    id: "purple-grid",
    name: "Purple Grid",
    emoji: "🟪",
    backgroundColor: "var(--color-candy-purple)",
    backgroundImage: "linear-gradient(white 2px, transparent 2px), linear-gradient(90deg, white 2px, transparent 2px), linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
    backgroundSize: "50px 50px, 50px 50px, 10px 10px, 10px 10px",
    backgroundPosition: "-2px -2px, -2px -2px, -1px -1px, -1px -1px"
  },
  {
    id: "starry-night",
    name: "Starry Night",
    emoji: "⭐",
    backgroundColor: "#2c3e50",
    backgroundImage: "radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 4px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 3px)",
    backgroundSize: "100px 100px, 50px 50px",
    backgroundPosition: "0 0, 25px 25px"
  },
  {
    id: "sunny-chevrons",
    name: "Sunny Chevrons",
    emoji: "☀️",
    backgroundColor: "var(--color-candy-yellow)",
    backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.6) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.6) 25%, transparent 25%), linear-gradient(45deg, rgba(255,255,255,0.6) 25%, transparent 25%), linear-gradient(315deg, rgba(255,255,255,0.6) 25%, transparent 25%)",
    backgroundSize: "40px 40px",
    backgroundPosition: "20px 0, 20px 0, 0 0, 0 0"
  },
  {
    id: "watermelon",
    name: "Watermelon",
    emoji: "🍉",
    backgroundColor: "var(--color-candy-pink)",
    backgroundImage: "radial-gradient(#222 3px, transparent 4px)",
    backgroundSize: "40px 40px",
    backgroundPosition: "0 0, 20px 20px"
  },
  {
    id: "lemonade",
    name: "Lemonade",
    emoji: "🍋",
    backgroundColor: "#fff3b0",
    backgroundImage: "repeating-radial-gradient(circle, #fff 0, #fff 10px, transparent 10px, transparent 20px)",
    backgroundSize: "60px 60px"
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    emoji: "🎈",
    backgroundColor: "#ffb7b2",
    backgroundImage: "radial-gradient(circle, #ff9aa2 20%, transparent 20%), radial-gradient(circle, #ff9aa2 20%, transparent 20%)",
    backgroundSize: "50px 50px",
    backgroundPosition: "0 0, 25px 25px"
  },
  {
    id: "electric-blue",
    name: "Electric Blue",
    emoji: "⚡",
    backgroundColor: "var(--color-candy-blue)",
    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px)"
  },
  {
    id: "neon-lights",
    name: "Neon Lights",
    emoji: "🏮",
    backgroundColor: "#111",
    backgroundImage: "linear-gradient(45deg, var(--color-candy-pink) 25%, transparent 25%, transparent 75%, var(--color-candy-blue) 75%, var(--color-candy-blue)), linear-gradient(45deg, var(--color-candy-pink) 25%, transparent 25%, transparent 75%, var(--color-candy-blue) 75%, var(--color-candy-blue))",
    backgroundSize: "60px 60px",
    backgroundPosition: "0 0, 30px 30px"
  },
  {
    id: "checkerboard",
    name: "Checkerboard",
    emoji: "🏁",
    backgroundColor: "#fff",
    backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)",
    backgroundSize: "40px 40px",
    backgroundPosition: "0 0, 20px 20px"
  },
  {
    id: "rainbow-gradient",
    name: "Rainbow",
    emoji: "🌈",
    backgroundColor: "#ff7b00",
    backgroundImage: "linear-gradient(45deg, var(--color-candy-pink), var(--color-candy-orange), var(--color-candy-yellow), var(--color-candy-green), var(--color-candy-blue), var(--color-candy-purple))",
  },
  {
    id: "sunset",
    name: "Sunset",
    emoji: "🌅",
    backgroundColor: "#ff9f1c",
    backgroundImage: "linear-gradient(to bottom, var(--color-candy-purple), var(--color-candy-pink), var(--color-candy-orange), var(--color-candy-yellow))"
  },
  {
    id: "blue-sky",
    name: "Blue Sky",
    emoji: "☁️",
    backgroundColor: "#87CEEB",
    backgroundImage: "radial-gradient(circle at 20% 30%, white 10%, transparent 10%), radial-gradient(circle at 80% 60%, white 15%, transparent 15%)",
    backgroundSize: "200px 200px"
  },
  {
    id: "grass-field",
    name: "Grass Field",
    emoji: "🌱",
    backgroundColor: "#7CFC00",
    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,100,0,0.1) 20px, rgba(0,100,0,0.1) 40px)"
  },
  {
    id: "fireball",
    name: "Fireball",
    emoji: "🔥",
    backgroundColor: "var(--color-candy-orange)",
    backgroundImage: "radial-gradient(circle, var(--color-candy-yellow) 10%, transparent 40%)",
    backgroundSize: "60px 60px"
  },
  {
    id: "cotton-candy",
    name: "Cotton Candy",
    emoji: "🍡",
    backgroundColor: "var(--color-candy-pink)",
    backgroundImage: "radial-gradient(circle, var(--color-candy-blue) 30%, transparent 30%)",
    backgroundSize: "80px 80px",
    backgroundPosition: "0 0, 40px 40px"
  },
  {
    id: "gummy-bear",
    name: "Gummy Bear",
    emoji: "🧸",
    backgroundColor: "var(--color-candy-green)",
    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 20%, transparent 20%)",
    backgroundSize: "30px 30px"
  },
  {
    id: "chocolate-chip",
    name: "Chocolate Chip",
    emoji: "🍪",
    backgroundColor: "#D2B48C",
    backgroundImage: "radial-gradient(circle, #8B4513 15%, transparent 15%)",
    backgroundSize: "50px 50px",
    backgroundPosition: "10px 10px, 35px 35px"
  },
  {
    id: "strawberry",
    name: "Strawberry",
    emoji: "🍓",
    backgroundColor: "#ff4d4d",
    backgroundImage: "radial-gradient(circle, #fff 10%, transparent 10%)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 10px 10px"
  },
  {
    id: "magic-carpet",
    name: "Magic Carpet",
    emoji: "🧞",
    backgroundColor: "var(--color-candy-purple)",
    backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 10px, transparent 10px, transparent 20px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 10px, transparent 10px, transparent 20px)"
  },
  {
    id: "treasure-map",
    name: "Treasure Map",
    emoji: "🗺️",
    backgroundColor: "#F5DEB3",
    backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
    backgroundSize: "30px 30px"
  },
  {
    id: "fairy-dust",
    name: "Fairy Dust",
    emoji: "✨",
    backgroundColor: "var(--color-candy-pink)",
    backgroundImage: "radial-gradient(white 1px, transparent 1px)",
    backgroundSize: "20px 20px",
    backgroundPosition: "0 0, 10px 10px"
  },
  {
    id: "space-void",
    name: "Space",
    emoji: "🚀",
    backgroundColor: "#0B0C10",
    backgroundImage: "radial-gradient(white 2px, transparent 3px)",
    backgroundSize: "40px 40px",
    backgroundPosition: "0 0, 20px 20px"
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    emoji: "🦑",
    backgroundColor: "#001f3f",
    backgroundImage: "linear-gradient(to top, #001f3f, var(--color-candy-blue))"
  },
  {
    id: "watermelon-sugar",
    name: "Watermelon Sugar",
    emoji: "🍉",
    backgroundColor: "var(--color-candy-green)",
    backgroundImage: "linear-gradient(to bottom, var(--color-candy-pink) 50%, var(--color-candy-green) 50%)"
  },
  {
    id: "confetti-party",
    name: "Confetti",
    emoji: "🎉",
    backgroundColor: "#fff",
    backgroundImage: "radial-gradient(circle, var(--color-candy-pink) 3px, transparent 4px), radial-gradient(circle, var(--color-candy-blue) 3px, transparent 4px), radial-gradient(circle, var(--color-candy-yellow) 3px, transparent 4px)",
    backgroundSize: "40px 40px",
    backgroundPosition: "0 0, 15px 15px, 30px 30px"
  },
  {
    id: "tiger-stripes",
    name: "Tiger Stripes",
    emoji: "🐅",
    backgroundColor: "var(--color-candy-orange)",
    backgroundImage: "repeating-linear-gradient(-45deg, #222, #222 10px, transparent 10px, transparent 20px)"
  },
  {
    id: "honeycomb",
    name: "Honeycomb",
    emoji: "🐝",
    backgroundColor: "var(--color-candy-yellow)",
    backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.1) 10px, transparent 11px)",
    backgroundSize: "30px 30px"
  }
];
