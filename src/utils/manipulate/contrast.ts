import { forLoop, map } from '../helpers';
import { clip, rangeMapping } from '../numeric';
import { COLOR_MAXES } from '../colors';
import { lab2rgb, rgb2lab } from '../colorModels/cielab';


// # Constants
/**
 * Methods of adjusting contrast.
 */
export const CONTRAST_METHODS = [
  'linear',
  'gamma',
  'auto enhancement',
  'auto brightness'
] as const;
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
const scaling = (rgbs: number[][], c: number = 1): number[][] => {
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
const gammaCorrection = (rgbs: number[][], gamma: number = 1): number[][] => {
  const normalizeCoeff = COLOR_MAXES.rgb ** (1 - gamma);
  return map(
    rgbs,
    rgb => map(rgb, (val) => normalizeCoeff * (val**gamma), 3)
  );
};


/**
 * Enhance the contrast by scaling their luminance channel of CIELAB space.
 * @param rgbs
 * @returns
 */
const autoEnhancement = (rgbs: number[][]): number[][] => {
  const labs = map(rgbs, rgb => rgb2lab(rgb));
  const [minY, maxY] = forLoop(
    labs,
    (prev, [l]) => {
      if (l < prev[0]) prev[0] = l;
      if (l > prev[1]) prev[1] = l;
      return prev;
    },
    [COLOR_MAXES.lab[0], 0] as [number, number]
  );
  return map(
    labs,
    lab => {
      lab[0] = rangeMapping(lab[0], minY, maxY, 0, COLOR_MAXES.lab[0]);
      return lab2rgb(lab);
    }
  );
};


/**
 * Contrast
 * @param rgbs
 * @param coeff
 * @returns
 */
const autoBrightness = (rgbs: number[][], coeff: number = 0.7): number[][] => {
  const labs = map(rgbs, rgb => rgb2lab(rgb));

  const meanL = forLoop(labs, (acc, [l]) => acc + l, 0) / labs.length;
  if (meanL < 1e-5 || coeff <= 1e-5) {
    return map(rgbs, rgb => [...rgb]);
  } else {
    const gamma = (Math.log(coeff) / Math.log(meanL/COLOR_MAXES.lab[0]));
    const c = COLOR_MAXES.lab[0] ** (1 - gamma);
    return map(
      labs,
      lab => {
        lab[0] = c * lab[0] ** gamma;
        return lab2rgb(lab);
      }
    );
  }
};


export const getAdjuster = (method: ContrastMethods) => {
  if (method === CONTRAST_METHODS[0]) return scaling;
  if (method === CONTRAST_METHODS[1]) return gammaCorrection;
  if (method === CONTRAST_METHODS[2]) return autoEnhancement;
  if (method === CONTRAST_METHODS[3]) return autoBrightness;
  return autoBrightness;
};
