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
  obj: T, keys: K[]
) => (
  Object.fromEntries(
    keys
      .map(key => [key, obj[key as unknown as keyof T]])
  ) as {[key in K]: key extends keyof T ? T[key] : undefined}
  );

/**
 * Shuffle an array by Fisher-Yates shuffle. The process will change the input
 * array.
 */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


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
