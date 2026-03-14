import type { KanjiEntry, NameCandidate } from "../types";
import { kanjiDatabase } from "../data/kanjiDatabase";

let readingIndex: Map<string, KanjiEntry[]> | null = null;

function getReadingIndex(): Map<string, KanjiEntry[]> {
  if (readingIndex) return readingIndex;
  readingIndex = new Map();
  for (const entry of kanjiDatabase) {
    for (const reading of entry.readings) {
      const existing = readingIndex.get(reading);
      if (existing) {
        existing.push(entry);
      } else {
        readingIndex.set(reading, [entry]);
      }
    }
  }
  return readingIndex;
}

function partitionReading(reading: string, count: number): string[][] {
  if (count === 1) return [[reading]];
  if (count === 2) {
    const results: string[][] = [];
    for (let i = 1; i < reading.length; i++) {
      results.push([reading.slice(0, i), reading.slice(i)]);
    }
    return results;
  }
  const results: string[][] = [];
  for (let i = 1; i < reading.length - 1; i++) {
    for (let j = i + 1; j < reading.length; j++) {
      results.push([reading.slice(0, i), reading.slice(i, j), reading.slice(j)]);
    }
  }
  return results;
}

function cartesianProduct(arrays: KanjiEntry[][]): KanjiEntry[][] {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);
  const result: KanjiEntry[][] = [];
  for (const item of first) {
    for (const combo of restProduct) {
      result.push([item, ...combo]);
      if (result.length > 5000) return result;
    }
  }
  return result;
}

export function generateCandidates(
  reading: string,
  charCounts: number[],
): NameCandidate[] {
  const index = getReadingIndex();
  const candidates: NameCandidate[] = [];
  const seen = new Set<string>();

  for (const charCount of charCounts) {
    if (charCount > reading.length) continue;
    const partitions = partitionReading(reading, charCount);

    for (const segments of partitions) {
      const kanjiOptions = segments.map(seg => index.get(seg) ?? []);
      if (kanjiOptions.some(opts => opts.length === 0)) continue;

      const combos = cartesianProduct(kanjiOptions);
      for (const combo of combos) {
        const kanji = combo.map(e => e.char).join("");
        if (seen.has(kanji)) continue;
        seen.add(kanji);

        candidates.push({
          kanji,
          reading,
          charStrokes: combo.map(e => e.strokes),
          totalStrokes: combo.reduce((sum, e) => sum + e.strokes, 0),
        });

        if (candidates.length >= 5000) return candidates;
      }
    }
  }

  return candidates;
}

// --- 当て字モード ---

let prefixIndex: Map<string, KanjiEntry[]> | null = null;

function getPrefixIndex(): Map<string, KanjiEntry[]> {
  if (prefixIndex) return prefixIndex;
  prefixIndex = new Map();
  for (const entry of kanjiDatabase) {
    const added = new Set<string>();
    for (const reading of entry.readings) {
      const firstChar = reading[0];
      if (added.has(firstChar)) continue;
      added.add(firstChar);
      const existing = prefixIndex.get(firstChar);
      if (existing) {
        existing.push(entry);
      } else {
        prefixIndex.set(firstChar, [entry]);
      }
    }
  }
  return prefixIndex;
}

function findAtejiKanji(segment: string): KanjiEntry[] {
  const idx = getPrefixIndex();
  const firstChar = segment[0];
  const candidates = idx.get(firstChar) ?? [];
  if (segment.length === 1) return candidates;
  return candidates.filter(entry =>
    entry.readings.some(r => r.startsWith(segment))
  );
}

export function generateAtejiCandidates(
  reading: string,
  charCounts: number[],
): NameCandidate[] {
  const candidates: NameCandidate[] = [];
  const seen = new Set<string>();

  for (const charCount of charCounts) {
    if (charCount > reading.length) continue;
    const partitions = partitionReading(reading, charCount);

    for (const segments of partitions) {
      const kanjiOptions = segments.map(seg => findAtejiKanji(seg));
      if (kanjiOptions.some(opts => opts.length === 0)) continue;

      const combos = cartesianProduct(kanjiOptions);
      for (const combo of combos) {
        const kanji = combo.map(e => e.char).join("");
        if (seen.has(kanji)) continue;
        seen.add(kanji);

        candidates.push({
          kanji,
          reading,
          charStrokes: combo.map(e => e.strokes),
          totalStrokes: combo.reduce((sum, e) => sum + e.strokes, 0),
        });

        if (candidates.length >= 5000) return candidates;
      }
    }
  }

  return candidates;
}
