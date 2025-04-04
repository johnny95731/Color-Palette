import { frac2percentage, map } from './helpers';
import { dot, mod, randInt, round } from './numeric';
import { hex2rgb } from './colorModels/hex';
import { rgb2xyz, RGB2XYZ_COEFF_ROW_SUM, xyz2rgb, XYZ_MAX_SCALING } from './colorModels/ciexyz';
import { hsl2rgb, rgb2hsl } from './colorModels/hsl';
import { hsb2rgb, rgb2hsb } from './colorModels/hsb';
import { hwb2rgb, rgb2hwb } from './colorModels/hwb';
import { cmyk2rgb, rgb2cmyk } from './colorModels/cmyk';
import { lab2rgb, lchab2rgb, rgb2lab, rgb2lchab } from './colorModels/cielab';
import { lchuv2rgb, luv2rgb, rgb2lchuv, rgb2luv } from './colorModels/cieluv';
import { rgb2yuv, yuv2rgb } from './colorModels/yuv';


// # Constants
/** Scaling XYZ values when convering from rgb. */

export type ColorSpace = {
  /**
   * Name of the color space.
   */
  name_: string,
  /**
   * Name of CSS color function (if exists). Note that this may be repeated, for example,
   * LCH(ab) and LCH(uv) are `lch`.
   */
  css_: string,
  /**
   * Browser support this color value or not.
   */
  isSupport_: boolean,
}
/**
 * Support color spaces.
 */
export const COLOR_SPACES = (() => {
  const spaces = [
    {
      name_: 'sRGB',
      css_: 'rgb'
    },
    {
      name_: 'Named',
    },
    {
      name_: 'HSL',
    },
    {
      name_: 'HSB',
    },
    {
      name_: 'HWB',
    },
    {
      name_: 'CMYK',
    },
    {
      name_: 'CIEXYZ',
      css_: 'xyz'
    },
    {
      name_: 'CIELAB',
      css_: 'lab'
    },
    {
      name_: 'CIELUV',
      css_: 'luv'
    },
    {
      name_: 'CIELCH(ab)',
      css_: 'lch'
    },
    {
      name_: 'CIELCH(uv)',
      css_: 'lch'
    },
    {
      name_: 'YUV',
    },
  ] as ColorSpace[];
  const isInNode = typeof window === 'undefined';
  for (const space of spaces) {
    space.css_ ??= space.name_.toLowerCase();
    space.isSupport_ = isInNode || CSS?.supports('color', `${space.css_}(0 0 0)`);
  }
  return spaces;
})();


// Ranges of channels for each color space.
/**
 * The keys are `COLOR_SPACES.css_`
 */
export const COLOR_MAXES = {
  rgb: 255,
  hsl: [360, 100, 100] as const,
  hsb: [360, 100, 100] as const,
  hwb: [360, 100, 100] as const,
  cmyk: 100,
  xyz: map(RGB2XYZ_COEFF_ROW_SUM, val => XYZ_MAX_SCALING * val) as readonly number[],
  lab: [100, [-125, 125], [-125, 125]] as const,
  luv: [100, [-134, 220], [-140, 122]] as const,
  lch: [100, 100, 360] as const,
  yuv: 255
};

/**
 * Return CSS <color> value format: `space(val val val)`.
 * If `checkSupport` and the brwoser does not support, then return rgb space.
 * @param color Array of values of color.
 * @param space Color space of color.
 * @param checkSupport Default: `false`. Check the browser support or not.
 * @param sep Default: `' '`. Seperator of color function.
 * @returns
 */
export const getColorFunction = (
  color: number[],
  space: ColorSpace,
  checkSupport: boolean = false,
  sep: string = ' '
): string => {
  color = [...color];
  const colorFunc = space.css_;
  if (checkSupport && !space.isSupport_) {
    const { inverter } = getSpaceInfos(space);
    return getColorFunction(inverter(color), COLOR_SPACES[0]);
  }
  return `${colorFunc}(${color.join(sep)})`;
};

/**
 * Rotate the hue of a HSB/HSL color by a given degree.
 * @param hsb Color array
 * @param deg Degree that rotation.
 */
export const hueRotation = (hsb: number[], deg: number) => (
  [mod(hsb[0] + deg, 360), hsb[1], hsb[2]]
);

/**
 * Calculate hue (H channel of HSL/HSB) from rgb. Also, returns minimum and
 * maximum of rgb.
 * @param rgb RGB array.
 * @return [hue, min(r,g,b), max(r,g,b)].
 */
export const rgb2hue = (rgb: number[]): number[] => {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue;
  if (max === min)
    hue = 0;
  else if (max === r)
    hue = mod((g - b) / delta, 6);
  else if (max === g)
    hue = (b - r) / delta + 2;
  else // max === b:
    hue = (r - g) / delta + 4;
  return [60 * hue, min, max];
};


/**
 * Convert sRGB to linear RGB.
 * Maps [0, COLOR_MAXES.rgb] into [0, COLOR_MAXES.rgb]
 */
type linearRgb2srgb = (val: number) => number;
/**
 * Convert linear RGB to sRGB.
 * Maps [0, COLOR_MAXES.rgb] into [0, COLOR_MAXES.rgb]
 */
type srgb2linearRgb = (val: number) => number;
const [linearRgb2srgb, srgb2linearRgb] = (() => {
  const thresh1 = 0.0031308 * COLOR_MAXES.rgb;
  const thresh2 = thresh1 * 12.92;
  const p = 1 / 2.4;

  const linearRgb2srgb = (val: number) => {
    return val < thresh1 ?
      val * 12.92 :
      ((val/COLOR_MAXES.rgb)**p * 1.055 - 0.055) * COLOR_MAXES.rgb;
  };
  const srgb2linearRgb: srgb2linearRgb = (val: number) => {
    return val < thresh2 ?
      val / 12.92 :
      ((val/COLOR_MAXES.rgb+0.055) / 1.055)**2.4 * COLOR_MAXES.rgb;
  };
  return [linearRgb2srgb, srgb2linearRgb] as const;
})();
export { linearRgb2srgb, srgb2linearRgb }; // To read jsdoc.


