import type { ScoredCandidate } from "../types";
import FiveGridDisplay from "./FiveGridDisplay";
import FortuneBadge from "./FortuneBadge";

interface Props {
  surnameA: string;
  surnameB: string;
  candidateA: ScoredCandidate;
  candidateB: ScoredCandidate;
}

export default function KanjiDiagnosticView({ surnameA, surnameB, candidateA, candidateB }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">{candidateA.name.kanji}</h2>
        <p className="text-sm text-gray-500 mt-1">
          総画数：{candidateA.name.totalStrokes}画
          （{candidateA.name.charStrokes.map((s, i) => `${[...candidateA.name.kanji][i]}=${s}`).join("、")}）
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { surname: surnameA, candidate: candidateA, label: "夫の姓" },
          { surname: surnameB, candidate: candidateB, label: "妻の姓" },
        ].map(({ surname, candidate, label }) => (
          <div key={label} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{label}：{surname}</h3>
              <span className="text-sm font-mono text-orange-700 font-bold">
                {candidate.score}<span className="text-gray-400 font-normal">/24</span>
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-center gap-1">
                <FortuneBadge level={candidate.grids.tenkaku.fortune} />
                <FortuneBadge level={candidate.grids.jinkaku.fortune} />
                <FortuneBadge level={candidate.grids.chikaku.fortune} />
                <FortuneBadge level={candidate.grids.gaikaku.fortune} />
                <FortuneBadge level={candidate.grids.soukaku.fortune} />
              </div>
              <FiveGridDisplay surname={surname} name={candidate.name.kanji} grids={candidate.grids} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
