import { LottoDraw } from "@/lib/types";
import { sortNumbers } from "@/lib/utils";

export function validateDraw(draw: LottoDraw) {
  if (!Number.isInteger(draw.round) || draw.round <= 0) {
    throw new Error("회차는 1 이상의 정수여야 합니다.");
  }

  if (draw.numbers.length !== 6) {
    throw new Error("당첨번호는 6개여야 합니다.");
  }

  const sorted = sortNumbers(draw.numbers);
  const unique = new Set(sorted);
  if (unique.size !== 6) {
    throw new Error("당첨번호 6개는 중복될 수 없습니다.");
  }

  for (const number of sorted) {
    if (!Number.isInteger(number) || number < 1 || number > 45) {
      throw new Error("당첨번호는 1~45 범위의 정수여야 합니다.");
    }
  }

  if (!Number.isInteger(draw.bonus) || draw.bonus < 1 || draw.bonus > 45) {
    throw new Error("보너스 번호는 1~45 범위의 정수여야 합니다.");
  }

  if (unique.has(draw.bonus)) {
    throw new Error("보너스 번호는 당첨번호와 중복될 수 없습니다.");
  }

  if (sorted.some((value, index) => value !== draw.numbers[index])) {
    throw new Error("당첨번호 6개는 오름차순이어야 합니다.");
  }

  return true;
}
