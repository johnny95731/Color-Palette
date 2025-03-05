import { map } from '@/utils/helpers';
import { sum } from '@/utils/numeric';

// #Space
/**
 * Matrix factors for sRGB to CIE XYZ.
 * Observer. = 2°, Illuminant = D65
 */
export const RGB2XYZ_COEFF = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.0721750],
  [0.0193339, 0.1191920, 0.9503041],
] as const;
/**
 * Matrix factors for CIE XYZ to sRGB.
 * Observer. = 2°, Illuminant = D65
 */
export const XYZ2RGB_COEFF = [
  [ 3.2404542, -1.5371385, -0.4985314],
  [-0.9692660,  1.8760108,  0.0415560],
  [ 0.0556434, -0.2040259,  1.0572252],
] as const;

/**
 * [0.95047, 1, 1.08883]
 * Observer. = 2°, Illuminant = D65
 */
export const RGB2XYZ_COEFF_ROW_SUM = map(RGB2XYZ_COEFF, row => sum(row));

/** Scaling XYZ values when convering from rgb. */
export const XYZ_MAX_SCALING = 100;

/**
 * Support color spaces.
 */
export const COLOR_SPACES = [
  'rgb', 'name', 'hsl', 'hsb', 'hwb', 'cmy', 'cmyk', 'xyz', 'lab', 'yuv'
] as const;

// Maximums of each color space.
export const RGB_MAX = 255;
export const HSL_MAX = [360, 100, 100] as const;
export const HSB_MAX = HSL_MAX;
export const HWB_MAX = HSL_MAX;
export const CMY_MAX = 100;
export const CMYK_MAX = 100;
export const XYZ_MAX = map(
  RGB2XYZ_COEFF_ROW_SUM,
  val => Math.ceil(XYZ_MAX_SCALING * val)
);
export const LAB_MAX = [100, [-128, 128], [-128, 128]] as const;
export const YUV_MAX = RGB_MAX;

/**
 * Actions for sorting palette colors.
 */
export const SORTING_ACTIONS = [
  'luminance', 'random', 'inversion', 'CIE76', 'CIE94', 'CIEDE2000'
] as const;

// #Contrast
/**
 * Methods of adjusting contrast.
 */
export const CONTRAST_METHODS = ['linear', 'gamma', 'brightness scaling'] as const;

export const MULTIPLICATION_MAX = 10;
export const GAMMA_MAX = 3;

// #Harmonies
/**
 * Methods of adjusting contrast.
 */
export const HARMONY_METHODS = [
  'analogous', 'shades', 'tints', 'tones', 'triad', 'complement',
  'split complement', 'tetrad', 'square', 'compound'
] as const;
