import { forLoop, map } from '../helpers';
import { clip, rangeMapping } from '../numeric';
import { COLOR_MAXES, rgb2yuv, yuv2rgb } from '../colors';


// # Constants
/**
 * Methods of adjusting contrast.
 */
export const CONTRAST_METHODS = ['linear', 'gamma', 'brightness scaling'] as const;
/**
 * Support contrast adjusting methods.
 */
export type ContrastMethods = typeof CONTRAST_METHODS[number];

// # Adjusts contrast.
/**
 * Scale ths values of RGB.
 * @param rgbs RGB arrays.
 * @param c Scaling coefficient.
 * @return `rgb` after scaling.
 */
const scaling = (rgbs: number[][], c: number): number[][] => {
  return map(
    rgbs,
    (rgb) => {
      return map(
        rgb,
        val => clip(val * c, 0, COLOR_MAXES.rgb)
      );
    }
  );
};

/**
 * Gamma correction to RGB array(s).
 * @param rgbs RGB array(s).
 * @param gamma Gamma coefficient.
 * @return `rgb` after correction. The type is the
 * same as `rgb`.
 */
const gammaCorrection = (rgbs: number[][], gamma: number): number[][] => {
  const normalizeCoeff = COLOR_MAXES.rgb ** (1 - gamma);
  return map(
    rgbs,
    rgb => map(rgb, (val) => normalizeCoeff * (val**gamma), 3)
  );
};

/**
 * Scaling the range of brightness values of a color array in YUV space to a
 * larger range.
 */
const brightnessScaling = (rgbs: number[][]): number[][] => {
  const yuvs = map(
    rgbs,
    rgb => rgb2yuv(rgb),
  );

  const [minY, maxY] = forLoop(
    yuvs,
    (prev, [y]) => {
      if (y < prev[0]) prev[0] = y;
      if (y > prev[1]) prev[1] = y;
      return prev;
    },
    [COLOR_MAXES.yuv, 0] as [number, number]
  );
  const sqrtMinY = Math.sqrt(minY);

  return map(
    yuvs,
    yuv => {
      yuv[0] = rangeMapping(yuv[0], minY, maxY, sqrtMinY, COLOR_MAXES.yuv);
      return yuv2rgb(yuv);
    }
  );
};


export const getContrastAdjuster = (method: ContrastMethods) => {
  if (method === CONTRAST_METHODS[0]) return scaling;
  if (method === CONTRAST_METHODS[1]) return gammaCorrection;
  if (method === CONTRAST_METHODS[2]) return brightnessScaling;
  return brightnessScaling;
};
