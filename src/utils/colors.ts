import { COLOR_SPACES, getColorSpace, getCssColor, getSpaceRange, hex2rgb, hsb2rgb, map, namedColor, rgb2hex, rgb2hsb, type ColorSpace } from '@johnny95731/color-utils';
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
* Add a white space before capital letters except the first letter.
*/
export const unzipCssNamed = (name: string) => name.replace(/([A-Z])/g, ' $1').trim();

/**
* All names of CSS <named-color> (removed synonym name) with sapce between words.
*/
export const unzipedNameList: string[] = [];

namedColor.forEach((hex, name) => {
  unzipedNameList.push(name);
});


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
  space: ColorSpace | string,
  steps: number = 8,
  deg: string = '90deg',
) => {
  space = getColorSpace(space);
  const { toRgb_, isSupported_ } = space;

  const [min, max] = getSpaceRange(space)[axis];
  const unitIncreament = (max - min) / steps;
  const arr = isSupported_ ? [...color] : toRgb_(color);
  let grads: string[];
  if (isSupported_) {
    grads = map(
      steps + 1,
      i => {
        arr.splice(axis, 1, min + i * unitIncreament);
        return `${getCssColor(arr, space)} ${frac2percentage(i, steps)}`;
      }
    );
  } else {
    space = COLOR_SPACES[0];
    grads = map(
      steps + 1,
      i => {
        arr.splice(axis, 1, min + i * unitIncreament);
        return `${getCssColor(toRgb_(arr), space)} ${frac2percentage(i, steps)}`;
      }
    );
  }
  return `linear-gradient(${deg}, ${grads.join(', ')})`;
};
