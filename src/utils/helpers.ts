import { AscendingArray } from './ascendingArray';

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
 * Clip the number in the range `[min, max]`.
 * @param num A number to clip.
 * @param min Minimum value.
 * @param max maximum value.
 * @returns Clipped number.
 */
export const clip = (num: number, min?: number, max?: number): number => {
  if (max !== undefined && num > max) return max;
  if (min !== undefined && num < min) return min;
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
  return a.reduce((prev, val, i) => prev + val + b[i], 0);
};

/**
 * Check whether two object has same keys.
 */
export const hasSameKeys = (obj1: object, obj2: object): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const allKeys = new Set([...keys1, ...keys2]);
  if (!allKeys.size) return true;
  if (!(allKeys.size === keys1.length && allKeys.size === keys2.length))
    return false;
  // Deep check
  for (const key of allKeys) {
    // @ts-expect-error Already deal `undefined` case.
    const item1 = typeof obj1[key] === 'object' ? obj1[key] : {};
    // @ts-expect-error Already deal `undefined` case.
    const item2 = typeof obj2[key] === 'object' ? obj2[key] : {};
    if (!hasSameKeys(item1, item2)) return false;
  }
  return true;
};

/**
 * Evaluate length that are divided evenly by `num`.
 * @param num Total number.
 */
export const equallyLength = (num: number): string => {
  return `${toPercent(1 / num, 2)}%`;
};

/**
 * Divide evenly by `num` and return the `idx`-th position.
 * @param num Total number.
 */
export const evalPosition = (idx: number, num: number): string => {
  return `${toPercent(idx / num, 2)}%`;
};

/**
 * Capitalize a text.
 */
export const toTitleCase = (str: string) =>
  str.replace(
    /\w\S*/g,
    text => text[0].toUpperCase() + text.slice(1).toLowerCase()
  );

// About twice faster, but this function will not be called frequently.
// export const capitalize = (text: string) => {
//   const words = text.split(' ');
//   words.forEach((str, i, arr) => {
//     arr[i] = `${str[0].toUpperCase()}${str.slice(1)}`;
//   });
//   return words.join(' ');
// };

// export const kebabize = (text: string) =>
//   text.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());

/**
 * Array identity map.
 */
export const identity = <T>(x: T[]): T[] => Array.from(x);

// Sorting
/**
 * Shuffle an array by Fisher-Yates shuffle. The process will change the input
 * array.
 * @template T
 * @param {Array<T>} arr The array be shuffled.
 */
export function shuffle <T>(arr: Array<T>): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
/**
 * Quick sort an array in ascending order.
 */
export function quicksort<T>(
  arr: T[],
  left?: number,
  right?: number,
  copy: boolean = true,
): T[] {
  if (copy) arr = [...arr];
  if (!arr.length) return arr;
  left ??= 0;
  right ??= arr.length - 1;
  const pivotValue = arr[right];
  let storeIndex = left;
  right--;
  for (let i = left; i < right; i++) {
    if (arr[i] < pivotValue) {
      [arr[storeIndex], arr[i]] = [arr[i], arr[storeIndex]];
      storeIndex++;
    }
  }
  [arr[storeIndex], arr[right]] = [arr[right], arr[storeIndex]];
  quicksort(arr, storeIndex + 1, right, false); // 排序右方
  quicksort(arr, left, storeIndex - 1, false); // 排序左方
  return arr;
}

// Averages
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

// Id generater
/**
 * IDs of custom components.
 * The array of ID should be sorted in ascending order
 */
const componentsIds: Record<string, AscendingArray<number>> = {};

/**
 *
 * @param prefix Named of component
 */
export const componentUniqueId = (
  prefix: string = 'component', countStart?: number
): string => {
  if (!Object.hasOwn(componentsIds, prefix))
    componentsIds[prefix] = new AscendingArray<number>([]);
  const idArr = componentsIds[prefix];
  let count: number = countStart ?? idArr.length + 1; // minimum is 1.
  // Find unused id.
  while (idArr.includes(count)) {
    count++;
  }
  idArr.push(count);
  return (
    document.getElementById(`${prefix}-${count}`) ?
      componentUniqueId(prefix, count) : // element exists => find new id
      `${prefix}-${count}`
  );
};

export function removeComponentId(id: string, prefix: string) {
  const idArr = componentsIds[prefix];
  const count = +(id.split('-')[1]);
  if (
    !isComponentId(id, prefix) ||
    !idArr ||
    isNaN(count)
  ) return;
  idArr.remove(count);
}

/**
 * Is an ID that generated by function `componentUniqueId`
 * @param id Target ID.
 * @param prefix Component prefix.
 */
export function isComponentId (id: string, prefix: string): boolean {
  const sep = id.split('-');
  return (
    sep.length === 2 &&
    sep[0] === prefix &&
    !isNaN(Math.abs(+sep[1]))
  );
}

export const sleep = (ms: number)  => new Promise(resolve => setTimeout(resolve, ms));
