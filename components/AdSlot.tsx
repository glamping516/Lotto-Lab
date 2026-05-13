type AdSlotProps = {
  title: string;
  envKey?: string;
  className?: string;
};

export function AdSlot({ title, envKey, className }: AdSlotProps) {
  const configured = envKey ? process.env[envKey] : null;

  return (
    <div className={`panel slot-grid p-4 text-center ${className ?? ""}`}>
      <p className="text-xs uppercase tracking-[0.35em] text-gold-300/80">Ad Placeholder</p>
      <p className="mt-2 text-sm font-semibold text-white/90">{title}</p>
      <p className="mt-1 text-xs text-white/55">
        {configured
          ? "환경변수 기반 광고 슬롯 연결 준비 완료"
          : "NEXT_PUBLIC_* 광고 환경변수로 추후 교체 가능"}
      </p>
    </div>
  );
}
