import { forLoop, map } from '../helpers';
import { hueRotation } from '../colors';


// # Constants
/**
 * Methods of adjusting contrast.
 */
export const HARMONY_METHODS = [
  'analogous', 'shades', 'tints', 'tones', 'triad', 'square', 'complement',
  'split complement', 'tetradic1', 'tetradic2', 'tetradic3'
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
 * Secondary color is complementary color (+180 deg in hue).
 * Hue rotation: [0°, 180°]
 **/
export const complement = (primaryHsb: number[]) => harmonize(primaryHsb, 180, 180, 2);
/**
 * 3 colors.
 * Generate analogous colors (+-30 deg in hue) of complementary color
 * Hue rotation: [0°, 30°, -30°]
 */
export const split = (primaryHsb: number[]) => harmonize(primaryHsb, 150, 60, 3);
/**
 * 3 colors divided hue wheel equally (120 deg).
 * Hue rotation: [0°, 120°, 240°]
 */
export const triadic = (primaryHsb: number[]) => harmonize(primaryHsb, 120, 120, 3);
/**
 * 4 colors divided hue wheel equally (90 deg).
 * Hue rotation: [0°, 90°, 180°, 270°]
 */
export const square = (primaryHsb: number[]) => harmonize(primaryHsb, 90, 90, 4);
/**
 * 3 colors.
 * The difference of hue to primary is +-30deg.
 * Hue rotation: [0°, 30°, 330° = -30°]
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
 * Hue rotation: [0°, 30°, 180°, 210°]
 */
export const tetradic1 = (primaryHsb: number[]) => {
  const colors = complement(primaryHsb);
  colors.push(...complement(hueRotation(primaryHsb, 30)));
  return colors;
};
/**
 * 4 colors.
 * Hue rotation: [0°, 60°, 180°, 240°]
 */
export const tetradic2 = (primaryHsb: number[]) => {
  const colors = complement(primaryHsb);
  colors.push(...complement(hueRotation(primaryHsb, 60)));
  return colors;
};
/**
 * 4 colors.
 * Primary, its complement, and their analogous in same side of hue wheel.
 * Hue rotation: [0°, 30°, 180°, 150°]
 */
export const tetradic3 = (primaryHsb: number[]) => {
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
  const idx = HARMONY_METHODS.indexOf(method);
  if (idx === 0) return analogous;
  if (idx === 1) return shades;
  if (idx === 2) return tints;
  if (idx === 3) return tones;
  if (idx === 4) return triadic;
  if (idx === 5) return square;
  if (idx === 6) return complement;
  if (idx === 7) return split;
  if (idx === 8) return tetradic1;
  if (idx === 9) return tetradic2;
  if (idx === 10) return tetradic3;
  return tetradic3;
};
