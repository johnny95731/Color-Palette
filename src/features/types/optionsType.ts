import {COLOR_SPACES, BLEND_MODES} from '@/utils/constants';

export type ColorSpacesType = typeof COLOR_SPACES[number];

export type BlendingType = typeof BLEND_MODES[number];

/**
 * Maximums of each color space. The range of color space is
 * [0, resolution].
 */
export const spaceMaxes = {
  'rgb': 255,
  'hsl': [359, 255, 255],
  'hsb': [359, 255, 255],
  'cmyk': 100,
} as const;
