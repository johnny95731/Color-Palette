
/**
 * Support color spaces.
 */
export const COLOR_SPACES = ['rgb', 'hsl', 'hsb', 'cmyk'] as const;

/**
 * Support blend modes.
 */
export const BLEND_MODES = [
  'mean', 'brighter', 'deeper', 'soft light', 'random',
] as const;

/**
 * Actions for sorting palette colors.
 */
export const SORTING_ACTIONS = ['gray', 'random', 'inversion'] as const;

/**
 * Maximums of each color space.
 */
export const spaceMaxes = {
  'rgb': 255,
  'hsl': [359, 255, 255],
  'hsb': [359, 255, 255],
  'cmyk': 100,
} as const;

