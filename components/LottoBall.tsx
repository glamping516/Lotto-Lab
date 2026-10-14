import { cn, getBallTone } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  yellow: "from-[#dbc784] via-[#bda04f] to-[#826731] text-white",
  blue: "from-[#94b7ca] via-[#638ba3] to-[#3e5c73] text-white",
  red: "from-[#d6a59c] via-[#b4766b] to-[#744d47] text-white",
  slate: "from-[#b9c3c7] via-[#828e96] to-[#4d5e65] text-white",
  green: "from-[#a5c5b1] via-[#6f9a82] to-[#466854] text-white",
  bonus: "from-[#a5c5b1] via-[#6f9a82] to-[#466854] text-white"
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