/**
 * Conver RGB to grayscale.
 * @param rgb Array of RGB color.
 * @return grayscale [0, COLOR_MAXES.rgb]
 */
export const rgb2gray = (rgb: number[]) => dot(rgb, [0.299, 0.587, 0.114]);

/**
 * Evaluate relative luminance from sRGB.
 * @returns Relative luminance, between [0, 1].
 */
const relativeLuminance = (srgb: number[]) => {
  return dot(
    map(srgb, val => srgb2linearRgb(val), 3),
    [0.2126, 0.7152, 0.0722]
  ) / COLOR_MAXES.rgb;
};

/**
 * Returns the contrast ratio which is defined by WCAG 2.1.
 */
export const getContrastRatio = (hex1: string, hex2: string) => {
  const lum1 = relativeLuminance(hex2rgb(hex1));
  const lum2 = relativeLuminance(hex2rgb(hex2));
  const ratio = (lum1 + 0.05) / (lum2 + 0.05);
  return round(ratio < 1 ? 1 / ratio : ratio, 3);
};



/**
 * Infomations about color space.
 */
export type ColorSpaceInfos = {
  /**
   * Name of channels
   */
  labels: readonly string[];
  /**
   * Range of each channels.
   * If type of `range` is [number, number], it means [min, max].
   * If type of `range` is number, it means the maximum, [0, range].
   */
  range: readonly (number | readonly [number, number])[],
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
/**
 * Return labels(name of channels), range, converter(from RGB to space),
 * and inverter(to RGB)
 */
export const getSpaceInfos = (
  space: ColorSpace | string
): ColorSpaceInfos => {
  if (typeof space === 'object') space = space.name_;
  switch (space) {
  case 'HSL':
    return {
      labels: ['Hue', 'Saturation', 'Luminance'],
      range: COLOR_MAXES.hsl,
      converter: rgb2hsl,
      inverter: hsl2rgb,
    };
  case 'HSB': // hsb = hsv
    return {
      labels: ['Hue', 'Saturation', 'Brightness'],
      range: COLOR_MAXES.hsl,
      converter: rgb2hsb,
      inverter: hsb2rgb,
    };
  case 'HWB':
    return {
      labels: ['Hue', 'Whiteness', 'Blackness'],
      range: COLOR_MAXES.hsl,
      converter: rgb2hwb,
      inverter: hwb2rgb,
    };
  case 'CMYK':
    return {
      labels: ['Cyan', 'Magenta', 'Yellow', 'Black'],
      range: map(4, () => COLOR_MAXES.cmyk),
      converter: rgb2cmyk,
      inverter: cmyk2rgb,
    };
  case 'CIEXYZ':
    return {
      labels: ['X', 'Y', 'Z'],
      range: COLOR_MAXES.xyz,
      converter: rgb2xyz,
      inverter: xyz2rgb,
    };
  case 'CIELAB':
    return {
      labels: ['L*', 'a*', 'b*'],
      range: COLOR_MAXES.lab,
      converter: rgb2lab,
      inverter: lab2rgb,
    };
  case 'CIELUV':
    return {
      labels: ['L*', 'u*', 'v*'],
      range: COLOR_MAXES.luv,
      converter: rgb2luv,
      inverter: luv2rgb,
    };
  case 'CIELCH(ab)':
    return {
      labels: ['L*', 'C*', 'h'],
      range: COLOR_MAXES.lch,
      converter: rgb2lchab,
      inverter: lchab2rgb,
    };
  case 'CIELCH(uv)':
    return {
      labels: ['L*', 'C*', 'h'],
      range: COLOR_MAXES.lch,
      converter: rgb2lchuv,
      inverter: lchuv2rgb,
    };
  case 'YUV':
    return {
      labels: ['Y', 'U', 'V'],
      range: map(3, () => COLOR_MAXES.yuv),
      converter: rgb2yuv,
      inverter: yuv2rgb,
    };
  default: // "rgb" and "name"
    return {
      labels: ['Red', 'Green', 'Blue'],
      range: map(3, () => COLOR_MAXES.rgb),
      converter: (x) => [...x],
      inverter: (x) => [...x],
    };
  }
};


// # Generator
/**
 * Generate an RGB color.
 * @return [R, G, B]
 */
export const randRgbGen = () => map(3, () => randInt(COLOR_MAXES.rgb));


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
  const isSupport_ = space.isSupport_;
  const { inverter, range } = getSpaceInfos(space);
  /**
   * Range of space in specific axis (channel).
   */
  const [min, max] = (
    typeof range[axis] === 'number' ?
      [0, range[axis]] :
      [...range[axis]]
  );
  const unitIncreament = (max - min) / steps;
  const arr = [...color];
  let grads: string[];
  if (isSupport_) {
    grads = map(
      steps + 1,
      (_, i) => {
        arr.splice(axis, 1, min + i * unitIncreament);
        return `${getColorFunction(arr, space)} ${frac2percentage(i, steps)}`;
      }
    );
  } else {
    grads = map(
      steps + 1,
      (_, i) => {
        arr.splice(axis, 1, min + i * unitIncreament);
        return `${getColorFunction(inverter(arr), COLOR_SPACES[0])} ${frac2percentage(i, steps)}`;
      }
    );
  }
  return `linear-gradient(${deg}, ${grads.join(', ')})`;
};
