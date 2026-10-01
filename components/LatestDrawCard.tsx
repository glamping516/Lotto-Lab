import { LottoDraw } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { LottoBall } from "@/components/LottoBall";

type LatestDrawCardProps = {
  draw: LottoDraw;
};

export function LatestDrawCard({ draw }: LatestDrawCardProps) {
  return (
    <section className="panel latest-card">
      <div>
        <div>
          <p className="eyebrow">LATEST OFFICIAL DRAW</p>
          <h2>
            <span className="gold-text">{draw.round}회</span> 최신 당첨번호
          </h2>
          <p className="latest-meta">
            최근 업데이트 시간: {formatDateTime(draw.updatedAt)}
          </p>
        </div>
      </div>
      <div className="latest-balls">
        {draw.numbers.map((number) => (
          <LottoBall key={number} number={number} large />
        ))}
        <span className="mx-1 text-xl text-gold-200">+</span>
        <LottoBall number={draw.bonus} bonus large />
      </div>
    </section>
  );
}
