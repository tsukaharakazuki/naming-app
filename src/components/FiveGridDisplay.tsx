import type { FiveGridResult } from "../types";
import FortuneBadge from "./FortuneBadge";

interface Props {
  surname: string;
  name: string;
  grids: FiveGridResult;
}

export default function FiveGridDisplay({ surname, name, grids }: Props) {
  const surnameChars = [...surname];
  const nameChars = [...name];
  const allChars = [...surnameChars, ...nameChars];

  const gridRows = [
    { label: "天格", grid: grids.tenkaku, desc: "家系の運勢" },
    { label: "人格", grid: grids.jinkaku, desc: "性格・才能" },
    { label: "地格", grid: grids.chikaku, desc: "幼少〜青年期" },
    { label: "外格", grid: grids.gaikaku, desc: "対人関係" },
    { label: "総格", grid: grids.soukaku, desc: "生涯の運勢" },
  ];

  return (
    <div className="bg-orange-50/50 rounded-lg p-3 mt-2 text-sm">
      <div className="flex justify-center gap-3 mb-3 text-lg font-bold">
        {allChars.map((c, i) => (
          <span key={i} className={i < surnameChars.length ? "text-orange-600" : "text-amber-700"}>
            {c}
          </span>
        ))}
      </div>
      <div className="space-y-1.5">
        {gridRows.map(({ label, grid, desc }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-10 text-right font-bold text-gray-600">{label}</span>
            <span className="w-8 text-right text-gray-800 font-mono">{grid.strokes}</span>
            <FortuneBadge level={grid.fortune} />
            <span className="text-gray-500 text-xs">{grid.name}</span>
            <span className="text-gray-400 text-xs ml-auto">{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
