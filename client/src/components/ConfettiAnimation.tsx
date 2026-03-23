import { useEffect, useState } from "react";

interface Confetti {
  id: number;
  left: number;
  delay: number;
  duration: number;
  emoji: string;
}

export function ConfettiAnimation({ isActive }: { isActive: boolean }) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  useEffect(() => {
    if (!isActive) return;

    const emojis = ["🎉", "🎊", "⭐", "✨", "🌟", "💫", "🎯", "🏆"];
    const newConfetti: Confetti[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 2 + Math.random() * 1,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));

    setConfetti(newConfetti);

    const timer = setTimeout(() => {
      setConfetti([]);
    }, 3500);

    return () => clearTimeout(timer);
  }, [isActive]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confetti.map((item) => (
        <div
          key={item.id}
          className="animate-confetti fixed text-3xl"
          style={{
            left: `${item.left}%`,
            top: "-50px",
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          {item.emoji}
        </div>
      ))}
    </div>
  );
}
