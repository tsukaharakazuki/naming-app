import { useState, useTransition } from "react";
import type { ScoredCandidate } from "./types";
import { generateCandidates } from "./utils/candidateGenerator";
import { generateKanjiVariants } from "./utils/kanjiVariantGenerator";
import { calculateFiveGrids } from "./utils/fiveGridCalculator";
import { calculateScore } from "./utils/scoring";
import { getSurnameStrokes } from "./data/kanjiStrokes";
import Header from "./components/Header";
import InputSection from "./components/InputSection";
import ResultsContainer from "./components/ResultsContainer";

const kanjiRegex = /^[\u4e00-\u9faf\u3400-\u4dbf]+$/;
const hiraganaRegex = /^[\u3040-\u309f]+$/;

function App() {
  const [surnameA, setSurnameA] = useState("");
  const [surnameB, setSurnameB] = useState("");
  const [reading, setReading] = useState("");
  const [kanjiInput, setKanjiInput] = useState("");
  const [nameLength, setNameLength] = useState(2);
  const [inputMode, setInputMode] = useState<"hiragana" | "kanji">("hiragana");

  const [surnameAError, setSurnameAError] = useState("");
  const [surnameBError, setSurnameBError] = useState("");
  const [nameError, setNameError] = useState("");

  const [candidatesA, setCandidatesA] = useState<ScoredCandidate[]>([]);
  const [candidatesB, setCandidatesB] = useState<ScoredCandidate[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [isPending, startTransition] = useTransition();

  function validate(): boolean {
    let ok = true;

    if (!surnameA || !kanjiRegex.test(surnameA)) {
      setSurnameAError("漢字で入力してください");
      ok = false;
    } else if (!getSurnameStrokes(surnameA)) {
      setSurnameAError("画数が取得できない漢字が含まれています");
      ok = false;
    } else {
      setSurnameAError("");
    }

    if (!surnameB || !kanjiRegex.test(surnameB)) {
      setSurnameBError("漢字で入力してください");
      ok = false;
    } else if (!getSurnameStrokes(surnameB)) {
      setSurnameBError("画数が取得できない漢字が含まれています");
      ok = false;
    } else {
      setSurnameBError("");
    }

    if (inputMode === "hiragana") {
      if (!reading || !hiraganaRegex.test(reading)) {
        setNameError("ひらがなで入力してください");
        ok = false;
      } else {
        setNameError("");
      }
    } else {
      if (!kanjiInput || !kanjiRegex.test(kanjiInput)) {
        setNameError("漢字で入力してください");
        ok = false;
      } else {
        setNameError("");
      }
    }

    return ok;
  }

  function handleSubmit() {
    if (!validate()) return;

    startTransition(() => {
      const surnameAStrokes = getSurnameStrokes(surnameA)!;
      const surnameBStrokes = getSurnameStrokes(surnameB)!;

      const nameCandidates = inputMode === "hiragana"
        ? generateCandidates(reading, Array.from({ length: nameLength }, (_, i) => i + 1))
        : generateKanjiVariants(kanjiInput);

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
    <div className="min-h-screen bg-orange-50/30">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <InputSection
          surnameA={surnameA}
          surnameB={surnameB}
          reading={reading}
          kanjiInput={kanjiInput}
          nameLength={nameLength}
          inputMode={inputMode}
          onSurnameAChange={v => { setSurnameA(v); setSurnameAError(""); }}
          onSurnameBChange={v => { setSurnameB(v); setSurnameBError(""); }}
          onReadingChange={v => { setReading(v); setNameError(""); }}
          onKanjiInputChange={v => { setKanjiInput(v); setNameError(""); }}
          onNameLengthChange={setNameLength}
          onInputModeChange={setInputMode}
          onSubmit={handleSubmit}
          surnameAError={surnameAError}
          surnameBError={surnameBError}
          nameError={nameError}
        />

        {isPending && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-r-transparent" />
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
