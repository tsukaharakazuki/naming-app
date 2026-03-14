import type { FortuneLevel } from "../types";
import { fortuneColor } from "../utils/scoring";

export default function FortuneBadge({ level }: { level: FortuneLevel }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${fortuneColor(level)}`}>
      {level}
    </span>
  );
}
