export interface KanjiEntry {
  char: string;
  readings: string[];
  strokes: number;
}

export interface NameCandidate {
  kanji: string;
  reading: string;
  charStrokes: number[];
  totalStrokes: number;
}

export type FortuneLevel =
  | "最大吉"
  | "大吉"
  | "吉"
  | "凶"
  | "大凶"
  | "最大凶";

export interface GridDetail {
  strokes: number;
  fortune: FortuneLevel;
  name: string;
}

export interface FiveGridResult {
  tenkaku: GridDetail;
  jinkaku: GridDetail;
  chikaku: GridDetail;
  gaikaku: GridDetail;
  soukaku: GridDetail;
}

export interface ScoredCandidate {
  name: NameCandidate;
  grids: FiveGridResult;
  score: number;
}
