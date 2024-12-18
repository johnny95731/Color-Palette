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

// export const pick = <T extends {}, K extends keyof T>(obj: T, ...keys: K[]) => (
//   Object.fromEntries(
//     keys
//       .filter(key => key in obj)
//       .map(key => [key, obj[key]])
//   ) as Pick<T, K>
// );

export const objPick = <T extends {}, K extends (string | number | symbol)>(
  obj: T, keys: K[]
) => (
  Object.fromEntries(
    keys
      .map(key => [key, obj[key as unknown as keyof T]])
  ) as {[key in K]: key extends keyof T ? T[key] : undefined}
  );

// export const omit = <T extends {}, K extends keyof T>(
//   obj: T, ...keys: K[]
// ) =>(
//   Object.fromEntries(
//     Object.entries(obj)
//       .filter(([key]) => !keys.includes(key as K))
//   ) as Omit<T, K>
//   );

/**
 * Shuffle an array by Fisher-Yates shuffle. The process will change the input
 * array.
 */
export function shuffle <T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Quick sort an array in ascending order.
 */
// export function quicksort<T>(
//   arr: T[],
//   left?: number,
//   right?: number,
//   copy: boolean = true,
// ): T[] {
//   if (copy) arr = [...arr];
//   left ??= 0;
//   right ??= arr.length && arr.length - 1; // 0 if lenth = 0, length - 1 elsewise.
//   if (left === right) return arr;
//   const pivotValue = arr[right];
//   let storeIndex = left;
//   for (let i = left; i < right; i++) {
//     if (arr[i] < pivotValue) {
//       [arr[storeIndex], arr[i]] = [arr[i], arr[storeIndex]];
//       storeIndex++;
//     }
//   }
//   [arr[storeIndex], arr[right]] = [arr[right], arr[storeIndex]];
//   quicksort(arr, storeIndex + 1, right, false); // 排序右方
//   quicksort(arr, left, storeIndex - 1, false); // 排序左方
//   return arr;
// }

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



// ### Value helpers
/**
 * Check whether a value/ref is 'null' or 'undefined'.
 */
export const isNullish = (val: unknown | Ref<unknown>) => toValue(val) == null;

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
