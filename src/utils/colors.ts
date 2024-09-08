import NamedColor from '@/assets/NamedColor.json';
import { findClosestInHexMap } from './helpers';
import { clip, dot, mod, rangeMapping, round, toPercent } from './numeric';
import {
  RGB_MAX, HSL_MAX, HWB_MAX, HSB_MAX, CMY_MAX, CMYK_MAX, XYZ_MAX, LAB_MAX,
  RGB2XYZ_COEFF_ROW_SUM, XYZ2RGB_COEFF, RGB2XYZ_COEFF, XYZ_MAX_SCALING,
  YUV_MAX,
} from '@/constants/colors.ts';
import type { ColorSpacesType, ColorSpaceInfos, ContrastMethodType } from '@/types/colors';

export const unzipCssNamed = (name: string) => name.replace(/([A-Z])/g, ' $1').trim();

// ### CSS Named
/**
 * All names of CSS <named-color> (removed synonym name) with sapce between words.
 */
export const unzipedNameList = Object.keys(NamedColor).map(
  (name) => unzipCssNamed(name)
);

/**
 * Find the closet named-color.
 */
export const getClosestNamed = async (rgb: number[]): Promise<string> =>
  findClosestInHexMap(rgb, NamedColor);

/**
 * Get rgb values of CSS <named-color> by index of .json file
 */
export const getNamedColorRgb = (name: string): number[] => {
  return hex2rgb(NamedColor[name as keyof typeof NamedColor] ?? 'fff');
};


