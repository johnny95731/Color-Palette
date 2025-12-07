import { deg2rad, rad2deg, round } from '@johnny95731/color-utils';

import { isNullish } from './helpers';


/**
 * The modulo function. Equivalent to
 *   `let a = n % m;
 *    if (a < 0) a += m;`
 * @param n Dividend.
 * @param m Divisor.
 * @return Signed remainder.
 */
export const mod = (n: number, m: number): number => {
  return ((n % m) + m) % m;
};

/**
 * Check whether two floating number is the same.
 */
export const isSameFloat = (num1: number, num2: number): boolean =>
  Math.abs(num1 - num2) < Number.EPSILON;

/**
 * Count the length of decimals.
 */
export const countDecimals = (num: number) => {
  if (Math.floor(num) === num) return 0;
  let str = Math.abs(num).toString();
  let counts = 0;
  if (str.indexOf('-') !== -1) {
    counts = +str.split('-')[1];
    str = str.split('e')[0];
  }
  return counts + (str.split('.')[1]?.length || 0);
};

/**
 * Convert a number `num` to percentage form, that is, `num * 100%`.
 * @param num A number.
 * @param place Default: `0`. Rounding to specific place value. Positive means decimal places
 * and negative means whole number places.
 * @return Percentage number.
 */
export const toPercent = (num: number, place: number = 0): number => {
  return round(100 * num, place);
};

/**
 * Fraction to percentage.
 * Return round(100 * idx / num, 2)%
 * @param num Numerator.
 * @param denom Denominator.
 * @returns
 */
export const frac2percentage = (num: number, denom: number): string => {
  return toPercent(num / denom, 2) + '%';
};

/** A variant of Math.atan2 function. Return degree instead of radian. */
export const atan2Deg = (y: number, x: number) => {
  // short: (rad2deg(Math.atan2(y,x)) + 360) % 360;
  const deg = rad2deg(Math.atan2(y, x));
  return deg < 0 ? deg + 360 : deg;
};

/** Polar coordinate to Cartesian coordinate */
export const cartesian2polar = (y: number, x: number, place?: number) => {
  let deg = atan2Deg(y, x),
    radius = Math.sqrt(x * x + y * y);
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
