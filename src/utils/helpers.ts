import { unref } from 'vue';
import { randInt, toPercent } from './numeric';
import type { MaybeRef, Ref, WritableComputedRef } from 'vue';


// ### Object helpers
export const objPick = <T extends object, K extends (string | number | symbol)>(
  obj: T,
  keys: K[]
) => (
  Object.fromEntries(
    map(
      keys,
      (key) => {
        return [key, obj[key as unknown as keyof T]];
      }
    ),
  ) as {[key in K]: key extends keyof T ? T[key] : undefined}
  );

/**
 * Simple way to deep copy entire object.
 */
export const copyObj = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Shuffle an array by Fisher-Yates shuffle. The process will change the input
 * array.
 */
export const shuffle = <T>(arr: T[]): T[] => {
  let j: number;
  for (let i = arr.length - 1; i > 0; i--) {
    j = randInt(i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};


type map = {
  /**
   * Generate an array with specific length.
   *
   * Faster than Array.prototype.map about 10%-22% on Edge and 7%-15% on Firefox.
   */
  <R>(
    len: number,
    callback: (val: null, i: number) => R
  ): R[];
  /**
   * Similar to Array.prototype.map but more generalize.
   * But with an argument to restrict the length of returned array.
   *
   * Faster than Array.prototype.map about 10%-22% on Edge and 7%-15% on Firefox.
   */
  <R, T>(
    arr: readonly T[],
    callback: (val: T, i: number) => R,
    len?: number,
  ): R[]
}
export const map: map = <R, T>(
  arr: number | readonly T[],
  callback:
    typeof arr extends number ?
      ((val: null, i: number) => R) :
      ((val: T, i: number) => R),
  len?: number,
): R[] => {
  const result = [];
  if (typeof arr === 'number') {
    len = arr;
    for (let i = 0; i < len; i++) {
      // @ts-expect-error
      result.push(callback(null, i));
    }
  } else {
    len ??= arr.length;
    for (let i = 0; i < len; i++) {
      result.push(callback(arr[i], i));
    }
  }
  return result;
};

type forLoop = {
  <R>(
    len: number,
    callback: (acc: R, val: null, i: number) => R,
    init?: R,
    _?: number
  ): R;
  <R, T extends string>(
    arr: T,
    callback: (acc: R, val: T, i: number) => R,
    init?: R,
    len?: number,
  ): R;
  <R, T>(
    arr: readonly T[],
    callback: (acc: R, val: T, i: number) => R,
    init?: R,
    len?: number,
  ): R;
}

/**
 * Same as Array.prototype.reduce but with for-loop.
 * Default to have same length as arr.
 *
 * The performance (ops/sec) is slightly better than prototype method (less
 * than 5%). But this function can specify the length of returned array.
 * @param arr Array
 * @param callback Callback function.
 * @param init Initial value
 * @param len Length of returened
 * @returns
 */
export const forLoop: forLoop = <R, T>(
  arr: readonly T[] | string | number,
  callback:
    typeof arr extends number ?
      ((acc: R, val: null, i: number) => R) :
      ((acc: R, val: T, i: number) => R),
  init?: R,
  len?: number,
): R => {
  let s = init;
  if (typeof arr === 'number') {
    for (let i = 0; i < arr; i++)
      // @ts-expect-error
      s = callback(s, null, i);
  } else {
    len ??= arr.length;
    for (let i = 0; i < len; i++)
      // @ts-expect-error
      s = callback(s, arr[i], i);

  }
  // @ts-expect-error
  return s;
};



// ### Value helpers
/**
 * Check whether a value/ref is 'null' or 'undefined'.
 */
export const isNullish = (val: MaybeRef<unknown>): val is null | undefined =>
  unref(val) == null;

/**
 * Invert the boolean value of a ref. If `newVal` is given, assign newVal to ref.
 */
export const invertBoolean = (
  ref: Ref<boolean | undefined> | WritableComputedRef<boolean | undefined>,
  newVal?: boolean
) => ref.value = newVal ?? !unref(ref);

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

/**
 * Get default parameters of a function.
 * If a parameter has no default value, it will be `undefined`.
 */
export const getDefaultParams = (
  fn: CallableFunction
): (string | number | undefined)[] => {
  let argString = /\(\s*([^)]+?)\s*\)/.exec(fn.toString())?.[1];
  if (isNullish(argString)) return [];
  argString = argString.replace(/ /g, '');
  const arr: (string | number | undefined)[] = [];
  const args = argString.split(',');
  args.forEach((arg) => {
    const val = arg.split('=')?.[1];
    arr.push(isNaN(+val) ? val : +val);
  });
  return arr;
};


/**
 * Return a Latin script (includes upper and lower) or a digit.
 * @param noDigit Default: `fasle`. Without digit.
 */
export const randomCharacter = (noDigit: boolean = false) =>
  (
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' + // 52letters
    (noDigit ? '' : '0123456789')
  ).charAt(randInt(noDigit ? 51 : 61)); // randInt is inclusive

/**
 * Convert a text to start case.
 * For example, 'start case' => 'Start Case'.
 */
const toStartCase = (text: string) => {
  const words = text.split(' ');
  words.forEach((str, i, arr) => {
    arr[i] = str[0].toUpperCase() + str.slice(1);
  });
  return words.join(' ');
};

export const getLetterCaseConverter = (letterCase: 'start' | 'all-caps' | string) => {
  if (letterCase === 'all-caps')
    return (str: string) => str.toUpperCase();
  else if (letterCase === 'start') return toStartCase;
  else return (x: string) => x;
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
