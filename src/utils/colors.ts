import { COLOR_SPACES, getColorSpace, getCssColor, hex2rgb, hsb2rgb, map, namedColor, rgb2hex, rgb2hsb, type ColorSpace, type CssColorOptions } from '@johnny95731/color-utils';
import { frac2percentage } from './numeric';

/** Remove Non-hex characters */
export const removeNonHex = (str: string) => str.replace(/[^0-9A-F]/ig, '');

export const hsb2hex = (hsb: number[]) => {
  return rgb2hex(hsb2rgb(hsb));
};

export const hex2hsb = (hex: string) => {
  return rgb2hsb(hex2rgb(hex));
};

/**
* All names of CSS <named-color> (removed synonym name) with sapce between words.
*/
export const nameColorList = Array.from(namedColor.keys());

const gradOption = {
  place_: false
} satisfies CssColorOptions;
/**
 * Generate a linear gradient along an axis/channel of given color and space.
 * The color will change from minimum value to maximum value
 * @param color Color array.
 * @param axis Channel that will be changed.
 * @param space Color space of `color`. If the browser is not support the space,
 * the color will be convert to rgb.
 * @param steps Default: `8`. Segment of color change. For example, red -> green -> blue
 * contains is two steps, red to green and green to blue.
 * @param deg Default: `'90deg'`. The direction of gradient.
 * @returns CSS linear-gradient value.
 */
export const gradientGen = (
  color: number[],
  axis: number,
  space: ColorSpace,
  steps: number = 8,
  deg: string = '90deg',
) => {
  space = getColorSpace(space);
  const isAlpha = space.max_.length === axis;
  const [min, max] = isAlpha ? [0, 1] : space.max_[axis];
  const unitIncreament = (max - min) / steps;
  // console.log(color, min, max, unitIncreament, isSupported_);
  const arr = [...color];
  const grads = map(
    steps + 1,
    space.isSupported_ ?
      i => {
        arr[axis] = min + i * unitIncreament;
        return `${
          getCssColor(arr, space, gradOption)} ${
          frac2percentage(i, steps)}`;
      } :
      i => {
        arr[axis] = min + i * unitIncreament;
        return `${
          getCssColor(space.toRgb_(arr), COLOR_SPACES[0], gradOption)} ${
          frac2percentage(i, steps)}`;
      }
  );
  return `linear-gradient(${deg}, ${grads.join(', ')})`;
};
