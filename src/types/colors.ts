import { COLOR_SPACES, SORTING_ACTIONS, CONTRAST_METHODS, HARMONY_METHODS } from '@/constants/colors';

/**
 * Support color spaces.
 */
export type ColorSpacesType = typeof COLOR_SPACES[number];

/**
 * Infomations about color space.
 */
export type ColorSpaceInfos = {
  /**
   * Name of channels
   */
  labels: string[];
  /**
   * Range of each channels.
   * If type of `range` is [number, number], it means [min, max].
   * If type of `range` is number, it means the maximum, [0, range].
   */
  range: (number | [number, number])[],
  /**
   * The converter that convert RGB space to specified color space.
   * @param x RGB values.
   * @returns specified color space values.
   */
  converter: (x: number[]) => number[],
  /**
   * The converter that convert specified color space to RGB space.
   * @param x specified color space values.
   * @returns RGB values.
   */
  inverter: (x: number[]) => number[],
};


export type SortActionType = typeof SORTING_ACTIONS[number];
/**
 * The current order of cards.
 */
export type OrderStateType = Exclude<SortActionType, 'inversion'>;

/**
 * Support contrast adjusting methods.
 */
export type ContrastMethodType = typeof CONTRAST_METHODS[number];

/**
 * Support harmony adjusting methods.
 */
export type HarmonyMethodType = typeof HARMONY_METHODS[number];
