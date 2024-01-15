/**
 * The modulo function. Equivalent to
 *   `let a = n % m;
 *   if (a < 0) a += m;`
 * @param {Number} n Dividend.
 * @param {Number} m Divisor.
 * @return {Number} Signed remainder.
 */
export const mod = (n: number, m: number): number => {
  return ((n % m) + m) % m;
};

export const capitalize = (text: string) => {
  const words = text.split(' ');
  words.forEach((str, i, arr) => {
    arr[i] = `${str[0].toUpperCase()}${str.slice(1)}`;
  });
  return words.join(' ');
};

// Sorting
/**
 * Shuffle an array by Fisher-Yates shuffle. The process will change the input
 * array.
 * @template T
 * @param {Array<T>} arr The array be shuffled.
 */
export const shuffle = <T>(arr: Array<T>): void => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

/**
 * Invert the order of an array. The process will change the input
 * array.
 * @template T
 * @param {Array<T>} arr The array be inverted.
 */
export const inversion = <T>(arr: Array<T>): void => {
  const lastIdx = arr.length - 1;
  for (let i = 0; i < arr.length / 2; i++) {
    [arr[i], arr[lastIdx - i]] = [arr[lastIdx - i], arr[i]];
  }
};

// Averages
/**
 * Evaluate elementwise mean of two arrays.
 * @param arr1 Numeric of a color.
 * @param arr2 Numeric of a color.
 * @returns The mean value of color1 and color2.
 */
export const elementwiseMean = (arr1: number[], arr2: number[]): number[] => {
  const newColor = new Array(arr1.length);
  for (let i = 0; i < arr1.length; i++) {
    newColor[i] = 0.5 * (arr1[i] + arr2[i]);
  }
  return newColor;
};

// Events
export const preventDefault = (e: Event) => {
  e.preventDefault();
};
export const stopPropagation = (e: Event) => {
  e.stopPropagation();
};
/**
 * Remove non-hex text and add '#' to first word.
 * @param e Triggered mouse event.
 */
export const hexTextEdited = (
    e: Event,
): void => {
  const textInput = e.currentTarget as HTMLInputElement;
  let text = (textInput.value).toUpperCase();
  text = text.replace(/[^A-F0-9]/g, '');
  textInput.value = `#${text}`;
};
/**
 * Copy Hex text to clipboard (excludes '#').
 * @param e Triggered mouse event.
 */
export const copyHex = (
    e: MouseEvent,
): void => {
  const target = e.currentTarget as HTMLElement;
  if (!target) return;
  const text = target.innerText;
  const brIdx = text.indexOf('\n'); // index of break.
  const start = text.startsWith('#') ? 1 : 0;
  let hex: string;
  if (brIdx > -1) {
    hex = text.slice(start, brIdx);
  } else {
    hex = text.slice(start);
  }
  try {
    navigator.clipboard.writeText(hex);
  } catch (err) {
    console.log(err);
  }
};

/**
 * For DropupMenu.vue.
 */
export function showPopupMenu(e: MouseEvent | FocusEvent) {
  const target = e.currentTarget as HTMLElement;
  const content = target.lastChild as HTMLElement;
  if ((e as FocusEvent).type === 'blur') {
    content.style.maxHeight = '';
    return;
  }
  /**
   * For small size device, menu has 2 layers. The outer mune content contains
   * menu (inner menu) and non-menu (button). And both layers' menu connet to
   * this function. Click outer menu content has following 3 cases.
   * 1. Click non-menu: target === (outer menu). Trigger button event and close
   *    outer content.
   * In case 2 and 3, target === (inner menu).
   * 2. Click inner menu: content === (inner menu content). Hence, stop
   *    propagation to outer menu and open inner menu content.
   * 3. Click inner menu content: (!content.contains(e.target) === false).
   *    Hence, do propagation => close outer menu content.
   */
  if (!content.contains(e.target as Node)) {
    e.stopPropagation();
  }
  // const display = content.style.display;
  // if (display === 'block') {
  //   content.style.display = '';
  //   target.blur();
  // } else {
  //   content.style.display = 'block';
  // }
  const height = content.style.maxHeight;
  if (height === '') {
    content.style.maxHeight = '100vh';
  } else {
    content.style.maxHeight = '';
    target.blur();
  }
}
