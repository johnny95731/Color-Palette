import { map } from '../helpers';
import { deg2rad, l2DistSq, mod } from '../numeric';
import { hex2lab, hex2rgb, lab2lch, rgb2gray } from '../colors';


// # Constants
/**
 * Actions for sorting palette colors.
 */
export const SORTING_ACTIONS = [
  'luminance', 'random', 'inversion', 'CIE76', 'CIE94', 'CIEDE2000'
] as const;
export type SortActions = typeof SORTING_ACTIONS[number];


// # Distance functions.
const distLuminance = (hex1: string, hex2: string) => {
  return Math.abs(rgb2gray(hex2rgb(hex1)) - rgb2gray(hex2rgb(hex2)));
};

/**
 * Color difference of two hex colors with CIE 1976 formula.
 */
const distE76 = (hex1: string, hex2: string) => {
  const lab1 = hex2lab(hex1);
  const lab2 = hex2lab(hex2);
  return l2DistSq(lab1, lab2);
};

/**
 * Color difference of two hex colors with CIE 1994 formula.
 * Note that CIE 1976 formula is "not" symmetry, that is, `diffE94(hex1, hex2)`
 * and `diffE94(hex2, hex1)` may be different.
 * @param hex1 Hex color 1
 * @param hex2 Hex color 2
 * @returns
 */
const distE94 = (hex1: string, hex2: string) => {
  const [l1, a1, b1] = hex2lab(hex1);
  const [l2, a2, b2] = hex2lab(hex2);

  const c1Star = Math.sqrt(a1**2 + b1**2);
  const c2Star = Math.sqrt(a2**2 + b2**2);
  const deltaA = a1 - a2;
  const deltaB = b1 - b2;

  const deltaL = l1 - l2;
  const deltaC = c1Star - c2Star;
  // May be NaN. Due to floating problem.
  const deltaH = Math.sqrt(deltaA**2 + deltaB**2 - deltaC**2) || 0;

  return Math.sqrt(
    deltaL**2 +
    (deltaC / (1 + 0.045 * c1Star))**2 +
    (deltaH / (1 + 0.015 * c1Star))**2
  );
};

/**
 * Color difference of two hex colors with CIEDE2000 formula.
 * @param hex1 Hex color 1
 * @param hex2 Hex color 2
 */
const distE00 = (hex1: string, hex2: string) => {
  const [l1, a1, b1] = hex2lab(hex1);
  const [l2, a2, b2] = hex2lab(hex2);
  const c1 = Math.sqrt(a1**2 + b1**2);
  const c2 = Math.sqrt(a2**2 + b2**2);

  const lMeanM50 = ((l1 + l2) / 2 - 50)**2;

  const cMeanPow7 = ((c1 + c2) / 2)**7;
  const aconst = (1 - Math.sqrt(cMeanPow7 / (cMeanPow7 + 25**7)));
  // 'P' for prime.
  const a1P = a1 + a1 / 2 * aconst;
  const a2P = a2 + a2 / 2 * aconst;
  const [c1P, h1P] = lab2lch([l1, a1P, b1]);
  const [c2P, h2P] = lab2lch([l2, a2P, b2]);

  const cMeanP = (c1P + c2P) / 2;
  const hDist = Math.abs(h1P - h2P);

  const hasBlack = !c1P || !c2P;
  let hP = mod(h2P - h1P, 360);
  if (hasBlack) hP = 0;
  else if (hDist > 180) hP += 360;

  let hMeanP = (h1P + h2P) / 2;
  if (hasBlack) hMeanP = h1P + h2P;
  else if (hDist > 180 && hMeanP < 180) hMeanP += 180;
  else if (hDist > 180 && hMeanP >= 180) hMeanP -= 180;

  // # Delta L
  const deltaL = l2 - l1;
  // # Delta C
  const deltaC = c2P - c1P;
  // # Delta H
  const deltaH = 2 * Math.sqrt(c1P*c2P) * Math.sin(deg2rad(hP / 2));
  // # Coefficients
  const T = 1
    - 0.17 * Math.cos(deg2rad(    hMeanP - 30))
    + 0.24 * Math.cos(deg2rad(2 * hMeanP))
    + 0.32 * Math.cos(deg2rad(3 * hMeanP + 6))
    - 0.2  * Math.cos(deg2rad(4 * hMeanP - 63));
  const SL = 1 + 0.015 * lMeanM50 / Math.sqrt(20 + lMeanM50);
  const SC = 1 + 0.045 * cMeanP;
  const SH = 1 + 0.015 * cMeanP * T;
  const RT = -2 *
    Math.sqrt(cMeanP**7 / (cMeanP**7 + 25**7)) *
    Math.sin(deg2rad(60 * Math.exp(-1 * (hMeanP/25 - 11)**2)));

  return Math.sqrt(
    (deltaL / SL)**2 +
    (deltaC / SC)**2 +
    (deltaH / SH)**2 +
    RT * deltaC / SC * deltaH / SH
  );
};


// # Getters
export const getDistOp = (
  method: SortActions
): ((hex1: string, hex2: string) => number) => {
  if (method === SORTING_ACTIONS[0]) return distLuminance;
  if (method === SORTING_ACTIONS[3]) return distE76;
  if (method === SORTING_ACTIONS[4]) return distE94;
  if (method === SORTING_ACTIONS[5]) return distE00;
  return distE00;
};


// Sorting
/**
 * Travelling salesman problem by greedy algorithm.
 * @param arr Array of points.
 * @param dist Distance function.
 * @param initPoint Initial point. If the element point
 */
export const tspGreedy = <key extends keyof T, T extends object>(
  arr: T[],
  dist: (a: {[k in key]: T[key]}, b: {[k in key]: T[key]}) => number,
  initPoint: {[k in key]: T[key]},
): T[] => {
  const result: T[] = [];
  // remaining indices
  const indices = map(arr, (_, i) => i);

  // @ts-expect-error initPoint will not be add to result array.
  let pivot: T = initPoint;
  let temp: number;
  let min: number;
  let minIdx: number;
  while (indices.length) {
    min = Infinity;
    minIdx = 0;
    for (let k = 0; k < indices.length; k++) {
      temp = dist(pivot, arr[indices[k]]);
      if (temp < min) {
        min = temp;
        minIdx = k;
      }
    }
    pivot = arr[indices[minIdx]];
    indices.splice(minIdx, 1);
    result.push(pivot);
  }
  return JSON.parse(JSON.stringify(result));
};
