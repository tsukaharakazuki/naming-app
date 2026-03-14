import { useState, useMemo, useTransition } from "react";
import type { ScoredCandidate } from "./types";
import { generateCandidates } from "./utils/candidateGenerator";
import { calculateFiveGrids } from "./utils/fiveGridCalculator";
import { calculateScore } from "./utils/scoring";
import { getSurnameStrokes } from "./data/kanjiStrokes";
import Header from "./components/Header";
import InputSection from "./components/InputSection";
import ResultsContainer from "./components/ResultsContainer";

function App() {
  const [surnameA, setSurnameA] = useState("");
  const [surnameB, setSurnameB] = useState("");
  const [reading, setReading] = useState("");
  const [nameLength, setNameLength] = useState(2);

  const [surnameAError, setSurnameAError] = useState("");
  const [surnameBError, setSurnameBError] = useState("");
  const [readingError, setReadingError] = useState("");

  const [candidatesA, setCandidatesA] = useState<ScoredCandidate[]>([]);
  const [candidatesB, setCandidatesB] = useState<ScoredCandidate[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [isPending, startTransition] = useTransition();

  const kanjiRegex = useMemo(() => /^[\u4e00-\u9faf\u3400-\u4dbf]+$/, []);
  const hiraganaRegex = useMemo(() => /^[\u3040-\u309f]+$/, []);

  function validate(): boolean {
    let ok = true;
    if (!surnameA || !kanjiRegex.test(surnameA)) {
      setSurnameAError("漢字で入力してください");
      ok = false;
    } else {
      const strokes = getSurnameStrokes(surnameA);
      if (!strokes) {
        setSurnameAError("画数が取得できない漢字が含まれています");
        ok = false;
      } else {
        setSurnameAError("");
      }
    }

    if (!surnameB || !kanjiRegex.test(surnameB)) {
      setSurnameBError("漢字で入力してください");
      ok = false;
    } else {
      const strokes = getSurnameStrokes(surnameB);
      if (!strokes) {
        setSurnameBError("画数が取得できない漢字が含まれています");
        ok = false;
      } else {
        setSurnameBError("");
      }
    }

    if (!reading || !hiraganaRegex.test(reading)) {
      setReadingError("ひらがなで入力してください");
      ok = false;
    } else if (reading.length < 1) {
      setReadingError("1文字以上入力してください");
      ok = false;
    } else {
      setReadingError("");
    }

    return ok;
  }

  function handleSubmit() {
    if (!validate()) return;

    startTransition(() => {
      const surnameAStrokes = getSurnameStrokes(surnameA)!;
      const surnameBStrokes = getSurnameStrokes(surnameB)!;

      // 指定文字数以下も含めて候補生成
      const charCounts: number[] = [];
      for (let i = 1; i <= nameLength; i++) charCounts.push(i);
      const nameCandidates = generateCandidates(reading, charCounts);

      const scoreForSurname = (surnameStrokes: number[]): ScoredCandidate[] => {
        return nameCandidates.map(name => {
          const grids = calculateFiveGrids(surnameStrokes, name.charStrokes);
          const score = calculateScore(grids);
          return { name, grids, score };
        });
      };

      setCandidatesA(scoreForSurname(surnameAStrokes));
      setCandidatesB(scoreForSurname(surnameBStrokes));
      setHasResults(true);
    });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <InputSection
          surnameA={surnameA}
          surnameB={surnameB}
          reading={reading}
          nameLength={nameLength}
          onSurnameAChange={v => { setSurnameA(v); setSurnameAError(""); }}
          onSurnameBChange={v => { setSurnameB(v); setSurnameBError(""); }}
          onReadingChange={v => { setReading(v); setReadingError(""); }}
          onNameLengthChange={setNameLength}
          onSubmit={handleSubmit}
          surnameAError={surnameAError}
          surnameBError={surnameBError}
          readingError={readingError}
        />

        {isPending && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-r-transparent" />
            <p className="text-gray-500 mt-2">候補を生成中...</p>
          </div>
        )}

        {hasResults && !isPending && (
          <ResultsContainer
            surnameA={surnameA}
            surnameB={surnameB}
            candidatesA={candidatesA}
            candidatesB={candidatesB}
          />
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        <p>※ 姓名判断は熊崎式を参考にしています。結果は参考程度にご利用ください。</p>
      </footer>
    </div>
  );
}

export default App;
