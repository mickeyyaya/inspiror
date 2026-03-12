import { useMemo } from "react";

const CANDY_COLORS = [
  "var(--color-candy-pink)",
  "var(--color-candy-blue)",
  "var(--color-candy-yellow)",
  "var(--color-candy-green)",
  "var(--color-candy-purple)",
  "var(--color-candy-orange)",
];

export function BackgroundBubbles() {
  const bubbles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const size = 20 + Math.random() * 60; // 20px to 80px
      const left = Math.random() * 100; // 0% to 100%
      const animationDuration = 10 + Math.random() * 15; // 10s to 25s
      const animationDelay = Math.random() * -20; // Start at different times
      const color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
      
      // Wobble effect
      const wobbleDuration = 3 + Math.random() * 4;
      
      return {
        id: i,
        size,
        left,
        animationDuration,
        animationDelay,
        wobbleDuration,
        color,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-gradient-to-b from-[#fdfbf7] to-[#e0f7fa] opacity-60">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute bottom-[-100px] rounded-full opacity-60 mix-blend-multiply"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            backgroundColor: b.color,
            animation: `float-up ${b.animationDuration}s ease-in infinite`,
            animationDelay: `${b.animationDelay}s`,
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
               animation: `wobble ${b.wobbleDuration}s ease-in-out infinite alternate`,
               backgroundColor: "inherit"
            }}
          />
        </div>
      ))}
    </div>
  );
}
