import { cn, getBallTone } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  yellow: "from-yellow-200 via-yellow-400 to-amber-600 text-stone-900",
  blue: "from-sky-200 via-blue-400 to-blue-700 text-white",
  red: "from-rose-200 via-red-400 to-red-700 text-white",
  slate: "from-slate-100 via-slate-400 to-slate-700 text-white",
  green: "from-lime-100 via-emerald-400 to-green-700 text-white",
  bonus: "from-fuchsia-200 via-violet-400 to-fuchsia-700 text-white"
};

type LottoBallProps = {
  number: number;
  bonus?: boolean;
  large?: boolean;
  className?: string;
};

export function LottoBall({
  number,
  bonus = false,
  large = false,
  className
}: LottoBallProps) {
  const tone = bonus ? "bonus" : getBallTone(number);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border border-white/25 bg-gradient-to-br font-bold shadow-lg",
        "before:absolute before:inset-[10%] before:rounded-full before:bg-white/20 before:blur-[1px]",
        large ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm",
        toneClasses[tone],
        className
      )}
    >
      {bonus ? <span className="absolute -left-2 top-0 text-xs text-gold-200">+</span> : null}
      <span className="relative z-10">{number}</span>
    </div>
  );
}
