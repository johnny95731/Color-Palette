import { MIXING_MODES } from '@/constants/mixing';
import type { ColorSpaces } from './colors';

export type Mixer = ((c1: number[], c2: number[]) => number[]) |
((c1: number[], c2: number[], colorSpace: ColorSpaces) => number[]);

/**
 * Support mix modes.
 */
export type Mixing = typeof MIXING_MODES[number];
