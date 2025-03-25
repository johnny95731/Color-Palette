import { forLoop } from '../helpers';
import { round } from '../numeric';
import { rgb2lab } from './cielab';
import { hsb2rgb, rgb2hsb } from './hsb';

/** Remove Non-hex characters */
export const removeNonHex = (str: string) => str.replace(/[^0-9A-F]/ig, '');

const hexMatcher = /^#?(([0-9A-F]{3}){1,2})$/i;
/**
 * Verify the string whether is a (3 channel, no alpha channel) Hex color.
 * @param str String that need to be verified.
 * @return Validity of string.
 */
export const isValidHex = (str: string): boolean => {
  return hexMatcher.test(str);
};

/**
 * Convert RGB to Hex.
 * @param rgb RGB color array.
 * @return Hex color.
 */
export const rgb2hex = (rgb: number[], toUpperCase: boolean = true): string => {
  const hex = forLoop(
    rgb,
    (prev, val) => prev + (round(val) < 16 ? 0 : '') + round(val).toString(16),
    '#',
    3
  );
  return toUpperCase ? hex.toUpperCase() : hex;
};

/**
 * Convert Hex color to RGB color.
 * @param hex Hex color string. Note that this function will not hex hex is valid or not.
 * @return rgb
 */
export const hex2rgb = (hex: string): number[] => {
  const hexMatch = hexMatcher.exec(hex);
  if (!hexMatch) return [0, 0, 0];

  hex = hexMatch[1];
  if (hexMatch && hex.length === 3)
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  // .slice is slower
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
};

export const hsb2hex = (hsb: number[]) => {
  return rgb2hex(hsb2rgb(hsb));
};

export const hex2hsb = (hex: string) => {
  return rgb2hsb(hex2rgb(hex));
};

export const hex2lab = (hex: string) => {
  return rgb2lab(hex2rgb(hex));
};
