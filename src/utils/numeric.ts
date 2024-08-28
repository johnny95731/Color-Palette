
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

/**
 * Convert a number `val` to percentage form, that is, `val*100%`.
 * @param num A number.
 * @param digits Digit of output number.
 * @return Percentage number.
 */
export const round = (num: number, digits: number = 0): number =>
  digits ? Math.round(10**(digits) * num) / 10**(digits) : Math.round(num);

/**
 * Convert a number `val` to percentage form, that is, `val*100%`.
 * @param num A number.
 * @param digits Digit of output number.
 * @return Percentage number.
 */
export const toPercent = (num: number, digits: number = 0): number => {
  return round(100 * num, digits);
};

/**
 * Clip the number in the range [`min`, `max`].
 * @param num A number to clip.
 * @param min Minimum value.
 * @param max maximum value.
 * @returns Clipped number.
 */
export const clip = (num: number, min?: number, max?: number): number => {
  if (max !== undefined && num > max) num = max;
  if (min !== undefined && num < min) num = min; // max < min also return min
  return num;
};

/**
 * Linear mapping a number from a range to another range.
 * @param val The value that be transform.
 * @param min Minimum of original range.
 * @param max Maximum of original range.
 * @param newMin Minimum of new range.
 * @param newMax Maximum of new range.
 */
export const rangeMapping = (
  val: number, min: number, max: number,
  newMin: number, newMax: number,
) => {
  const ratio = clip((val - min) / (max - min), 0, 1);
  return newMin + ratio * (newMax - newMin);
};

/**
 * Dot product of two arrays.
 */
export const dot = (a: readonly number[], b: readonly number[]): number => {
  return a.reduce((prev, val, i) => prev + val * b[i], 0);
};
