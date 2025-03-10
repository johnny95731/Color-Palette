import NamedColor from '@/assets/NamedColor.json';
import { clip, dot, mod, randInt, rangeMapping, round, toPercent, l2DistSq, cartesian2polar } from './numeric';
import { map, forLoop } from './helpers';
import {
  RGB_MAX, HSL_MAX, HWB_MAX, HSB_MAX, CMY_MAX, CMYK_MAX, XYZ_MAX, LAB_MAX,
  RGB2XYZ_COEFF_ROW_SUM, XYZ2RGB_COEFF, RGB2XYZ_COEFF, XYZ_MAX_SCALING,
  YUV_MAX, CONTRAST_METHODS, HARMONY_METHODS
} from '@/constants/colors.ts';
import type { ColorSpaces, ColorSpaceInfos, ContrastMethods, HarmonyMethods } from '@/types/colors';

// # CSS named-color
export const unzipCssNamed = (name: string) => name.replace(/([A-Z])/g, ' $1').trim();

/**
 * All names of CSS <named-color> (removed synonym name) with sapce between words.
 */
export const unzipedNameList = map(
  Object.keys(NamedColor),
  (name) => unzipCssNamed(name)
);


/**
 * Find the closet named-color.
 */
export const getClosestNamed = async (rgb: number[]): Promise<keyof typeof NamedColor> => {
  let minDist = Infinity;
  let dist: number;
  let closest: keyof typeof NamedColor;
  // cache this may increase 20%-30% ops/sec
  for (const [key, hex] of Object.entries(NamedColor)) {
    dist = l2DistSq(rgb, hex2rgb(hex));
    if (dist < minDist) {
      closest = key as keyof typeof NamedColor;
      minDist = dist;
    }
  }
  // @ts-expect-error `minDist` is init to be `Infinity`. Thus closest will be assigned value.
  return closest;
};

/**
 * Get rgb values of CSS <named-color> by index of .json file
 */
export const getNamedColorRgb = (name: string): number[] => {
  return hex2rgb(NamedColor[name as keyof typeof NamedColor] ?? 'fff');
};

// # Transformations
// ## Helpers
/**
 * Convert sRGB to linear RGB.
 * Maps [0, RGB_MAX] into [0, RGB_MAX]
 */
export const srgb2linearRgb = (srgb: number[]) => {
  const t = 0.04045 * RGB_MAX;
  return map(
    srgb,
    (val) => val < t ?
      val / 12.92 :
      ((val/RGB_MAX+0.055) / 1.055)**2.4 * RGB_MAX,
    3
  );
};

/**
 * Convert linear RGB to sRGB.
 * Maps [0, RGB_MAX] into [0, RGB_MAX]
 */
export const linearRgb2srgb = (linearRgb: number[]) => {
  const t = 0.0031308 * RGB_MAX;
  const p = 1 / 2.4;
  return map(
    linearRgb,
    (val) => val < t ?
      val * 12.92 :
      ((val/RGB_MAX)**p * 1.055 - 0.055) * RGB_MAX,
    3
  );
};

/**
 * Calculate hue (H channel of HSL/HSB) from rgb. Also, returns minimum and
 * maximum of rgb.
 * @param rgb RGB array.
 * @return [hue, min(r,g,b), max(r,g,b)].
 */
