import type { FiveGridResult } from "../types";
import { getStrokeCount } from "../data/kanjiStrokes";
import FortuneBadge from "./FortuneBadge";

interface Props {
  surname: string;
  name: string;
  grids: FiveGridResult;
}

export default function FiveGridDisplay({ surname, name, grids }: Props) {
  const surnameChars = [...surname];
  const nameChars = [...name];

  const surnameStrokes = surnameChars.map(c => getStrokeCount(c) ?? 0);
  const nameStrokes = nameChars.map(c => getStrokeCount(c) ?? 0);

  // Which characters contribute to each grid
  // tenkaku: all surname chars
  // jinkaku: last surname char + first name char
  // chikaku: all name chars
  // gaikaku: first surname char + last name char (special cases for 1-char)
  // soukaku: all chars

  type GridKey = "tenkaku" | "jinkaku" | "chikaku" | "gaikaku" | "soukaku";

  const gridHighlights: Record<GridKey, { surname: boolean[]; name: boolean[] }> = {
    tenkaku: {
      surname: surnameChars.map(() => true),
      name: nameChars.map(() => false),
    },
    jinkaku: {
      surname: surnameChars.map((_, i) => i === surnameChars.length - 1),
      name: nameChars.map((_, i) => i === 0),
    },
    chikaku: {
      surname: surnameChars.map(() => false),
      name: nameChars.map(() => true),
    },
    gaikaku: {
      surname: surnameChars.map((_, i) => {
        if (surnameChars.length === 1 && nameChars.length === 1) return false;
        if (surnameChars.length === 1) return false;
        return i === 0;
      }),
      name: nameChars.map((_, i) => {
        if (surnameChars.length === 1 && nameChars.length === 1) return false;
        if (nameChars.length === 1) return false;
        return i === nameChars.length - 1;
      }),
    },
    soukaku: {
      surname: surnameChars.map(() => true),
      name: nameChars.map(() => true),
    },
  };

  function formulaText(key: GridKey): string {
    const h = gridHighlights[key];
    const parts: string[] = [];
    surnameChars.forEach((c, i) => {
      if (h.surname[i]) parts.push(`${c}(${surnameStrokes[i]})`);
    });
    nameChars.forEach((c, i) => {
      if (h.name[i]) parts.push(`${c}(${nameStrokes[i]})`);
    });

    // Special case: 1-char surname/name adds virtual 1
    if (key === "gaikaku") {
      if (surnameChars.length === 1 && nameChars.length === 1) {
        return "1 + 1 = 2";
      }
      if (surnameChars.length === 1) {
        const last = nameChars[nameChars.length - 1];
        const lastS = nameStrokes[nameChars.length - 1];
        return `1 + ${last}(${lastS})`;
      }
      if (nameChars.length === 1) {
        const first = surnameChars[0];
        const firstS = surnameStrokes[0];
        return `${first}(${firstS}) + 1`;
      }
    }

    return parts.join(" + ");
  }

  const gridRows: { label: string; key: GridKey; desc: string }[] = [
    { label: "天格", key: "tenkaku", desc: "家系の運勢" },
    { label: "人格", key: "jinkaku", desc: "性格・才能" },
    { label: "地格", key: "chikaku", desc: "幼少〜青年期" },
    { label: "外格", key: "gaikaku", desc: "対人関係" },
    { label: "総格", key: "soukaku", desc: "生涯の運勢" },
  ];

  return (
    <div className="bg-orange-50/50 rounded-lg p-3 mt-2 text-sm">
      {/* Character display with strokes */}
      <div className="flex justify-center gap-4 mb-3">
        {surnameChars.map((c, i) => (
          <div key={`s${i}`} className="text-center">
            <span className="text-lg font-bold text-orange-600">{c}</span>
            <div className="text-xs text-gray-400">{surnameStrokes[i]}画</div>
          </div>
        ))}
        {nameChars.map((c, i) => (
          <div key={`n${i}`} className="text-center">
            <span className="text-lg font-bold text-amber-700">{c}</span>
            <div className="text-xs text-gray-400">{nameStrokes[i]}画</div>
          </div>
        ))}
      </div>

      {/* Grid rows with formula */}
      <div className="space-y-1.5">
        {gridRows.map(({ label, key, desc }) => {
          const grid = grids[key];
          return (
            <div key={label} className="flex items-center gap-2">
              <span className="w-10 text-right font-bold text-gray-600 shrink-0">{label}</span>
              <span className="w-8 text-right text-gray-800 font-mono shrink-0">{grid.strokes}</span>
              <FortuneBadge level={grid.fortune} />
              <span className="text-gray-500 text-xs shrink-0">{grid.name}</span>
              <span className="text-gray-400 text-xs ml-auto shrink-0 hidden sm:inline">
                {formulaText(key)}
              </span>
              <span className="text-gray-300 text-xs ml-auto shrink-0 sm:hidden">
                {desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
