import type { NameCandidate } from "../types";
import { kanjiDatabase } from "../data/kanjiDatabase";
import { getStrokeCount } from "../data/kanjiStrokes";

/**
 * 漢字入力モード: 入力された漢字名をそのまま候補にしつつ、
 * 使われている各漢字と同じ画数 or 同じ読みの漢字で代替候補を生成
 */
export function generateKanjiVariants(kanjiName: string): NameCandidate[] {
  const chars = [...kanjiName];
  const candidates: NameCandidate[] = [];
  const seen = new Set<string>();

  // 入力された漢字そのものを最初の候補に
  const inputStrokes = chars.map(c => getStrokeCount(c));
  if (inputStrokes.every(s => s !== null)) {
    const original: NameCandidate = {
      kanji: kanjiName,
      reading: "",
      charStrokes: inputStrokes as number[],
      totalStrokes: (inputStrokes as number[]).reduce((a, b) => a + b, 0),
    };
    candidates.push(original);
    seen.add(kanjiName);
  }

  // 各文字位置ごとに、同じ読みを持つ漢字で置き換えた候補を生成
  // まず入力漢字の読みを特定
  const charReadings = chars.map(c => {
    const entry = kanjiDatabase.find(e => e.char === c);
    return entry ? entry.readings : [];
  });

  // 各文字位置で代替漢字を収集
  const alternatives: Array<Array<{ char: string; strokes: number }>> = chars.map((c, idx) => {
    const alts: Array<{ char: string; strokes: number }> = [];
    const readings = charReadings[idx];
    if (readings.length === 0) return alts;

    for (const entry of kanjiDatabase) {
      if (entry.char === c) continue;
      if (entry.readings.some(r => readings.includes(r))) {
        alts.push({ char: entry.char, strokes: entry.strokes });
      }
    }
    return alts;
  });

  // 1文字ずつ入れ替えた候補を生成（全組み合わせは多すぎるので1文字変更のみ）
  for (let pos = 0; pos < chars.length; pos++) {
    for (const alt of alternatives[pos]) {
      const newChars = [...chars];
      newChars[pos] = alt.char;
      const newKanji = newChars.join("");
      if (seen.has(newKanji)) continue;
      seen.add(newKanji);

      const strokes = newChars.map(c => {
        if (c === alt.char) return alt.strokes;
        return getStrokeCount(c);
      });
      if (strokes.some(s => s === null)) continue;

      candidates.push({
        kanji: newKanji,
        reading: "",
        charStrokes: strokes as number[],
        totalStrokes: (strokes as number[]).reduce((a, b) => a + b, 0),
      });

      if (candidates.length >= 3000) return candidates;
    }
  }

  return candidates;
}
