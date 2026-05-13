"use client";

import { cn } from "@/lib/utils";

type LottoMachineProps = {
  active?: boolean;
  compact?: boolean;
};

export function LottoMachine({ active = true, compact = false }: LottoMachineProps) {
  const orbitBalls = Array.from({ length: compact ? 6 : 10 }, (_, index) => index);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full border border-gold-300/20 bg-white/5",
        compact ? "h-48 w-48" : "h-72 w-72"
      )}
    >
      <div className="absolute inset-6 rounded-full border border-dashed border-gold-300/20" />
      <div
        className={cn(
          "absolute inset-12 rounded-full border border-gold-300/25 bg-gradient-to-br from-gold-300/10 via-white/5 to-transparent",
          active ? "animate-spinSlow" : ""
        )}
      />
      <div className="absolute h-20 w-20 rounded-full bg-gold-300/10 blur-3xl" />
      {orbitBalls.map((ball) => {
        const angle = (ball / orbitBalls.length) * Math.PI * 2;
        const radius = compact ? 68 : 108;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <span
            key={ball}
            className={cn(
              "absolute flex items-center justify-center rounded-full border border-white/10 bg-gradient-to-br text-xs font-bold shadow-lg",
              ball % 5 === 0
                ? "from-yellow-200 via-yellow-400 to-amber-600 text-stone-900"
                : ball % 5 === 1
                  ? "from-sky-200 via-blue-400 to-blue-700 text-white"
                  : ball % 5 === 2
                    ? "from-rose-200 via-red-400 to-red-700 text-white"
                    : ball % 5 === 3
                      ? "from-slate-100 via-slate-400 to-slate-700 text-white"
                      : "from-lime-100 via-emerald-400 to-green-700 text-white",
              compact ? "h-8 w-8" : "h-10 w-10",
              active ? "animate-float" : ""
            )}
            style={{
              transform: `translate(${x}px, ${y}px)`,
              animationDelay: `${ball * 120}ms`
            }}
          >
            {(ball * 7) % 45 || 45}
          </span>
        );
      })}
      <div className="absolute inset-[28%] rounded-full border border-white/15 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md" />
      <div className="absolute inset-[36%] rounded-full border border-gold-300/20 bg-gradient-to-br from-gold-300/10 to-transparent" />
      <div className="absolute bottom-4 h-6 w-24 rounded-full bg-black/30 blur-xl" />
    </div>
  );
}
