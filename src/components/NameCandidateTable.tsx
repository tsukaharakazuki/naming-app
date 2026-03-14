import { useState, useMemo } from "react";
import type { ScoredCandidate } from "../types";
import FortuneBadge from "./FortuneBadge";
import FiveGridDisplay from "./FiveGridDisplay";

interface Props {
  surname: string;
  candidates: ScoredCandidate[];
  label: string;
}

const PAGE_SIZE = 30;

export default function NameCandidateTable({ surname, candidates, label }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<"score" | "strokes" | "reading">("score");

  const sorted = useMemo(() => {
    const arr = [...candidates];
    switch (sortBy) {
      case "score":
        return arr.sort((a, b) => b.score - a.score);
      case "strokes":
        return arr.sort((a, b) => a.grids.soukaku.strokes - b.grids.soukaku.strokes);
      case "reading":
        return arr.sort((a, b) => a.name.kanji.localeCompare(b.name.kanji, "ja"));
    }
  }, [candidates, sortBy]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800">{label}：{surname}</h3>
          <p className="text-xs text-gray-500">{candidates.length}件の候補</p>
        </div>
        <select
          value={sortBy}
          onChange={e => { setSortBy(e.target.value as typeof sortBy); setPage(0); }}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="score">スコア順</option>
          <option value="strokes">総画数順</option>
          <option value="reading">漢字順</option>
        </select>
      </div>

      {paged.length === 0 ? (
        <div className="p-8 text-center text-gray-400">候補が見つかりませんでした</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {paged.map((c, i) => {
            const globalIdx = page * PAGE_SIZE + i;
            const isExpanded = expandedIdx === globalIdx;
            return (
              <div key={c.name.kanji + i}>
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : globalIdx)}
                  className="w-full text-left px-4 py-2.5 hover:bg-purple-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-800 min-w-[3em]">{c.name.kanji}</span>
                    <span className="text-xs text-gray-400">{c.name.reading}</span>
                    <span className="ml-auto flex items-center gap-1 text-sm font-mono text-purple-700 font-bold">
                      {c.score}<span className="text-gray-400 font-normal">/24</span>
                    </span>
                    <div className="flex gap-1">
                      <FortuneBadge level={c.grids.tenkaku.fortune} />
                      <FortuneBadge level={c.grids.jinkaku.fortune} />
                      <FortuneBadge level={c.grids.chikaku.fortune} />
                      <FortuneBadge level={c.grids.gaikaku.fortune} />
                      <FortuneBadge level={c.grids.soukaku.fortune} />
                    </div>
                    <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3">
                    <FiveGridDisplay surname={surname} name={c.name.kanji} grids={c.grids} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-3 border-t bg-gray-50 text-sm">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded bg-white border border-gray-300 disabled:opacity-30 hover:bg-gray-100"
          >
            ←
          </button>
          <span className="text-gray-600">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 rounded bg-white border border-gray-300 disabled:opacity-30 hover:bg-gray-100"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
