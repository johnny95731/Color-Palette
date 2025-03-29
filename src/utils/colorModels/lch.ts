import { cartesian2polar, polar2cartesian } from '../numeric';


/**
 * Convert Luminance-Chroma-Chroma model to LCh (Luminance-Chroma-Hue) model
 * @param lcc Color model that is [luminance, chroma1, chroma2]
 * @returns Corresponding Luminance-Chroma-Chroma model
 */
export const lcc2lch = (lcc: number[]): number[] => {
  const [l, c1, c2] = lcc;
  const polar = cartesian2polar(c2, c1);
  return [l, polar.radius, polar.deg];
};

/**
 * Convert LCh (Luminance-Chroma-Hue) model to Luminance-Chroma-Chroma model
 * @param lch Luminance-Chroma-Chroma model.
 * @returns [luminance, chroma1, chroma2] color model.
 */
export const lch2lcc = (lch: number[]): number[] => {
  const [l, c, h] = lch;
  const cart = polar2cartesian(c, h);
  return [l, cart.x, cart.y];
};
