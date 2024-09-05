import { MIXING_MODES } from '@/constants/mixing';
import type { ColorSpacesType } from './colors';

export type Mixer = ((c1: number[], c2: number[]) => number[]) |
((c1: number[], c2: number[], colorSpace: ColorSpacesType) => number[])

/**
 * Support mix modes.
 */
export type MixingType = typeof MIXING_MODES[number];