// LAB
const [labFunc, labFuncInv] = (() => {
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

/**
 * Convert CIE XYZ to CIE LAB.
 * @param xyz CIE XYZ color array.
 * @return CIE LAB color array.
 */
const xyz2lab = (xyz: number[]): number[] => {
  const fValues = xyz.map((val, i) =>
    labFunc(val / (XYZ_MAX_SCALING * RGB2XYZ_COEFF_ROW_SUM[i]))
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
  return [ // values in labFuncInv is variable `fValue` in function `xyz2lab`.
    labFuncInv(pre[0] + pre[1]) ,
    labFuncInv(pre[0]),
    labFuncInv(pre[0] - pre[2]),
  ].map((val, i) => val * XYZ_MAX_SCALING * RGB2XYZ_COEFF_ROW_SUM[i]);
};


// ### Convert from RGB to other spaces.
/**
 * Convert RGB to Hex.
 * @param rgb RGB color array.
 * @return Hex color.
 */
export const rgb2hex = (rgb: number[]): string => {
  return rgb.reduce(
    (prev, val) => prev + round(val).toString(16).padStart(2, '0'), '#'
  ).toUpperCase();
};

/**
 * Conver Hex to grayscale.
 * @param rgb Array of RGB color.
 * @return grayscale [0, RGB_Max]
 */
export const rgb2gray = (() => {
  const RGB_2_GRAY_COEFF = [0.299, 0.587, 0.114];
  return (rgb: number[]): number => {
    return rgb.reduce((cummul, val, i) => cummul += val * RGB_2_GRAY_COEFF[i], 0);
  };
})();

/**
 * Convert sRGB to linear RGB.
 * Maps [0, RGB_MAX] into [0, RGB_MAX]
 */
const srgb2linearRgb = (srgb: number[]) => {
  return srgb.map(val =>
    val/RGB_MAX < 0.04045 ?
      val / 12.92 :
      ((val/RGB_MAX+0.055) / 1.055)**2.4 * RGB_MAX
  );
};

const linearRgb2srgb = (srgb: number[]) => {
  return srgb.map(val =>
    val < 0.798 ?
      val * 12.92 :
      ((val/RGB_MAX)**0.42 * 1.055 - 0.055) * RGB_MAX
  );
};

/**
 * Calculate hue (H channel of HSL/HSB) from rgb. Also, returns minimum and
 * maximum of rgb.
 * @param rgb RGB array.
 * @return [hue, min(r,g,b), max(r,g,b)].
 */
const rgb2hue = (rgb: number[]): number[] => {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue;
  switch (max) {
  case min:
    hue = 0;
    break;
  case r:
    hue = mod(((g - b) / delta), 6);
    break;
  case g:
    hue = (b - r) / delta + 2;
    break;
  default: // case b:
    hue = (r - g) / delta + 4;
  }
  return [60 * hue, min, max];
};

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
const rgb2hsb = (rgb: number[]): number[] => {
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
  const scalingCoeff = CMY_MAX / RGB_MAX;
  return rgb.map((val) => (RGB_MAX - val) * scalingCoeff);
};

/**
 * Convert RGB to CMYK.
 * @param rgb RGB color array.
 * @return CMYK color array.
 */
const rgb2cmyk = (rgb: number[]): number[] => {
  const cmy = rgb2cmy(rgb);
  const k = Math.min(...cmy);
  const cmyk = cmy.map(val => val - k);
  cmyk.push(k);
  return cmyk;
};
/**
 * Convert RGB to CIE XYZ.
 * @param rgb RGB color array.
 * @return CIE XYZ color array. The result will be scaling to [0, 100]
 */
const rgb2xyz = (rgb: number[]): number[] => {
  const scaling = XYZ_MAX_SCALING / RGB_MAX;
  const linearRgb = srgb2linearRgb(rgb);
  return RGB2XYZ_COEFF.map((row) => dot(row, linearRgb) * scaling);
};

/**
 * Convert RGB to CIE LAB.
 * @param rgb RGB color array.
 * @return CIE LAB color array.
 */
const rgb2lab = (rgb: number[]): number[] => {
  return xyz2lab(rgb2xyz(rgb));
};

/**
 * Convert RGB to YUV.
 * @param rgb RGB color array.
 * @return YUV color array.
 */
const rgb2yuv = (() => {
  const matrix = [
    [ 0.299, 0.587, 0.114],
    [-0.169,-0.331, 0.5  ],
    [ 0.5,  -0.419,-0.081]
  ];
  return (rgb: number[]): number[] => {
    return matrix
      .map(row => dot(row, rgb))
      .map((val, i) => val + (i&&128)); // [0, 128, 128]
  };
})();


// ### Convert From other space to RGB.
/**
 * Convert HSL to RGB.
 * @param hsl HSL array.
 * @return RGB color array.
 */
const hsl2rgb = (hsl: number[]): number[] => {
  if (hsl[1] === 0) {
    return hsl.map(() => hsl[2] / HSB_MAX[2] * RGB_MAX);
  }
  const temp = [...hsl];
  // Normalize to [0, 1].
  temp[1] /= HSL_MAX[1];
  temp[2] /= HSL_MAX[2];
  // Consts
  const C = (1 - Math.abs(2 * temp[2] - 1)) * temp[1];
  const X = C * (1 - Math.abs((temp[0] / 60) % 2 - 1));
  const m = temp[2] - C / 2;
  // Convert (Note: The formula can reduce.)
  let rgbPrime;
  if (temp[0] < 60) rgbPrime = [C, X, 0];
  else if (temp[0] < 120) rgbPrime = [X, C, 0];
  else if (temp[0] < 180) rgbPrime = [0, C, X];
  else if (temp[0] < 240) rgbPrime = [0, X, C];
  else if (temp[0] < 300) rgbPrime = [X, 0, C];
  else rgbPrime = [C, 0, X];
  return rgbPrime.map((val) => round(RGB_MAX * (val + m), 2));
};


// To RGB.
/**
 * Convert HSB to RGB.
 * @param hsb HSB color array.
 * @return RGB color array.
 */
const hsb2rgb = (hsb: number[]): number[] => {
  if (hsb[1] === 0) {
    return hsb.map(() => hsb[2] / HSB_MAX[2] * RGB_MAX);
  }
  const temp = [...hsb];
  // Normalize to [0, 1].
  temp[1] /= HSB_MAX[1];
  temp[2] /= HSB_MAX[2];
  // Consts
  const C = temp[1] * temp[2];
  const X = C * (1 - Math.abs((temp[0]/60) % 2 - 1));
  const m = temp[2] - C;
  // Convert. (Note: The formula can reduce.)
  let rgbPrime: number[];
  if (temp[0] < 60) rgbPrime = [C, X, 0];
  else if (temp[0] < 120) rgbPrime = [X, C, 0];
  else if (temp[0] < 180) rgbPrime = [0, C, X];
  else if (temp[0] < 240) rgbPrime = [0, X, C];
  else if (temp[0] < 300) rgbPrime = [X, 0, C];
  else rgbPrime = [C, 0, X];
  return rgbPrime.map((val) => round(RGB_MAX * (val + m), 2));
};


/**
 * Convert HWB to HSB.
 */
const hwb2hsb = (hwb: number[]) => {
  return [
    hwb[0],
    HSB_MAX[1] * (1 - hwb[1] / (HWB_MAX[1] - hwb[2])),
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
  if (w + b > HWB_MAX[1]) [w, b] = [HWB_MAX[1] * w / (w+b), HWB_MAX[2] * b / (w+b)];
  return hsb2rgb(hwb2hsb([h,w,b]));
};

/**
 * Convert CMY to RGB.
 * @param cmyk CMY color array.
 * @return RGB color array.
 */
const cmy2rgb = (cmy: number[]): number[] => {
  const scalingCoeff = RGB_MAX / CMY_MAX;
  const rgb = cmy.map((val) => RGB_MAX - val * scalingCoeff);
  return rgb;
};

/**
 * Convert CMYK to RGB.
 * @param cmyk CMYK color array.
 * @return RGB color array.
 */
const cmyk2rgb = (cmyk: number[]): number[] => {
  const cmy = Array.from(
    { length: 3 }, (_, i) => clip(cmyk[i] + cmyk[3], 0, CMY_MAX),
  );
  return cmy2rgb(cmy);
};
/**
 * Convert CIE XYZ to RGB.
 * @param xyz RGB color array.
 * @return RGB color array.
 */
const xyz2rgb = (xyz: number[]): number[] => {
  const scaling = RGB_MAX / XYZ_MAX_SCALING;
  const linearRgb = XYZ2RGB_COEFF.map((row) => {
    return clip(dot(row, xyz) * scaling, 0, RGB_MAX);
  });
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
const yuv2rgb = (() => {
  const matrix = [
    [1,-0.00093, 1.401687],
    [1,-0.3437, -0.71417 ],
    [1, 1.77216, 0.00099 ]
  ];
  return (yuv: number[]): number[] => {
    const pre = yuv.map((val, i) => val - (i&&128));
    return matrix.map(row => clip(dot(row, pre), 0, RGB_MAX));

  };
})();

const removeNonHex = (str: string) => str.replace(/[^0-9A-F]/ig, '');

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

// Validator
/**
 * Verify the string whether is a (3 channel, no alpha channel) Hex color.
 * @param str String that need to be verified.
 * @return Validity of string.
 */
export const isValidHex = (str: string): boolean =>
  [3, 6].includes(removeNonHex(str).length);

/**
 * Return labels(name of channels), range, converter(from RGB to space),
 * and inverter(to RGB)
 */
export const getSpaceInfos = (
  space: ColorSpacesType
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
      converter: (x) => Array.from(x),
      inverter: (x) => Array.from(x),
    };
  }
};


// ### Color distance


// ### Harmonie palatte generators


// ### Generators
/**
 * Generate an RGB color.
 * @return [R, G, B]
 */
export const randRgbGen = (): number[] =>
  [0,0,0].map(() => Math.floor(Math.random() * (RGB_MAX + 1)));

/**
 * Generate a linear gradient along an axis for a given color and space.
 */
export const gradientGen = (() => {
  /**
   * S
   */
  const steps = 8;
  return (
    colors: number[], axis: number, space: ColorSpacesType,
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
    const grads: string[] = [];
    const arr = [...colors];
    for (let j = 0; j < steps+1; j++) {
      arr.splice(axis, 1, min + j * unitIncreament);
      grads.push(`${rgb2hex(inverter(arr))} ${toPercent(j/steps)}%`);
    }
    // arr.splice(axis, 1, max);
    // grads.push(`${rgb2hex(inverter(arr))} 100%`);
    return `linear-gradient(90deg, ${grads.join(', ')})`;
  };
})();


// ### Adjusts contrast.
/**
 * Scale ths values of RGB.
 * @param rgbs RGB arrays.
 * @param c Scaling coefficient.
 * @return `rgb` after scaling.
 */
const scaling = (rgbs: number[][], c: number): number[][] => {
  for (let i = 0; i < rgbs.length; i++) {
    for (let j = 0; j < rgbs[i].length; j++) {
      rgbs[i][j] = clip(rgbs[i][j] * c, 0, RGB_MAX);
    }
  }
  return rgbs;
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
  return rgbs.map(
    (arr) => arr.map((val) => normalizeCoeff * (val ** gamma))
  );
};

/**
 * Scaling the range of brightness values of a color array in YUV space to a
 * larger range.
 */
const brightnessScaling = (rgbs: number[][]): number[][] => {
  const yuvs = rgbs.map((rgb) => rgb2yuv(rgb));
  const [minY, maxY] = yuvs.reduce((prev, yuv) => {
    if (yuv[0] < prev[0]) prev[0] = yuv[0];
    if (yuv[0] > prev[1]) prev[1] = yuv[0];
    return prev;
  }, [YUV_MAX, 0]);
  const range = [minY, maxY, Math.sqrt(minY), YUV_MAX] as const;
  yuvs.forEach(yuv => yuv[0] = rangeMapping(yuv[0], ...range));
  return yuvs.map(yuv => yuv2rgb(yuv));
};


export const getContrastAdjuster = (method: ContrastMethodType) => {
  if (method === 'linear') return scaling;
  if (method === 'gamma') return gammaCorrection;
  if (method === 'brightness scaling') return brightnessScaling;
  return brightnessScaling;
};

// ### Sorting
export const sortingByGray = <T extends {hex: string}>(arr: T[]) => {
  const copied = JSON.parse(JSON.stringify(arr)) as T[];
  return copied.sort((a, b) => rgb2gray(hex2rgb(a.hex)) - rgb2gray(hex2rgb(b.hex)));
};