export const rgb2hue = ([r, g, b]: number[]): number[] => {
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

export const [labFunc, labFuncInv] = (() => {
  const thresh = (6/29) ** 3; // threshold
  const scaling = 7.787; // = 1 / (3 * LAB_DELTA**2)
  const bias = 4 / 29; // = 16 / 116
  /**
   * Function that be used in the transformation of CIE XYZ to CIE LAB.
   * The function maps [0, 1] into [4/29, 1]
   */
  const labFunc = (val: number): number => {
    return val > thresh ? val ** (1/3) : scaling * val + bias;
  };
  /**
   * Function that be used in the transformation of CIE LAB to CIE XYZ.
   * The function maps [4/29, 1] into [0, 1]
   */
  const labFuncInv = (val: number) => {
    return val**3 > thresh ? val ** 3 : (val - bias) / scaling;
  };
  return [labFunc, labFuncInv];
})();


// ## CIE LAB <-> CIE XYZ
/**
 * Convert CIE XYZ to CIE LAB.
 * @param xyz CIE XYZ color array.
 * @return CIE LAB color array.
 */
const xyz2lab = (xyz: number[]): number[] => {
  const fValues = map(
    xyz,
    (val, i) =>
      labFunc(val / (XYZ_MAX_SCALING * RGB2XYZ_COEFF_ROW_SUM[i])),
    3
  );
  return [
    116 * fValues[1] - 16,
    500 * (fValues[0] - fValues[1]),
    200 * (fValues[1] - fValues[2])
  ];
};

/**
 * Convert CIE LAB to CIE XYZ (scaling to `XYZ_MAX`)
 * @param lab CIE XYZ color array.
 * @return CIE LAB color array.
 */
const lab2xyz = (lab: number[]): number[] => {
  const pre = [ // preprocessing
    (lab[0] + 16) / 116, // range: [16/116 = 4/29, 1]
    // rangeMapping(lab[1], ...LAB_MAX[1], ...diffOf2labFunc),
    // rangeMapping(lab[2], ...LAB_MAX[1], ...diffOf2labFunc),
    lab[1] / 500,
    lab[2] / 200
  ];
  const beforeScaled = [ // values in labFuncInv is variable `fValue` in function `xyz2lab`.
    labFuncInv(pre[0] + pre[1]) ,
    labFuncInv(pre[0]),
    labFuncInv(pre[0] - pre[2]),
  ];
  return map(
    beforeScaled,
    (val, i) => {
      return val * XYZ_MAX_SCALING * RGB2XYZ_COEFF_ROW_SUM[i];
    },
    3
  );
};

// ## CIE LAB <-> CIE LCH
export const lab2lch = ([l, a, b]: number[]): number[] => {
  const { radius: c, deg: h } = cartesian2polar(b, a);
  return [l, c, h];
};


// ## RGB to other spaces.
/**
 * Conver Hex to grayscale.
 * @param rgb Array of RGB color.
 * @return grayscale [0, RGB_Max]
 */
export const rgb2gray = (rgb: number[]) => dot(rgb, [0.299, 0.587, 0.114]);

/**
 * Convert RGB to HSL.
 * @param rgb RGB color array.
 * @return [hue, sat, lum]
 */
const rgb2hsl = (rgb: number[]): number[] => {
  const [hue, min, max] = rgb2hue(rgb);
  const lum = (max + min) / (2 * RGB_MAX);
  let sat = 0;
  if (max !== min) {
    sat = (max - min) / (1 - Math.abs(2 * lum - 1)) / RGB_MAX;
  }
  return [hue, HSL_MAX[1] * sat, HSL_MAX[2] * lum];
};

/**
 * Convert RGB to HSB.
 * @param rgb RGB color array.
 * @return [hue, sat, brightness].
 */
export const rgb2hsb = (rgb: number[]): number[] => {
  const [hue, min, max] = rgb2hue(rgb);
  const sat = max ? ((max - min) / max) : 0;
  const bri = max / RGB_MAX;
  return [hue, HSB_MAX[1] * sat, HSB_MAX[2] * bri];
};

/**
 * Convert RGB to HWB.
 * @param rgb RGB color array.
 * @return [hue, whiteness, blackness].
 */
const rgb2hwb = (rgb: number[]): number[] => {
  const [hue, min, max] = rgb2hue(rgb);
  return [
    hue,
    min * HWB_MAX[1] / RGB_MAX,
    (RGB_MAX - max) * HWB_MAX[2] / RGB_MAX];
};

/**
 * Convert RGB to CMY.
 * @param rgb RGB color array.
 * @return CMYK color array.
 */
const rgb2cmy = (rgb: number[]): number[] => {
  return map(
    rgb,
    (val) => (RGB_MAX - val) * CMY_MAX / RGB_MAX,
    3
  );
};

/**
 * Convert RGB to CMYK.
 * @param rgb RGB color array.
 * @return CMYK color array.
 */
const rgb2cmyk = (rgb: number[]): number[] => {
  const cmyk = rgb2cmy(rgb);
  const k = Math.min(...cmyk);
  for (let i = 0; i < 3; i++) cmyk[i] -= k;
  cmyk.push(k);
  return cmyk;
};
/**
 * Convert RGB to CIE XYZ.
 * @param rgb RGB color array.
 * @return CIE XYZ color array. The result will be scaling to [0, 100]
 */
const rgb2xyz = (rgb: number[]): number[] => {
  const linearRgb = srgb2linearRgb(rgb);
  return map(
    RGB2XYZ_COEFF,
    (row) => {
      return dot(row, linearRgb) * XYZ_MAX_SCALING / RGB_MAX;
    }
  );
};

/**
 * Convert RGB to CIE LAB.
 * @param rgb RGB color array.
 * @return CIE LAB color array.
 */
export const rgb2lab = (rgb: number[]): number[] => {
  return xyz2lab(rgb2xyz(rgb));
};

/**
 * Convert RGB to YUV.
 * @param rgb RGB color array.
 * @return YUV color array.
 */
const rgb2yuv = (rgb: number[]) => [
  rgb2gray(rgb),
  dot([-0.169,-0.331, 0.5  ], rgb) + 128,
  dot([ 0.5,  -0.419,-0.081], rgb) + 128
];


// ## From other space to RGB.
/**
 * Convert HSL to RGB.
 * @param hsl HSL array.
 * @return RGB color array.
 */
const hsl2rgb = (hsl: number[]): number[] => {
  if (hsl[1] === 0) {
    return map(
      hsl,
      () => hsl[2] / HSL_MAX[2] * RGB_MAX,
      3
    );
  }
  // Consts
  const C = (1 - Math.abs(2 * hsl[2]/HSL_MAX[2] - 1)) * hsl[1]/HSL_MAX[1];
  const X = C * (1 - Math.abs((hsl[0] / 60) % 2 - 1));
  const m = hsl[2]/HSL_MAX[2] - C / 2;
  const angleLevel = hsl[0] / 60;
  // Convert (Note: The formula can reduce.)
  let rgbPrime: [number, number, number];
  if (angleLevel < 1) rgbPrime = [C, X, 0];
  else if (angleLevel < 2) rgbPrime = [X, C, 0];
  else if (angleLevel < 3) rgbPrime = [0, C, X];
  else if (angleLevel < 4) rgbPrime = [0, X, C];
  else if (angleLevel < 5) rgbPrime = [X, 0, C];
  else rgbPrime = [C, 0, X];
  return map(rgbPrime, val => RGB_MAX * (val + m));
};


// To RGB.
/**
 * Convert HSB to RGB.
 * @param hsb HSB color array.
 * @return RGB color array.
 */
export const hsb2rgb = (hsb: number[]): number[] => {
  if (hsb[1] === 0) {
    return map(
      hsb,
      () => hsb[2] / HSL_MAX[2] * RGB_MAX,
      3
    );
  }
  // Consts
  const C = hsb[1]/HSB_MAX[1] * hsb[2]/HSB_MAX[2];
  const X = C * (1 - Math.abs((hsb[0]/60) % 2 - 1));
  const m = hsb[2]/HSB_MAX[1] - C;
  const angleLevel = hsb[0] / 60;
  // Convert. (Note formula can reduce.)
  let rgbPrime;
  if (angleLevel < 1) rgbPrime = [C, X, 0];
  else if (angleLevel < 2) rgbPrime = [X, C, 0];
  else if (angleLevel < 3) rgbPrime = [0, C, X];
  else if (angleLevel < 4) rgbPrime = [0, X, C];
  else if (angleLevel < 5) rgbPrime = [X, 0, C];
  else rgbPrime = [C, 0, X];
  return map(rgbPrime, val => RGB_MAX * (val + m));
};


/**
 * Convert HWB to HSB.
 */
const hwb2hsb = (hwb: number[]) => {
  return [
    hwb[0],
    hwb[2] === HWB_MAX[2] ? 0 :
      HSB_MAX[1] * (1 - hwb[1] / (HWB_MAX[2] - hwb[2])),
    HSB_MAX[2] * (1 - hwb[2] / HWB_MAX[2])
  ];
};

/**
 * Convert HWB to RGB.
 * @param hwb HWB color array.
 * @return RGB color array.
 */
const hwb2rgb = (hwb: number[]): number[] => {
  // eslint-disable-next-line
  let [h, w, b] = hwb;
  if (w + b > 100) [w, b] = [100 * w / (w+b), 100 * b / (w+b)];
  return hsb2rgb(hwb2hsb([h,w,b]));
};

/**
 * Convert CMY to RGB.
 * @param cmyk CMY color array.
 * @return RGB color array.
 */
const cmy2rgb = (cmy: number[]): number[] => {
  const scalingCoeff = RGB_MAX / CMY_MAX;
  return map(cmy, val => RGB_MAX - val * scalingCoeff, 3);
};

/**
 * Convert CMYK to RGB.
 * @param cmyk CMYK color array.
 * @return RGB color array.
 */
const cmyk2rgb = (cmyk: number[]): number[] => {
  return cmy2rgb(
    map(
      cmyk,
      (val) => clip(val + cmyk[3], 0, CMY_MAX),
      3
    )
  );
};
/**
 * Convert CIE XYZ to RGB.
 * @param xyz RGB color array.
 * @return RGB color array.
 */
const xyz2rgb = (xyz: number[]): number[] => {
  const scaling = RGB_MAX / XYZ_MAX_SCALING;
  const linearRgb = map(
    XYZ2RGB_COEFF,
    (row) => clip(dot(row, xyz) * scaling, 0, RGB_MAX)
  );
  return linearRgb2srgb(linearRgb);
};

/**
 * Convert CIE LAB to RGB.
 * @param lab CIE LAB color array.
 * @return RGB color array.
 */
const lab2rgb = (lab: number[]): number[] => {
  return xyz2rgb(lab2xyz(lab));
};

/**
 * Convert YUV to sRGB.
 * @param yuv YUV color array.
 * @return sRGB color array.
 */
const yuv2rgb = (yuv: number[]) => {

  const pre = map(yuv, (val, i) => val - (i&&128), 3); // bias
  return [
    clip(dot([1,-0.00093, 1.401687], pre), 0, RGB_MAX),
    clip(dot([1,-0.3437, -0.71417 ], pre), 0, RGB_MAX),
    clip(dot([1, 1.77216, 0.00099 ], pre), 0, RGB_MAX)
  ];
};

// ## Hex
/** Remove Non-hex characters */
const removeNonHex = (str: string) => str.replace(/[^0-9A-F]/ig, '');

/**
 * Convert RGB to Hex.
 * @param rgb RGB color array.
 * @return Hex color.
 */
export const rgb2hex = (rgb: number[]): string => {
  return forLoop(
    rgb,
    (prev, val) => prev + (round(val) < 16 ? 0 : '') + round(val).toString(16),
    '#',
    3
  ).toUpperCase();
};

/**
 * Convert Hex color to RGB color.
 * @param hex Hex color string. Note that this function will not hex hex is valid or not.
 * @return rgb
 */
export const hex2rgb = (hex: string): number[] => {
  hex = removeNonHex(hex);
  if (hex.length === 3)
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
};

export const hsb2hex = (hsb: number[]) => {
  return rgb2hex(hsb2rgb(hsb));
};

export const hex2hsb = (hex: string) => {
  return rgb2hsb(hex2rgb(hex));
};

export const hex2lab = (hex: string) => {
  return rgb2lab(hex2rgb(hex));
};

/**
 * Verify the string whether is a (3 channel, no alpha channel) Hex color.
 * @param str String that need to be verified.
 * @return Validity of string.
 */
export const isValidHex = (str: string): boolean =>
  [3, 6].includes(removeNonHex(str).length);


// ## Transformation wrap
/**
 * Return labels(name of channels), range, converter(from RGB to space),
 * and inverter(to RGB)
 */
export const getSpaceInfos = (
  space: ColorSpaces
): ColorSpaceInfos => {
  switch (space) {
  case 'hsl':
    return {
      labels: ['Hue', 'Saturation', 'Luminance'],
      range: [...HSL_MAX],
      converter: rgb2hsl,
      inverter: hsl2rgb,
    };
  case 'hsb': // hsb = hsv
    return {
      labels: ['Hue', 'Saturation', 'Brightness'],
      range: [...HSB_MAX],
      converter: rgb2hsb,
      inverter: hsb2rgb,
    };
  case 'hwb':
    return {
      labels: ['Hue', 'Whiteness', 'Blackness'],
      range: [...HWB_MAX],
      converter: rgb2hwb,
      inverter: hwb2rgb,
    };
  case 'cmy':
    return {
      labels: ['Cyan', 'Magenta', 'Yellow'],
      range: [CMY_MAX, CMY_MAX, CMY_MAX],
      converter: rgb2cmy,
      inverter: cmy2rgb,
    };
  case 'cmyk':
    return {
      labels: ['Cyan', 'Magenta', 'Yellow', 'Black'],
      range: [CMYK_MAX, CMYK_MAX, CMYK_MAX, CMYK_MAX],
      converter: rgb2cmyk,
      inverter: cmyk2rgb,
    };
  case 'xyz':
    return {
      labels: ['X', 'Y', 'Z'],
      range: [...XYZ_MAX],
      converter: rgb2xyz,
      inverter: xyz2rgb,
    };
  case 'lab':
    return {
      labels: ['L*', 'a*', 'b*'],
      range: JSON.parse(JSON.stringify(LAB_MAX)),
      converter: rgb2lab,
      inverter: lab2rgb,
    };
  case 'yuv':
    return {
      labels: ['Y', 'U', 'V'],
      range: [YUV_MAX, YUV_MAX, YUV_MAX],
      converter: rgb2yuv,
      inverter: yuv2rgb,
    };
  default: // "rgb" and "name"
    return {
      labels: ['Red', 'Green', 'Blue'],
      range: [RGB_MAX, RGB_MAX, RGB_MAX],
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
export const randRgbGen = (): number[] =>
  map(3, () => randInt(RGB_MAX));

/**
 * Generate a linear gradient along an axis for a given color and space.
 */
export const gradientGen = (() => {
  /**
   * Segment the gradient into several part. The Gradient in different space may
   * not work as expect. So we join multiple gradient
   * For example, red -> green -> blue contains two parts of gradient,
   * red to green and green to blue.
   */
  const steps = 8;
  return (
    colors: number[], axis: number, space: ColorSpaces,
  ) => {
    const { inverter } = getSpaceInfos(space);
    const { range } = getSpaceInfos(space);
    /**
     * Range of space in specific axis (channel).
     */
    const [min, max] = (
      typeof range[axis] === 'number' ?
        [0, range[axis]] :
        [...range[axis]]
    );
    const unitIncreament = (max - min) / steps;
    const arr = [...colors];
    const grads = map(
      steps + 1,
      (_, i) => {
        arr.splice(axis, 1, min + i * unitIncreament);
        return `${rgb2hex(inverter(arr))} ${toPercent(i/steps)}%`;
      }
    );
    return `linear-gradient(90deg, ${grads.join(', ')})`;
  };
})();


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
        val => clip(val * c, 0, RGB_MAX)
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
  const normalizeCoeff = RGB_MAX ** (1 - gamma);
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
    [YUV_MAX, 0]
  );
  const sqrtMinY = Math.sqrt(minY);

  return map(
    yuvs,
    yuv => {
      yuv[0] = rangeMapping(yuv[0], minY, maxY, sqrtMinY, YUV_MAX);
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


// # Harmony
// ## Hue harmony
export const hueRotation = ([h, s, b]: number[], deg: number) => (
  [mod(h + deg, 360), s, b]
);

/**
 * Generate a harmony palette from a primary color (in HSB).
 * The hues of palette are [
 *   primary, primary + start, primary + start + increment,
 *   primary + start + 2 * increment, ...
 * ]
 * @param primaryHsb Primary color in HSB space.
 * @param start The first increasing amout of hue in degree.
 * @param increment The increment of degree after second color.
 * @param num Color numbers (including primary).
 * @returns
 */
function harmonize(primaryHsb: number[], start: number, increment: number, num: number) {
  // start from 1 'cause first color is primary color.
  return forLoop(
    num - 1,
    (prev) => {
      prev.push(hueRotation(primaryHsb, start));
      start += increment;
      return prev;
    },
    [primaryHsb]
  );
}

/**
 * 2 colors.
 * Secondary color is complementary color (+180 deg in hue)
 **/
const complement = (primaryHsb: number[]) => harmonize(primaryHsb, 180, 180, 2);
/**
 * 3 colors.
 * Generate analogous colors (+-30 deg in hue) of complementary color
 */
const split = (primaryHsb: number[]) => harmonize(primaryHsb, 150, 60, 3);
/**
 * 3 colors divided hue wheel equally (120 deg).
 */
const triad = (primaryHsb: number[]) => harmonize(primaryHsb, 120, 120, 3);
/**
 * 4 colors divided hue wheel equally (90 deg).
 */
const square = (primaryHsb: number[]) => harmonize(primaryHsb, 90, 90, 4);
/**
 * 3 colors.
 * The difference of hue to primary is +-30deg.
 */
const analogous = (primaryHsb: number[]) => {
  return [
    primaryHsb,
    hueRotation(primaryHsb, 30), // secondary color
    hueRotation(primaryHsb,-30), // tertiary
  ];
};
/**
 * 4 colors.
 * Primary, its complement, and their clockwise analogous in different side of hue wheel.
 * Or, equivalentlly, primary, its clockwise analogous, and their complement.
 */
const tetrad = (primaryHsb: number[]) => {
  const colors = complement(primaryHsb);
  colors.push(...complement(hueRotation(primaryHsb, 30)));
  return colors;
};
/**
 * 4 colors.
 * Primary, its complement, and their analogous in same side of hue wheel.
 */
const compound = (primaryHsb: number[]) => {
  const colors = complement(primaryHsb);
  colors.push(hueRotation(primaryHsb, 30));
  colors.push(hueRotation(colors[1], -30));
  return colors;
};

// ## Saturation/Brightness harmony
/**
 * Generate gradient that decreasing in brightness.
 */
const shades = (primaryHsb: number[], num: number = 6) => {
  const [h,s,b] = primaryHsb;
  const step = b / num;
  return map(
    num,
    (_, i) => [h, s, b - i * step],
  );
};

/**
 * Generate gradient that decreasing in saturation.
 */
const tints = (primaryHsb: number[], num: number = 6) => {
  const [h,s,b] = primaryHsb;
  const step = s / num;
  return map(
    num,
    (_, i) => [h, s - i * step, b],
  );
};

/**
 * Generate gradient that decreasing in both saturation and brightness.
 */
const tones = (primaryHsb: number[], num: number = 6) => {
  const [h,s,b] = primaryHsb;
  const stepSat = s / num;
  const stepBri = b / num;

  return map(
    num,
    (_, i) => [h, s - i * stepSat, b - i * stepBri],
  );
};

/**
 * Get the harmony palette generator of specific method.
 */
export const getHarmonize = (method: HarmonyMethods) => {
  if (method === HARMONY_METHODS[0]) return analogous;
  if (method === HARMONY_METHODS[1]) return shades;
  if (method === HARMONY_METHODS[2]) return tints;
  if (method === HARMONY_METHODS[3]) return tones;
  if (method === HARMONY_METHODS[4]) return triad;
  if (method === HARMONY_METHODS[5]) return complement;
  if (method === HARMONY_METHODS[6]) return split;
  if (method === HARMONY_METHODS[7]) return tetrad;
  if (method === HARMONY_METHODS[8]) return square;
  if (method === HARMONY_METHODS[9]) return compound;
  return compound;
};
