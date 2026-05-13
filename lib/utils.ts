import { LottoDraw } from "@/lib/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function sortNumbers(values: number[]) {
  return [...values].sort((a, b) => a - b);
}

export function uniqueNumbers(values: number[]) {
  return Array.from(new Set(values));
}

export function average(values: number[]) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function standardDeviation(values: number[]) {
  if (values.length <= 1) {
    return 0;
  }
  const mean = average(values);
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function round(value: number, digits = 2) {
  const power = 10 ** digits;
  return Math.round(value * power) / power;
}

export function formatDateTime(value?: string) {
  if (!value) {
    return "N/A";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(new Date(value));
}

export function formatRelativeKst(now = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul"
  }).format(now);
}

export function sliceWindow(data: LottoDraw[], window: number | "all") {
  return window === "all" ? data : data.slice(0, window);
}

export function sumNumbers(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}

export function rangeLabel(window: number | "all") {
  return window === "all" ? "전체 기간" : `최근 ${window}회`;
}

export function seededHash(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getBallTone(value: number) {
  if (value <= 10) {
    return "yellow";
  }
  if (value <= 20) {
    return "blue";
  }
  if (value <= 30) {
    return "red";
  }
  if (value <= 40) {
    return "slate";
  }
  return "green";
}
