import { CONFETTI_COUNT } from "../constants";

interface ConfettiBurstProps {
  show: boolean;
}

export function ConfettiBurst({ show }: ConfettiBurstProps) {
  if (!show) return null;

  const colors = [
    "var(--color-candy-pink)",
    "var(--color-candy-blue)",
    "var(--color-candy-yellow)",
    "var(--color-candy-green)",
    "var(--color-candy-purple)",
    "var(--color-candy-orange)",
  ];

  return (
    <div
      data-testid="confetti-burst"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    >
      {Array.from({ length: CONFETTI_COUNT }, (_, i) => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const velocity = 20 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 30;
        const rot = Math.random() * 360;
        const delay = Math.random() * 0.15;
        const duration = 1.5 + Math.random();
        const isCircle = Math.random() > 0.5;
        const width = 10 + Math.random() * 15;
        const height = isCircle ? width : 10 + Math.random() * 20;

        return (
          <div
            key={i}
            className="confetti-piece border-2 border-[#222] shadow-[2px_2px_0_#222]"
            style={
              {
                background: color,
                borderRadius: isCircle ? "50%" : "4px",
                width: `${width}px`,
                height: `${height}px`,
                "--tx": `${tx}vw`,
                "--ty": `${ty}vh`,
                "--rot": `${rot}deg`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
