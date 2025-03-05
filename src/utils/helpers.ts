import { toValue } from '@vueuse/core';
import { randInt, toPercent } from './numeric';
import type { Ref, WritableComputedRef } from 'vue';

// ### Object helpers
/**
 * Check whether two object has same keys.
 */
// export const hasSameKeys = (obj1: object, obj2: object): boolean => {
//   const keys1 = Object.keys(obj1);
//   const keys2 = Object.keys(obj2);
//   const allKeys = new Set([...keys1, ...keys2]);
//   if (!allKeys.size) return true;
//   if (!(allKeys.size === keys1.length && allKeys.size === keys2.length))
//     return false;
//   // Deep check
//   for (const key of allKeys) {
//     // @ts-expect-error Already deal `undefined` case.
//     const item1 = typeof obj1[key] === 'object' ? obj1[key] : {};
//     // @ts-expect-error Already deal `undefined` case.
//     const item2 = typeof obj2[key] === 'object' ? obj2[key] : {};
//     if (!hasSameKeys(item1, item2)) return false;
//   }
//   return true;
// };

export const objPick = <T extends object, K extends (string | number | symbol)>(
  obj: T,
  keys: K[]
) => (
  Object.fromEntries(
    reduce(
      keys,
      (prev, key) => {
        prev.push([key, obj[key as unknown as keyof T]]);
        return prev;
      },
      [] as [K, T[keyof T]][]
    ),
  ) as {[key in K]: key extends keyof T ? T[key] : undefined}
  );

/**
 * Shuffle an array by Fisher-Yates shuffle. The process will change the input
 * array.
 */
export function shuffle<T>(arr: T[]): T[] {
  let j: number;
  for (let i = arr.length - 1; i > 0; i--) {
    j = randInt(i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


/**
 * Generate an array with specific length.
 *
 * Faster than Array.prototype.map about 10%-22% on Edge and 7%-15% on Firefox.
 */
export function map<R>(
  len: number,
  callback: (val: undefined, i: number) => R
): R[]
/**
 * Similar to Array.prototype.map but more generalize.
 * But with an argument to restrict the length of returned array.
 *
 * Faster than Array.prototype.map about 10%-22% on Edge and 7%-15% on Firefox.
 */
export function map<R, T>(
  arr: readonly T[],
  callback: (val: T, i: number) => R,
  len?: number,
): R[]
export function map<R, T>(
  arr: readonly T[] | number,
  callback: (val: T, i: number) => R,
  len?: number,
): R[] {
  return reduce(
    // @ts-expect-error
  	arr,
  	(prev, val, i) => {
  	  prev.push(callback(val, i));
  	  return prev;
  	},
  	[] as R[],
  	len
  );
}

export function reduce<R>(
  len: number,
  callback: (prev: R, val: undefined, i: number) => R,
  init?: R,
  _?: number
): R

export function reduce<R, T extends string>(
  arr: T,
  callback: (prev: R, val: T, i: number) => R,
  init: R,
  len?: number,
): R

export function reduce<R, T>(
  arr: readonly T[],
  callback: (prev: R, val: T, i: number) => R,
  init: R,
  len?: number,
): R

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
export function reduce<R, T>(
  arr: readonly T[] | string | number,
  callback: (prev: R, val: T, i: number) => R,
  init?: R,
  len?: number,
): R {
  if (typeof arr === 'number') {
    len = arr;
    arr = Array(arr);
  }
  len ??= arr.length;
  let s = init;
  for (let i = 0; i < len; i++) {
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
export const isNullish = (val: unknown | Ref<unknown>): val is null | undefined =>
  toValue(val) == null;

/**
 * Invert the boolean value of a ref. If `newVal` is given, assign newVal to ref.
 */
export const invertBoolean = (
  ref: Ref<boolean | undefined> | WritableComputedRef<boolean | undefined>,
  newVal?: boolean
) => ref.value = newVal ?? !toValue(ref);

/**
 * Evaluate length that are divided evenly by `num`.
 * @param num Total number.
 */
export const equallyLength = (num: number): string => {
  return toPercent(1 / num, 2) + '%';
};

/**
 * Divide evenly by `num` and return the `idx`-th position.
 * @param num Total number.
 */
export const evalPosition = (idx: number, num: number): string => {
  return toPercent(idx / num, 2) + '%';
};

export const randomCharacter = (noDigit: boolean = false) =>
  (
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' + // 52letters
    (noDigit ? '' : '0123456789')
  ).charAt(randInt(noDigit ? 51 : 61)); // randInt is inclusive

/**
 * Convert a text to start case.
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

// export const kebabize = (text: string) =>
//   text.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
