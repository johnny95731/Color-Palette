import { forLoop, map } from '../helpers';
import { hueRotation } from '../colors';


// # Constants
/**
 * Methods of adjusting contrast.
 */
export const HARMONY_METHODS = [
  'analogous', 'shades', 'tints', 'tones', 'triad', 'complement',
  'split complement', 'tetrad', 'square', 'compound'
] as const;
/**
 * Support harmony adjusting methods.
 */
export type HarmonyMethods = typeof HARMONY_METHODS[number];


// # Harmonize
/**
 * Generate a harmony palette from a primary color (in HSB).
 * The hues of palette are [
 *   primary, primary + start, primary + start + increment,
 *   primary + start + 2 * increment, ...
 * ]
 * @param primaryHsb Primary color in HSB space.
 * @param start The first increasing amout of hue in degree.
 * @param increment The increment of degree after second color.
 * @param num Color numbers (including primary).
 * @returns
 */
export const harmonize = (primaryHsb: number[], start: number, increment: number, num: number) => {
  // start from 1 'cause first color is primary color.
  return forLoop(
    num - 1,
    (prev) => {
      prev.push(hueRotation(primaryHsb, start));
      start += increment;
      return prev;
    },
    [primaryHsb]
  );
};

/**
 * 2 colors.
 * Secondary color is complementary color (+180 deg in hue)
 **/
export const complement = (primaryHsb: number[]) => harmonize(primaryHsb, 180, 180, 2);
/**
 * 3 colors.
 * Generate analogous colors (+-30 deg in hue) of complementary color
 */
export const split = (primaryHsb: number[]) => harmonize(primaryHsb, 150, 60, 3);
/**
 * 3 colors divided hue wheel equally (120 deg).
 */
export const triad = (primaryHsb: number[]) => harmonize(primaryHsb, 120, 120, 3);
/**
 * 4 colors divided hue wheel equally (90 deg).
 */
export const square = (primaryHsb: number[]) => harmonize(primaryHsb, 90, 90, 4);
/**
 * 3 colors.
 * The difference of hue to primary is +-30deg.
 */
export const analogous = (primaryHsb: number[]) => {
  return [
    primaryHsb,
    hueRotation(primaryHsb, 30), // secondary color
    hueRotation(primaryHsb,-30), // tertiary
  ];
};
/**
 * 4 colors.
 * Primary, its complement, and their clockwise analogous in different side of hue wheel.
 * Or, equivalentlly, primary, its clockwise analogous, and their complement.
 */
export const tetrad = (primaryHsb: number[]) => {
  const colors = complement(primaryHsb);
  colors.push(...complement(hueRotation(primaryHsb, 30)));
  return colors;
};
/**
 * 4 colors.
 * Primary, its complement, and their analogous in same side of hue wheel.
 */
export const compound = (primaryHsb: number[]) => {
  const colors = complement(primaryHsb);
  colors.push(hueRotation(primaryHsb, 30));
  colors.push(hueRotation(colors[1], -30));
  return colors;
};

// ## Saturation/Brightness harmony
/**
 * Generate gradient that decreasing in brightness.
 */
export const shades = (primaryHsb: number[], num: number = 6) => {
  const [h,s,b] = primaryHsb;
  const step = b / num;
  return map(
    num,
    (_, i) => [h, s, b - i * step],
  );
};

/**
 * Generate gradient that decreasing in saturation.
 */
export const tints = (primaryHsb: number[], num: number = 6) => {
  const [h,s,b] = primaryHsb;
  const step = s / num;
  return map(
    num,
    (_, i) => [h, s - i * step, b],
  );
};

/**
 * Generate gradient that decreasing in both saturation and brightness.
 */
export const tones = (primaryHsb: number[], num: number = 6) => {
  const [h,s,b] = primaryHsb;
  const stepSat = s / num;
  const stepBri = b / num;

  return map(
    num,
    (_, i) => [h, s - i * stepSat, b - i * stepBri],
  );
};

/**
 * Get the harmony palette generator of specific method.
 */
export const getHarmonize = (method: HarmonyMethods) => {
  if (method === HARMONY_METHODS[0]) return analogous;
  if (method === HARMONY_METHODS[1]) return shades;
  if (method === HARMONY_METHODS[2]) return tints;
  if (method === HARMONY_METHODS[3]) return tones;
  if (method === HARMONY_METHODS[4]) return triad;
  if (method === HARMONY_METHODS[5]) return complement;
  if (method === HARMONY_METHODS[6]) return split;
  if (method === HARMONY_METHODS[7]) return tetrad;
  if (method === HARMONY_METHODS[8]) return square;
  if (method === HARMONY_METHODS[9]) return compound;
  return compound;
};
