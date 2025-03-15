import NamedColor from '@/assets/NamedColor.json';
import { clip, dot, mod, randInt, rangeMapping, round, toPercent, l2DistSq, cartesian2polar, polar2cartesian } from './numeric';
import { map, forLoop } from './helpers';
import {
  RGB_MAX, HSL_MAX, CMY_MAX, XYZ_MAX, LAB_MAX, XYZ2RGB_COEFF, RGB2XYZ_COEFF, XYZ_MAX_SCALING, YUV_MAX, CONTRAST_METHODS
} from '@/constants/colors.ts';
import type { ColorSpaces, ColorSpaceInfos, ContrastMethods } from '@/types/colors';


// # Utils
export const hueRotation = ([h, s, b]: number[], deg: number) => (
  [mod(h + deg, 360), s, b]
);


// # CSS named-color
export const unzipCssNamed = (name: string) => name.replace(/([A-Z])/g, ' $1').trim();

/**
 * All names of CSS <named-color> (removed synonym name) with sapce between words.
 */
export const unzipedNameList = map(
  Object.keys(NamedColor),
  (name) => unzipCssNamed(name)
);


const cacheNameRgb: [string, number[]][] = [];
/**
 * Find the closet named-color.
 */
export const getClosestNamed = async (
  rgb: number[]
): Promise<keyof typeof NamedColor> => {
  if (!cacheNameRgb.length) {
    for (const [key, hex] of Object.entries(NamedColor)) {
      cacheNameRgb.push([key, hex2rgb(hex)]);
    }
  }
  let minDist = Infinity;
  let dist: number;
  let closest: keyof typeof NamedColor;
  for (let i = 0; i < cacheNameRgb.length; i++) {
    dist = l2DistSq(rgb, cacheNameRgb[i][1]);
    if (dist < minDist) {
      closest = cacheNameRgb[i][0] as keyof typeof NamedColor;
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
export const srgb2linearRgb = (() => {
  const t = 0.04045 * RGB_MAX;
  return (val: number) => {
    return val < t ?
      val / 12.92 :
      ((val/RGB_MAX+0.055) / 1.055)**2.4 * RGB_MAX;
  };
})();

/**
 * Convert linear RGB to sRGB.
 * Maps [0, RGB_MAX] into [0, RGB_MAX]
 */
export const linearRgb2srgb = (() => {
  const t = 0.0031308 * RGB_MAX;
  const p = 1 / 2.4;
  return (val: number) => {
    return val < t ?
      val * 12.92 :
      ((val/RGB_MAX)**p * 1.055 - 0.055) * RGB_MAX;
  };
})();

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


// ## CIE LAB <-> CIE XYZ
const [xyz2lab, lab2xyz] = (() => {
  const threshInv = 6/29; // threshold for labFuncInv
  const thresh = threshInv ** 3; // threshold for labFunc
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
    return val > threshInv ? val ** 3 : (val - bias) / scaling;
  };

  /**
   * Convert CIE XYZ to CIE Lab.
   * @param xyz CIE XYZ color array.
   * @return CIE Lab color array.
   */
  const xyz2lab = (xyz: number[]): number[] => {
    const f0 = labFunc(xyz[0] / XYZ_MAX[0]),
      f1 = labFunc(xyz[1] / XYZ_MAX[1]),
      f2 = labFunc(xyz[2] / XYZ_MAX[2]);
    return [
      116 * f1 - 16,
      500 * (f0 - f1),
      200 * (f1 - f2)
    ];
  };

  /**
   * Convert CIE Lab to CIE XYZ.
   * @param lab CIE Lab color array.
   * @return CIE XYZ color array.
   */
  const lab2xyz = (lab: number[]): number[] => {
    const c1 = (lab[0] + 16) / 116,
      c2 = lab[1] / 500,
      c3 = lab[2] / 200;
    return [
      labFuncInv(c1 + c2) * XYZ_MAX[0],
      labFuncInv(c1) * XYZ_MAX[1],
      labFuncInv(c1 - c3) * XYZ_MAX[2],
    ];
  };
  return [xyz2lab, lab2xyz];
})();

// ## CIE LAB <-> CIE LCH
export const lab2lch = (lab: number[]): number[] => {
  const [l, a, b] = lab;
  const polar = cartesian2polar(b, a);
  return [l, polar.radius, polar.deg];
};

export const lch2lab = (lch: number[]): number[] => {
  const [l, c, h] = lch;
  const cart = polar2cartesian(c, h);
  return [l, cart.x, cart.y];
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
export const rgb2hsl = (rgb: number[]): number[] => {
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
  return [hue, HSL_MAX[1] * sat, HSL_MAX[2] * bri];
};

/**
 * Convert RGB to HWB.
 * @param rgb RGB color array.
 * @return [hue, whiteness, blackness].
 */
export const rgb2hwb = (rgb: number[]): number[] => {
  const [hue, min, max] = rgb2hue(rgb);
  return [
    hue,
    min * HSL_MAX[1] / RGB_MAX,
    (RGB_MAX - max) * HSL_MAX[2] / RGB_MAX];
};

/**
 * Convert RGB to CMY.
 * @param rgb RGB color array.
 * @return CMYK color array.
 */
export const rgb2cmy = (rgb: number[]): number[] => {
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
export const rgb2cmyk = (rgb: number[]): number[] => {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  // 8x faster than map(rgb, fn) and -0.01KB after minified.
  return [
    (1 - r / max) * CMY_MAX,
    (1 - g / max) * CMY_MAX,
    (1 - b / max) * CMY_MAX,
    (1 - max / RGB_MAX) * CMY_MAX
  ];
};
/**
 * Convert RGB to CIE XYZ.
 * @param rgb RGB color array.
 * @return CIE XYZ color array. The result will be scaling to [0, 100]
 */
export const rgb2xyz = (rgb: number[]): number[] => {
  const linearRgb = map(rgb, val => srgb2linearRgb(val)),
    coeff = XYZ_MAX_SCALING / RGB_MAX;
  return [
    dot(RGB2XYZ_COEFF[0], linearRgb) * coeff,
    dot(RGB2XYZ_COEFF[1], linearRgb) * coeff,
    dot(RGB2XYZ_COEFF[2], linearRgb) * coeff,
  ];
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
export const rgb2yuv = (rgb: number[]) => [
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
export const hsl2rgb = ([hue, sat, lum]: number[]): number[] => {
  hue /= 60;
  sat /= HSL_MAX[1];
  lum /= HSL_MAX[2];
  if (sat === 0) {
    return [lum * RGB_MAX, lum * RGB_MAX, lum * RGB_MAX];
  }
  // Consts
  const C = (1 - Math.abs(2 * lum - 1)) * sat;
  const X = C * (1 - Math.abs(hue % 2 - 1));
  const m = lum - C / 2;

  hue = Math.floor(hue) % 6;
  return [
    ([C, X, 0, 0, X, C][hue] + m) * RGB_MAX,
    ([X, C, C, X, 0, 0][hue] + m) * RGB_MAX,
    ([0, 0, X, C, C, X][hue] + m) * RGB_MAX,
  ];
  // if-else case. Only 14% speed.
  // let rgbPrime: [number, number, number];
  // if (h < 1) rgbPrime = [C, X, 0];
  // else if (h < 2) rgbPrime = [X, C, 0];
  // else if (h < 3) rgbPrime = [0, C, X];
  // else if (h < 4) rgbPrime = [0, X, C];
  // else if (h < 5) rgbPrime = [X, 0, C];
  // else rgbPrime = [C, 0, X];
  // return map(rgbPrime, val => RGB_MAX * (val + m));
};


// To RGB.
/**
 * Convert HSB to RGB.
 * @param hsb HSB color array.
 * @return RGB color array.
 */
export const hsb2rgb = ([hue, sat, bri]: number[]): number[] => {
  hue /= 60;
  sat /= HSL_MAX[1];
  bri /= HSL_MAX[2];
  if (sat === 0) {
    return[bri * RGB_MAX, bri * RGB_MAX, bri * RGB_MAX];
  }
  // Consts
  const C = sat * bri;
  const X = C * (1 - Math.abs(hue % 2 - 1));
  const m = bri - C;
  hue = Math.floor(hue) % 6;
  return [
    ([C, X, 0, 0, X, C][hue] + m) * RGB_MAX,
    ([X, C, C, X, 0, 0][hue] + m) * RGB_MAX,
    ([0, 0, X, C, C, X][hue] + m) * RGB_MAX,
  ];
  // if-else case. Only 14% speed.
  // let rgbPrime;
  // if (angleLevel < 1) rgbPrime = [C, X, 0];
  // else if (angleLevel < 2) rgbPrime = [X, C, 0];
  // else if (angleLevel < 3) rgbPrime = [0, C, X];
  // else if (angleLevel < 4) rgbPrime = [0, X, C];
  // else if (angleLevel < 5) rgbPrime = [X, 0, C];
  // else rgbPrime = [C, 0, X];
  // return map(rgbPrime, val => RGB_MAX * (val + m));
};


/**
 * Convert HWB to HSB.
 */
export const hwb2hsb = (hwb: number[]) => {
  return [
    hwb[0],
    hwb[2] === HSL_MAX[2] ? 0 :
      HSL_MAX[1] * (1 - hwb[1] / (HSL_MAX[2] - hwb[2])),
    HSL_MAX[2] * (1 - hwb[2] / HSL_MAX[2])
  ];
};

/**
 * Convert HWB to RGB.
 * @param hwb HWB color array.
 * @return RGB color array.
 */
export const hwb2rgb = (hwb: number[]): number[] => {
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
export const cmy2rgb = ([c, m, y]: number[]): number[] => {
  return [
    RGB_MAX - c * RGB_MAX / CMY_MAX,
    RGB_MAX - m * RGB_MAX / CMY_MAX,
    RGB_MAX - y * RGB_MAX / CMY_MAX
  ];
};

/**
 * Convert CMYK to RGB.
 * @param cmyk CMYK color array.
 * @return RGB color array.
 */
export const cmyk2rgb = ([c, m, y, k]: number[]): number[] => {

  return cmy2rgb(
    [
      clip(c + k, 0, CMY_MAX),
      clip(m + k, 0, CMY_MAX),
      clip(y + k, 0, CMY_MAX),
    ]
  );
};
/**
 * Convert CIE XYZ to RGB.
 * @param xyz RGB color array.
 * @return RGB color array.
 */
export const xyz2rgb = (xyz: number[]): number[] => {
  const coeff = RGB_MAX / XYZ_MAX_SCALING;
  return map(
    XYZ2RGB_COEFF,
    (row) => linearRgb2srgb(clip(dot(row, xyz) * coeff, 0, RGB_MAX))
  );
};

/**
 * Convert CIE LAB to RGB.
 * @param lab CIE LAB color array.
 * @return RGB color array.
 */
export const lab2rgb = (lab: number[]): number[] => {
  return xyz2rgb(lab2xyz(lab));
};

/**
 * Convert YUV to sRGB.
 * @param yuv YUV color array.
 * @return sRGB color array.
 */
export const yuv2rgb = (yuv: number[]) => {

  const pre = map(yuv, (val, i) => val - (i&&128), 3); // bias
  return [
    clip(dot([1,-0.00093, 1.401687], pre), 0, RGB_MAX),
    clip(dot([1,-0.3437, -0.71417 ], pre), 0, RGB_MAX),
    clip(dot([1, 1.77216, 0.00099 ], pre), 0, RGB_MAX)
  ];
};

// ## Hex
/** Remove Non-hex characters */
export const removeNonHex = (str: string) => str.replace(/[^0-9A-F]/ig, '');

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
  const hexMatch = /^#([0-9a-f]{3,6})$/i.exec(hex);
  if (!hexMatch) return [0, 0, 0];

  hex = hexMatch[1];
  if (hexMatch && hex.length === 4)
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  // .slice is slower
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
      range: [...HSL_MAX],
      converter: rgb2hsb,
      inverter: hsb2rgb,
    };
  case 'hwb':
    return {
      labels: ['Hue', 'Whiteness', 'Blackness'],
      range: [...HSL_MAX],
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
      range: [CMY_MAX, CMY_MAX, CMY_MAX, CMY_MAX],
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
