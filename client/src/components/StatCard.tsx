import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  gradient?: "purple" | "pink" | "blue" | "green";
  onClick?: () => void;
}

export function StatCard({ 
  icon, 
  label, 
  value, 
  gradient = "purple",
  onClick 
}: StatCardProps) {
  const gradientClasses = {
    purple: "from-purple-600 to-pink-500",
    pink: "from-pink-500 to-red-500",
    blue: "from-blue-500 to-purple-600",
    green: "from-green-500 to-emerald-500",
  };

  return (
    <div
      onClick={onClick}
      className={`group backdrop-blur-md bg-white/40 border border-white/60 rounded-2xl p-4 hover:bg-white/60 transition-all duration-300 hover:scale-105 ${onClick ? "cursor-pointer" : ""} shadow-lg hover:shadow-xl`}
    >
      <div className="text-center">
        <div className="text-4xl mb-2 group-hover:animate-bounce-in">{icon}</div>
        <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-black bg-gradient-to-r ${gradientClasses[gradient]} bg-clip-text text-transparent`}>
          {value}
        </p>
      </div>
    </div>
  );
}
