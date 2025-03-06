import { map } from './helpers.ts';
import { getSpaceInfos } from './colors.ts';
import { elementwiseMean } from './numeric.ts';
import { HSL_MAX } from '@/constants/colors.ts';
import type { Mixer, Mixing } from '@/types/mixing.ts';
import type { ColorSpaces } from '@/types/colors.ts';

/**
 * Mixing two colors by evaluate their average.
 * @param color1 RGB color.
 * @param color2 RGB color.
 * @param colorSpace Color space.
 * @returns The mean value of color1 and color2.
 */
const meanMixing = (
  color1: number[], color2: number[], colorSpace: ColorSpaces,
): number[] => {
  const { converter, inverter } = getSpaceInfos(colorSpace);
  const newColor = elementwiseMean(
    converter(color1), converter(color2),
  );
  return inverter(newColor);
};

/**
 * Blending two colors by evaluate their average.
 * @param color1 Numeric of a color.
 * @param color2 Numeric of a color.
 * @param colorSpace Color space.
 * @returns The mean value of color1 and color2.
 */
const additive = (
  color1: number[], color2: number[], colorSpace: ColorSpaces,
): number[] => {
  const { converter, inverter } = getSpaceInfos(colorSpace);
  const newColor = elementwiseMean(
    converter(color1), converter(color2),
  );
  return inverter(newColor);
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
    HSL_MAX,
    (val) => Math.pow(val, (1 - gamma))
  );
  const mean = elementwiseMean(color1, color2);
  const { converter, inverter } = getSpaceInfos('hsl');
  const [hue, sat, lum] = converter(mean);
  const newSat = Math.pow(sat, gamma) * sacleCoeff[1];
  const newLum = Math.pow(lum, gamma) * sacleCoeff[2];
  return inverter([hue, newSat, newLum]);
};

const brighter: Mixer = (color1: number[], color2: number[]) =>
  mixingNGamma(color1, color2);
const deeperBlend: Mixer = (color1: number[], color2: number[]) =>
  mixingNGamma(color1, color2, 1.5);

export const mixers = Object.freeze<Record<Exclude<Mixing, 'random'>, Mixer>>({
  'mean': meanMixing,
  'brighter': brighter,
  'deeper': deeperBlend,
  'soft light': softLightBlend,
});
