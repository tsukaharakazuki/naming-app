import { useState, useTransition } from "react";
import type { NameCandidate, ScoredCandidate } from "./types";
import { generateCandidates, generateAtejiCandidates } from "./utils/candidateGenerator";
import { calculateFiveGrids } from "./utils/fiveGridCalculator";
import { calculateScore } from "./utils/scoring";
import { getSurnameStrokes, getStrokeCount } from "./data/kanjiStrokes";
import { AVOID_KANJI } from "./data/avoidKanji";
import Header from "./components/Header";
import InputSection from "./components/InputSection";
import ResultsContainer from "./components/ResultsContainer";
import ComparisonPanel from "./components/ComparisonPanel";
import KanjiDiagnosticView from "./components/KanjiDiagnosticView";

const kanjiRegex = /^[\u4e00-\u9faf\u3400-\u4dbf]+$/;
const kanjiCharRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/g;
const hiraganaRegex = /^[\u3040-\u309f]+$/;

type InputMode = "hiragana" | "exact" | "ateji";

function App() {
  const [surnameA, setSurnameA] = useState("");
  const [surnameB, setSurnameB] = useState("");
  const [reading, setReading] = useState("");
  const [kanjiInput, setKanjiInput] = useState("");
  const [nameLength, setNameLength] = useState(2);
  const [inputMode, setInputMode] = useState<InputMode>("hiragana");
  const [desiredKanji, setDesiredKanji] = useState("");
  const [excludedKanji, setExcludedKanji] = useState("");
  const [avoidKanjiEnabled, setAvoidKanjiEnabled] = useState(true);

  const [surnameAError, setSurnameAError] = useState("");
  const [surnameBError, setSurnameBError] = useState("");
  const [nameError, setNameError] = useState("");

  const [candidatesA, setCandidatesA] = useState<ScoredCandidate[]>([]);
  const [candidatesB, setCandidatesB] = useState<ScoredCandidate[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());

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

    if (inputMode === "hiragana" || inputMode === "ateji") {
      if (!reading || !hiraganaRegex.test(reading)) {
        setNameError("ひらがなで入力してください");
        ok = false;
      } else {
        setNameError("");
      }
    } else {
      // exact mode: just check non-empty
      if (!kanjiInput.trim()) {
        setNameError("名前を入力してください");
        ok = false;
      } else {
        setNameError("");
      }
    }

    return ok;
  }

  function handleSubmit() {
    if (!validate()) return;

    setSelectedNames(new Set());

    startTransition(() => {
      const surnameAStrokes = getSurnameStrokes(surnameA)!;
      const surnameBStrokes = getSurnameStrokes(surnameB)!;

      if (inputMode === "hiragana" || inputMode === "ateji") {
        const charCounts = Array.from({ length: nameLength }, (_, i) => i + 1);

        // Parse desired kanji filter
        const desiredChars = new Set(desiredKanji.trim() ? (desiredKanji.match(kanjiCharRegex) ?? []) : []);

        let nameCandidates: NameCandidate[];
        if (inputMode === "ateji") {
          nameCandidates = generateAtejiCandidates(reading, charCounts, desiredChars.size > 0 ? desiredChars : undefined);
        } else {
          nameCandidates = generateCandidates(reading, charCounts);
        }

        // Filter by desired kanji (for hiragana mode, post-filter)
        if (inputMode === "hiragana" && desiredChars.size > 0) {
          nameCandidates = nameCandidates.filter(candidate =>
            [...candidate.kanji].some(ch => desiredChars.has(ch))
          );
        }

        // Filter out excluded kanji (manual + avoid list)
        const excludedChars = new Set(excludedKanji.match(kanjiCharRegex) ?? []);
        if (avoidKanjiEnabled) {
          for (const ch of AVOID_KANJI) excludedChars.add(ch);
        }
        if (excludedChars.size > 0) {
          nameCandidates = nameCandidates.filter(candidate =>
            ![...candidate.kanji].some(ch => excludedChars.has(ch))
          );
        }

        const scoreForSurname = (surnameStrokes: number[]): ScoredCandidate[] => {
          return nameCandidates.map(name => {
            const grids = calculateFiveGrids(surnameStrokes, name.charStrokes);
            const score = calculateScore(grids);
            return { name, grids, score };
          });
        };

        setCandidatesA(scoreForSurname(surnameAStrokes));
        setCandidatesB(scoreForSurname(surnameBStrokes));
      } else {
        // Exact mode: single diagnostic only
        const chars = [...kanjiInput];
        const strokesArr = chars.map(c => getStrokeCount(c));
        if (strokesArr.some(s => s === null)) {
          setNameError("画数が取得できない文字が含まれています");
          return;
        }
        const singleCandidate: NameCandidate = {
          kanji: kanjiInput,
          reading: "",
          charStrokes: strokesArr as number[],
          totalStrokes: (strokesArr as number[]).reduce((a, b) => a + b, 0),
        };

        const gridsA = calculateFiveGrids(surnameAStrokes, singleCandidate.charStrokes);
        const gridsB = calculateFiveGrids(surnameBStrokes, singleCandidate.charStrokes);
        setCandidatesA([{ name: singleCandidate, grids: gridsA, score: calculateScore(gridsA) }]);
        setCandidatesB([{ name: singleCandidate, grids: gridsB, score: calculateScore(gridsB) }]);
      }

      setHasResults(true);
    });
  }

  function handleToggleSelect(kanji: string) {
    setSelectedNames(prev => {
      const next = new Set(prev);
      if (next.has(kanji)) next.delete(kanji);
      else next.add(kanji);
      return next;
    });
  }

  function handleRemoveName(kanji: string) {
    setSelectedNames(prev => {
      const next = new Set(prev);
      next.delete(kanji);
      return next;
    });
  }

  const showCandidateList = inputMode === "hiragana" || inputMode === "ateji";

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
          desiredKanji={desiredKanji}
          excludedKanji={excludedKanji}
          avoidKanjiEnabled={avoidKanjiEnabled}
          onSurnameAChange={v => { setSurnameA(v); setSurnameAError(""); }}
          onSurnameBChange={v => { setSurnameB(v); setSurnameBError(""); }}
          onReadingChange={v => { setReading(v); setNameError(""); }}
          onKanjiInputChange={v => { setKanjiInput(v); setNameError(""); }}
          onDesiredKanjiChange={v => setDesiredKanji(v)}
          onExcludedKanjiChange={v => setExcludedKanji(v)}
          onAvoidKanjiEnabledChange={v => setAvoidKanjiEnabled(v)}
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

        {hasResults && !isPending && showCandidateList && (
          <>
            <ResultsContainer
              surnameA={surnameA}
              surnameB={surnameB}
              candidatesA={candidatesA}
              candidatesB={candidatesB}
              selectedNames={selectedNames}
              onToggleSelect={handleToggleSelect}
            />
            {selectedNames.size > 0 && (
              <ComparisonPanel
                surnameA={surnameA}
                surnameB={surnameB}
                candidatesA={candidatesA}
                candidatesB={candidatesB}
                selectedNames={selectedNames}
                onRemoveName={handleRemoveName}
              />
            )}
          </>
        )}

        {hasResults && !isPending && inputMode === "exact" && (
          <KanjiDiagnosticView
            surnameA={surnameA}
            surnameB={surnameB}
            candidateA={candidatesA[0]}
            candidateB={candidatesB[0]}
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
