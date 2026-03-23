import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export function ComboDisplay() {
  const { data: combo } = trpc.combo.getStreak.useQuery();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (combo && combo.currentStreak > 0) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [combo?.currentStreak]);

  if (!combo || combo.currentStreak === 0) return null;

  const multiplierColor = {
    "1.0": "text-gray-500",
    "2.0": "text-green-500",
    "3.0": "text-blue-500",
    "5.0": "text-purple-600",
  };

  const multiplierLabel = {
    "1.0": "Normal",
    "2.0": "2x Pontos!",
    "3.0": "3x Pontos!!",
    "5.0": "5x Pontos!!!",
  };

  const multiplierKey = combo.multiplier?.toString() || "1.0";

  return (
    <div className={`fixed top-4 right-4 z-50 backdrop-blur-md bg-white/40 border-2 border-purple-300 rounded-2xl p-4 shadow-lg transition-all duration-300 ${showAnimation ? "scale-110" : "scale-100"}`}>
      <div className="text-center">
        <div className="text-3xl mb-2 animate-bounce">🔥</div>
        <p className="text-xs font-bold text-purple-700 uppercase">Combo Ativo</p>
        <p className="text-2xl font-black text-purple-600">{combo.currentStreak}</p>
        <p className={`text-sm font-bold ${multiplierColor[multiplierKey as keyof typeof multiplierColor]}`}>
          {multiplierLabel[multiplierKey as keyof typeof multiplierLabel]}
        </p>
        <p className="text-xs text-purple-600 mt-2">Máximo: {combo.maxStreak}</p>
      </div>
    </div>
  );
}
