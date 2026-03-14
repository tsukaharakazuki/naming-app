import type { FortuneLevel, FiveGridResult } from "../types";

const fortuneWeight: Record<FortuneLevel, number> = {
  "最大吉": 6,
  "大吉": 5,
  "吉": 4,
  "凶": 2,
  "大凶": 1,
  "最大凶": 0,
};

export function calculateScore(grids: FiveGridResult): number {
  return (
    fortuneWeight[grids.jinkaku.fortune] +
    fortuneWeight[grids.chikaku.fortune] +
    fortuneWeight[grids.gaikaku.fortune] +
    fortuneWeight[grids.soukaku.fortune]
  );
}

export function fortuneColor(level: FortuneLevel): string {
  switch (level) {
    case "最大吉": return "bg-amber-400 text-amber-900";
    case "大吉": return "bg-emerald-500 text-white";
    case "吉": return "bg-blue-500 text-white";
    case "凶": return "bg-orange-500 text-white";
    case "大凶": return "bg-red-600 text-white";
    case "最大凶": return "bg-red-900 text-white";
  }
}
