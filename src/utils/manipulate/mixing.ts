import { map } from '../helpers.ts';
import { COLOR_MAXES, COLOR_SPACES, getSpaceInfos, type ColorSpace } from '../colors.ts';
import { clip, elementwiseMean } from '../numeric.ts';


// # Constants
/**
 * Support mix modes.
 */
export const MIXING_MODES = [
  'mean', 'brighter', 'deeper', 'soft light', 'additive', 'random',
] as const;


export const MULTIPLICATION_MAX = 10;
export const GAMMA_MAX = 3;

export type Mixer = ((c1: number[], c2: number[]) => number[]) |
((c1: number[], c2: number[], colorSpace: ColorSpace) => number[]);

/**
 * Support mix modes.
 */
export type Mixing = typeof MIXING_MODES[number];


/**
 * Mixing two colors by evaluate their average.
 * @param color1 Color array.
 * @param color2 Color array.
 * @param colorSpace Color space.
 * @returns The mean value of color1 and color2.
 */
const meanMixing = (
  color1: number[], color2: number[]
): number[] => {
  const newColor = elementwiseMean(color1, color2);
  return newColor;
};

/**
 * Mixing two colors by evaluate their RGB sum.
 * @param color1 Color array.
 * @param color2 Color array.
 * @param colorSpace Color space.
 * @returns The mean value of color1 and color2.
 */
const additive = (
  color1: number[], color2: number[], colorSpace?: ColorSpace,
): number[] => {
  const { inverter, converter } = getSpaceInfos(colorSpace ?? COLOR_SPACES[0]);
  const rgb1 = inverter(color1);
  const rgb2 = inverter(color2);
  const newColor = map(
    rgb1,
    (val, i) => clip(val + rgb2[i], 0, COLOR_MAXES.rgb),
    3
  );
  return converter(newColor);
};

/**
 * Blending two colors by  illusions.hu's Soft Light formula.
 * @param color1 Numeric of a color.
 * @param color2 Numeric of a color.
 * @returns The mean value of color1 and color2.
 */
const softLightBlend = (() => {
  const GAMMA_CONST = 2**(- 2 / 255);
  return (color1: number[], color2: number[]) => {
    return map(color1, (val, i) => {
      return 255 * (val / 255) ** (2 * GAMMA_CONST**color2[i]);
    });
  };
})();

/**
 * Take the mean mix of color1 and color2 and do gamma correction to adjust
 * saturation and luminance.
 * @param color1 A RGB array.
 * @param color2 A RGB array.
 * @param gamma Gamma-corection coefficient. The color is deeper if gamma > 1.
 *   The color is brighter if gamma < 1.
 * @returns The mix color of color1 and color2.
 */
const mixingNGamma = (
  color1: number[], color2: number[], gamma: number = 0.3,
) => {
  /**
   * Scaling coefficients of saturation and luminance.
   */
  const sacleCoeff = map(
    COLOR_MAXES.hsl,
    (val) => Math.pow(val, (1 - gamma))
  );
  const mean = elementwiseMean(color1, color2);
  const { converter, inverter } = getSpaceInfos(COLOR_SPACES[2]); // 'HSL'
  const [hue, sat, lum] = converter(mean);
  const newSat = sat**gamma * sacleCoeff[1];
  const newLum = lum**gamma * sacleCoeff[2];
  return inverter([hue, newSat, newLum]);
};

const brighterMix: Mixer = (color1: number[], color2: number[]) =>
  mixingNGamma(color1, color2);
const deeperMix: Mixer = (color1: number[], color2: number[]) =>
  mixingNGamma(color1, color2, 1.5);

export const getMixer = (method: string) => {
  if (method === 'mean')
    return meanMixing;
  else if (method === 'brighter')
    return brighterMix;
  else if (method === 'deeper')
    return deeperMix;
  else if (method === 'soft light')
    return softLightBlend;
  else if (method === 'additive')
    return additive;
  else return additive;
};
