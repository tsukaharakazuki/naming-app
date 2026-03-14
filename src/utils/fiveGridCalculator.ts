import type { FiveGridResult, GridDetail } from "../types";
import { lookupFortune, lookupFortuneName } from "./fortuneTable";

function makeGrid(strokes: number): GridDetail {
  return {
    strokes,
    fortune: lookupFortune(strokes),
    name: lookupFortuneName(strokes),
  };
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

export function calculateFiveGrids(
  surnameStrokes: number[],
  nameStrokes: number[],
): FiveGridResult {
  const surnameTotal = sum(surnameStrokes);
  const nameTotal = sum(nameStrokes);

  const surnameFirst = surnameStrokes[0];
  const surnameLast = surnameStrokes[surnameStrokes.length - 1];
  const nameFirst = nameStrokes[0];
  const nameLast = nameStrokes[nameStrokes.length - 1];

  const tenkaku = surnameTotal;
  const jinkaku = surnameLast + nameFirst;
  // 一文字名の場合、霊数(1)を加算
  const chikaku = nameStrokes.length === 1 ? nameTotal + 1 : nameTotal;
  const soukaku = surnameTotal + nameTotal;

  let gaikaku: number;
  if (surnameStrokes.length === 1 && nameStrokes.length === 1) {
    gaikaku = 2;
  } else if (surnameStrokes.length === 1) {
    gaikaku = 1 + nameLast;
  } else if (nameStrokes.length === 1) {
    gaikaku = surnameFirst + 1;
  } else {
    gaikaku = surnameFirst + nameLast;
  }

  return {
    tenkaku: makeGrid(tenkaku),
    jinkaku: makeGrid(jinkaku),
    chikaku: makeGrid(chikaku),
    gaikaku: makeGrid(gaikaku),
    soukaku: makeGrid(soukaku),
  };
}
