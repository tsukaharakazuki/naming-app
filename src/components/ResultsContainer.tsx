import { useState, useMemo } from "react";
import type { ScoredCandidate } from "../types";
import NameCandidateTable from "./NameCandidateTable";

interface Props {
  surnameA: string;
  surnameB: string;
  candidatesA: ScoredCandidate[];
  candidatesB: ScoredCandidate[];
}

export default function ResultsContainer({ surnameA, surnameB, candidatesA, candidatesB }: Props) {
  const [activeTab, setActiveTab] = useState<"a" | "b">("a");
  const [selectedA, setSelectedA] = useState<string | null>(null);
  const [selectedB, setSelectedB] = useState<string | null>(null);

  // 夫側で選択 → 妻側でハイライト（同じ名前があれば）
  const highlightB = useMemo(() => {
    if (!selectedA) return null;
    return candidatesB.some(c => c.name.kanji === selectedA) ? selectedA : null;
  }, [selectedA, candidatesB]);

  // 妻側で選択 → 夫側でハイライト
  const highlightA = useMemo(() => {
    if (!selectedB) return null;
    return candidatesA.some(c => c.name.kanji === selectedB) ? selectedB : null;
  }, [selectedB, candidatesA]);

  const bothGoodNames = useMemo(() => {
    const threshold = 16;
    const goodA = new Set(candidatesA.filter(c => c.score >= threshold).map(c => c.name.kanji));
    return new Set(candidatesB.filter(c => c.score >= threshold && goodA.has(c.name.kanji)).map(c => c.name.kanji));
  }, [candidatesA, candidatesB]);

  return (
    <div className="space-y-4">
      {bothGoodNames.size > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-bold text-amber-800 mb-2">
            両方の姓で好相性の名前 ({bothGoodNames.size}件)
          </h3>
          <div className="flex flex-wrap gap-2">
            {[...bothGoodNames].map(name => (
              <span key={name} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {(selectedA || selectedB) && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm">
          <div className="flex flex-wrap gap-4">
            {selectedA && (
              <span className="text-orange-800">
                <strong>夫の姓</strong>で「<strong>{selectedA}</strong>」を選択中 → 妻の姓側で同名をハイライト表示
              </span>
            )}
            {selectedB && (
              <span className="text-orange-800">
                <strong>妻の姓</strong>で「<strong>{selectedB}</strong>」を選択中 → 夫の姓側で同名をハイライト表示
              </span>
            )}
          </div>
        </div>
      )}

      {/* Desktop: side by side */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
        <NameCandidateTable
          surname={surnameA}
          candidates={candidatesA}
          label="夫の姓"
          selectedName={selectedA}
          highlightName={highlightA}
          onSelectName={(name) => setSelectedA(name || null)}
        />
        <NameCandidateTable
          surname={surnameB}
          candidates={candidatesB}
          label="妻の姓"
          selectedName={selectedB}
          highlightName={highlightB}
          onSelectName={(name) => setSelectedB(name || null)}
        />
      </div>

      {/* Mobile: tabs */}
      <div className="lg:hidden">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("a")}
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
              activeTab === "a"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            夫の姓：{surnameA}
          </button>
          <button
            onClick={() => setActiveTab("b")}
            className={`flex-1 py-2 text-center font-medium border-b-2 transition-colors ${
              activeTab === "b"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            妻の姓：{surnameB}
          </button>
        </div>
        {activeTab === "a"
          ? <NameCandidateTable surname={surnameA} candidates={candidatesA} label="夫の姓" selectedName={selectedA} highlightName={highlightA} onSelectName={(name) => setSelectedA(name || null)} />
          : <NameCandidateTable surname={surnameB} candidates={candidatesB} label="妻の姓" selectedName={selectedB} highlightName={highlightB} onSelectName={(name) => setSelectedB(name || null)} />
        }
      </div>
    </div>
  );
}
