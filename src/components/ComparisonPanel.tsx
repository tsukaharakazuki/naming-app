import type { ScoredCandidate } from "../types";
import FiveGridDisplay from "./FiveGridDisplay";
import FortuneBadge from "./FortuneBadge";

interface Props {
  surnameA: string;
  surnameB: string;
  candidatesA: ScoredCandidate[];
  candidatesB: ScoredCandidate[];
  selectedNames: Set<string>;
  onRemoveName: (kanji: string) => void;
}

export default function ComparisonPanel({ surnameA, surnameB, candidatesA, candidatesB, selectedNames, onRemoveName }: Props) {
  const selected = [...selectedNames];

  const findCandidate = (candidates: ScoredCandidate[], kanji: string) =>
    candidates.find(c => c.name.kanji === kanji);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-3 border-b">
        <h3 className="font-bold text-gray-800">選択した名前の比較（{selected.length}件）</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {selected.map(kanji => {
          const candA = findCandidate(candidatesA, kanji);
          const candB = findCandidate(candidatesB, kanji);
          if (!candA && !candB) return null;

          return (
            <div key={kanji} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-800">{kanji}</span>
                  {candA && (
                    <span className="text-xs text-gray-400">{candA.name.reading}</span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveName(kanji)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                  title="選択解除"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { surname: surnameA, candidate: candA, label: "夫の姓" },
                  { surname: surnameB, candidate: candB, label: "妻の姓" },
                ].map(({ surname, candidate, label }) => (
                  <div key={label} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">{label}：{surname}</span>
                      {candidate && (
                        <span className="text-sm font-mono text-orange-700 font-bold">
                          {candidate.score}<span className="text-gray-400 font-normal">/24</span>
                        </span>
                      )}
                    </div>
                    {candidate ? (
                      <>
                        <div className="flex gap-1 mb-2">
                          <FortuneBadge level={candidate.grids.tenkaku.fortune} />
                          <FortuneBadge level={candidate.grids.jinkaku.fortune} />
                          <FortuneBadge level={candidate.grids.chikaku.fortune} />
                          <FortuneBadge level={candidate.grids.gaikaku.fortune} />
                          <FortuneBadge level={candidate.grids.soukaku.fortune} />
                        </div>
                        <FiveGridDisplay surname={surname} name={kanji} grids={candidate.grids} />
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">候補に含まれていません</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
