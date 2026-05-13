import { LottoDraw } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { LottoBall } from "@/components/LottoBall";

type LatestDrawCardProps = {
  draw: LottoDraw;
};

export function LatestDrawCard({ draw }: LatestDrawCardProps) {
  return (
    <section className="panel-gold p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold-300/80">Latest Draw</p>
          <h2 className="mt-2 text-3xl font-semibold">
            <span className="gold-text">{draw.round}회</span> 최신 당첨번호
          </h2>
          <p className="mt-2 text-sm text-white/65">
            최근 업데이트 시간: {formatDateTime(draw.updatedAt)}
          </p>
        </div>
        <div className="rounded-2xl border border-gold-300/15 bg-black/20 px-4 py-3 text-sm text-white/70">
          최신 회차가 항상 상단에 유지되도록 내림차순 관리합니다.
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {draw.numbers.map((number) => (
          <LottoBall key={number} number={number} large />
        ))}
        <span className="mx-1 text-xl text-gold-200">+</span>
        <LottoBall number={draw.bonus} bonus large />
      </div>
    </section>
  );
}
