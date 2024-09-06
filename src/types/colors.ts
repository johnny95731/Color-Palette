import { COLOR_SPACES, SORTING_ACTIONS, CONTRAST_METHODS } from '@/constants/colors';

/**
 * Support color spaces.
 */
export type ColorSpacesType = typeof COLOR_SPACES[number];

/**
 * The current order of cards.
 */
export type OrderStateType = 'gray' | 'random';
export type SortActionType = typeof SORTING_ACTIONS[number];

/**
 * Support contrast adjusting methods.
 */
export type ContrastMethodType = typeof CONTRAST_METHODS[number];
