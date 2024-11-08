import { sum } from '@/utils/numeric';

// #Space
/**
 * Matrix factors for sRGB to CIE XYZ.
 * Observer. = 2°, Illuminant = D65
 */
export const RGB2XYZ_COEFF = [
  [0.412, 0.358, 0.18 ],
  [0.213, 0.715, 0.072],
  [0.019, 0.119, 0.950],
] as const;
/**
 * Matrix factors for CIE XYZ to sRGB.
 * Observer. = 2°, Illuminant = D65
 */
export const XYZ2RGB_COEFF = [
  [ 3.24, -1.537, -0.499],
  [-0.969,  1.876,  0.046],
  [ 0.056, -0.204,  1.057],
] as const;

/**
 * [0.95047, 1, 1.08883]
 * Observer. = 2°, Illuminant = D65
 */
export const RGB2XYZ_COEFF_ROW_SUM = RGB2XYZ_COEFF.map(row => sum(row));

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
export const XYZ_MAX = RGB2XYZ_COEFF_ROW_SUM
  .map(val => Math.ceil(XYZ_MAX_SCALING * val));
export const LAB_MAX = [100, [-128, 128], [-128, 128]] as const;
export const YUV_MAX = RGB_MAX;

/**
 * Actions for sorting palette colors.
 */
export const SORTING_ACTIONS = ['luminance', 'random', 'inversion'] as const;

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
