import { isNullish } from './helpers';

/**
 * The modulo function. Equivalent to
 *   `let a = n % m;
 *    if (a < 0) a += m;`
 * @param {Number} n Dividend.
 * @param {Number} m Divisor.
 * @return {Number} Signed remainder.
 */
export const mod = (n: number, m: number): number => {
  return ((n % m) + m) % m;
};

// export function randInt(max: number): number
// /**
//  * Generate a random integer between [min, max). If only first argument `min` is
//  * given, generate a integer between [0, min)
//  */
// export function randInt(min: number, max: number): number
/**
 * Generate a random integer between [0,max].
 */
export const randInt = (max: number) => {
  // if (isNullish(max)) {
  //   max = min;
  //   min = 0;
  // }
  // return Math.floor(Math.random() * (max!-min+1) + min);
  return Math.trunc(Math.random() * (max+1));
};

/**
 * Check whether two floating number is the same.
 */
export const isSameFloat = (num1: number, num2: number): boolean =>
  Math.abs(num1 - num2) < Number.EPSILON;


/**
 * Count the length of decimals.
 */
export const countDecimals = (num: number)  => { // Twice faster
  if (Math.floor(num) === num) return 0;
  let str = Math.abs(num).toString();
  let counts = 0;
  if (str.indexOf('-') !== -1) {
    counts = +str.split('-')[1];
    str = str.split('e')[0];
  }
  return counts + (str.split('.')[1]?.length || 0);
};
// export const countDecimals = (num: number)  => { // reduce about 8 character
//   if (Math.floor(num) === num) return 0;
//   const str = Math.abs(num).toExponential().split('e');
//   const counts = (str[1].startsWith('-') ? 1 : -1) * +str[1].slice(1);
//   return counts + (str[0].split('.')[1]?.length || 0);
// };

/**
 * Rounding a number to specifit place value.
 * @param num A number.
 * @param place Rounding to specific place value. Positive means decimal places
 * and negative means whole number places.
 * @default 0
 * @return Percentage number.
 */
export const round = (num: number, place: number = 0): number =>
  Math.round(10**(place) * num) / 10**(place);

/**
 * Convert a number `num` to percentage form, that is, `num * 100%`.
 * @param num A number.
 * @param place Rounding to specific place value. Positive means decimal places
 * and negative means whole number places.
 * @return Percentage number.
 */
export const toPercent = (num: number, place: number = 0): number => {
  return round(100 * num, place);
};

/**
 * Clip the number in the range [`min`, `max`].
 * @param num A number to clip.
 * @param min Minimum value.
 * @param max maximum value.
 * @returns Clipped number.
 */
export const clip = (num: number, min?: number, max?: number): number => {
  // +undifined = NaN. The comparison always get false
  if (num < +min!) num = min!; // max < min return min
  else if (num > +max!) num = max!;
  return num;
};

/**
 * Linear mapping a number from a range to another range.
 * @param val The value that be transform.
 * @param min Minimum of original range.
 * @param max Maximum of original range.
 * @param newMin Minimum of new range.
 * @param newMax Maximum of new range.
 * @param place Rounding to specific place value. Positive means decimal places
 * and negative means whole number places.
 */
export const rangeMapping = (
  val: number,
  min: number,
  max: number,
  newMin: number,
  newMax: number,
  place?: number,
) => {
  const ratio = clip((val - min) / (max - min), 0, 1); // avoid floating problem.
  const newVal = newMin + ratio * (newMax - newMin);
  return isNullish(place) ? newVal : round(newVal, place);
};

/** Degree to radian. */
export const deg2rad = (deg: number) => {
  return deg / 180 * Math.PI;
};
/** Radian to degree. */
export const rad2deg = (deg: number) => {
  return deg / Math.PI * 180;
};

/** A variant of Math.atan2 function. Return degree instead of radian. */
export const atan2Deg = (y: number, x: number) =>
  mod(rad2deg(Math.atan2(y,x)), 360);

/** Polar coordinate to Cartesian coordinate */
export const cartesian2polar = (y: number, x: number, place?: number) => {
  let deg = atan2Deg(y, x),
    radius = Math.sqrt(x**2 + y**2);
  if (!isNullish(place)) {
    deg = round(deg, place);
    radius = round(radius, place);
  }
  return { deg, radius };
};

/** Polar coordinate to Cartesian coordinate */
export const polar2cartesian = (r: number, deg: number, place?: number) => {
  let x = r * Math.cos(deg2rad(deg)),
    y = r * Math.sin(deg2rad(deg));
  if (!isNullish(place)) {
    x = round(x, place);
    y = round(y, place);
  }
  return { x, y };
};

/**
 * Dot product of two arrays.
 */
export const dot = (arr1: readonly number[], arr2: readonly number[]): number => {
  return arr1.reduce((prev, val, i) => prev + val * arr2[i], 0);
};

/**
 * Sum of items of an array.
 */
export const sum = (arr: readonly number[]) =>
  arr.reduce((prev, val) => prev + val, 0);

/**
 * L2-distance (not take square root yet) of two array.
 */
export const l2Dist = (arr1: number[], arr2: number[]) => {
  return arr1.reduce((prev, val, i) => prev + (val - arr2[i])**2, 0);
};

/**
 * Evaluate elementwise mean of two arrays.
 * @param arr1 Numeric of a color.
 * @param arr2 Numeric of a color.
 * @returns The mean value of color1 and color2.
 */
export const elementwiseMean = (arr1: number[], arr2: number[]): number[] => {
  const newColor = [];
  for (let i = 0; i < arr1.length; i++) {
    newColor[i] = 0.5 * (arr1[i] + arr2[i]);
  }
  return newColor;
};

