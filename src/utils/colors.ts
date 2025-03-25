import NamedColor from '@/assets/NamedColor.json';
import { map, forLoop } from './helpers';
import { clip, dot, mod, randInt, round, toPercent, l2DistSq, cartesian2polar, polar2cartesian } from './numeric';


// # Constants
/**
 * Matrix factors for sRGB to CIE XYZ.
 * Observer. = 2°, Illuminant = D65
 */
export const RGB2XYZ_COEFF = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.0721750],
  [0.0193339, 0.1191920, 0.9503041],
] as const;
/**
 * Matrix factors for CIE XYZ to sRGB.
 * Observer. = 2°, Illuminant = D65
 */
export const XYZ2RGB_COEFF = [
  [ 3.2404542, -1.5371385, -0.4985314],
  [-0.9692660,  1.8760108,  0.0415560],
  [ 0.0556434, -0.2040259,  1.0572252],
] as const;

/**
 * [0.95047, 1, 1.08883]
 * Observer. = 2°, Illuminant = D65
 */
export const RGB2XYZ_COEFF_ROW_SUM = map(
  RGB2XYZ_COEFF,
  row => forLoop(
    row,
    (acc, val) => acc + val,
    0
  )
);
/** Scaling XYZ values when convering from rgb. */
export const XYZ_MAX_SCALING = 100;

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
      name_: 'CIELCH',
      css_: 'lch'
    },
    {
      name_: 'YUV',
    },
  ] as ColorSpace[];
  for (const space of spaces) {
    space.css_ ??= space.name_.toLowerCase();
    space.isSupport_ = CSS.supports('color', `${space.css_}(0 0 0)`);
  }
  return Object.freeze(spaces);
})();


// Ranges of channels for each color space.
/**
 * The keys are `COLOR_SPACES.css_`
 */
export const COLOR_MAXES = Object.freeze({
  rgb: 255,
  hsl: [360, 100, 100] as const,
  hsb: [360, 100, 100] as const,
  hwb: [360, 100, 100] as const,
  cmyk: 100,
  xyz: map(RGB2XYZ_COEFF_ROW_SUM, val => XYZ_MAX_SCALING * val) as readonly number[],
  lab: [100, [-125, 125], [-125, 125]] as const,
  lch: [100, 100, 360] as const,
  yuv: 255
});
// export const COLOR_MAXES.rgb = 255;
// /**
//  * Maximum of HSL, HSB, and HWB spaces.
//  */
// export const COLOR_MAXES.hsl = [360, 100, 100] as const; // unit: [deg, %, %]
// export const COLOR_MAXES.cmyk = 100; // unit: %
// export const COLOR_MAXES.xyz = map(RGB2XYZ_COEFF_ROW_SUM, val => XYZ_MAX_SCALING * val);
// export const COLOR_MAXES.lab = [100, [-125, 125], [-125, 125]] as const;
// export const COLOR_MAXES.lch = [100, 100, 360] as const; // unit: [%, %, deg]
// export const YUV_MAX = COLOR_MAXES.rgb;


// # Helpers
/** Remove Non-hex characters */
export const removeNonHex = (str: string) => str.replace(/[^0-9A-F]/ig, '');

const hexMatcher = /^#?(([0-9A-F]{3}){1,2})$/i;
/**
 * Verify the string whether is a (3 channel, no alpha channel) Hex color.
 * @param str String that need to be verified.
 * @return Validity of string.
 */
export const isValidHex = (str: string): boolean => {
  return hexMatcher.test(str);
};

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

export const hueRotation = ([h, s, b]: number[], deg: number) => (
  [mod(h + deg, 360), s, b]
);

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
 * Conver Hex to grayscale.
 * @param rgb Array of RGB color.
 * @return grayscale [0, COLOR_MAXES.rgb]
 */
export const rgb2gray = (rgb: number[]) => dot(rgb, [0.299, 0.587, 0.114]);

/**
 * Evaluate relative luminance from sRGB.
 */
const relativeLuminance = (srgb: number[]) => {
  const linear = map(srgb, val => srgb2linearRgb(val), 3);
  return dot(linear, [0.2126, 0.7152, 0.0722]) / COLOR_MAXES.rgb;
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


// # CSS named-color
/**
 * Add a white space before capital letters except the first letter.
 */
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
/**
 * Convert CIE XYZ to CIE Lab.
 * @param xyz CIE XYZ color array.
 * @return CIE Lab color array.
 */
type xyz2lab = (xyz: number[]) => number[];
/**
 * Convert CIE Lab to CIE XYZ.
 * @param lab CIE Lab color array.
 * @return CIE XYZ color array.
 */
type lab2xyz = (lab: number[]) => number[];
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
    return val > thresh ? Math.cbrt(val) : (scaling * val + bias);
  };
  /**
   * Function that be used in the transformation of CIE LAB to CIE XYZ.
   * The function maps [4/29, 1] into [0, 1]
   */
  const labFuncInv = (val: number) => {
    return val > threshInv ? val ** 3 : ((val - bias) / scaling);
  };

  const xyz2lab: xyz2lab = (xyz: number[]): number[] => {
    const f0 = labFunc(xyz[0] / COLOR_MAXES.xyz[0]),
      f1 = labFunc(xyz[1] / COLOR_MAXES.xyz[1]),
      f2 = labFunc(xyz[2] / COLOR_MAXES.xyz[2]);
    return [
      116 * f1 - 16,
      500 * (f0 - f1),
      200 * (f1 - f2)
    ];
  };

  const lab2xyz: lab2xyz = (lab: number[]): number[] => {
    const c1 = (lab[0] + 16) / 116,
      c2 = lab[1] / 500,
      c3 = lab[2] / 200;
    return [
      labFuncInv(c1 + c2) * COLOR_MAXES.xyz[0],
      labFuncInv(c1) * COLOR_MAXES.xyz[1],
      labFuncInv(c1 - c3) * COLOR_MAXES.xyz[2],
    ];
  };
  return [xyz2lab, lab2xyz];
})();
export { xyz2lab, lab2xyz };

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

// ## RGB <-> HSL
/**
 * Convert RGB to HSL.
 * @param rgb RGB color array.
 * @return [hue, sat, lum]
 */
export const rgb2hsl = (rgb: number[]): number[] => {
  const [hue, min, max] = rgb2hue(rgb);
  const lum = (max + min) / (2 * COLOR_MAXES.rgb);
  let sat = 0;
  if (max !== min) {
    sat = (max - min) / (1 - Math.abs(2 * lum - 1)) / COLOR_MAXES.rgb;
  }
  return [hue, COLOR_MAXES.hsl[1] * sat, COLOR_MAXES.hsl[2] * lum];
};
/**
 * Convert HSL to RGB.
 * @param hsl HSL array.
 * @return RGB color array.
 */
export const hsl2rgb = ([hue, sat, lum]: number[]): number[] => {
  hue /= 60;
  sat /= COLOR_MAXES.hsl[1];
  lum /= COLOR_MAXES.hsl[2];
  if (sat === 0) {
    return [lum * COLOR_MAXES.rgb, lum * COLOR_MAXES.rgb, lum * COLOR_MAXES.rgb];
  }

  const C = (1 - Math.abs(2 * lum - 1)) * sat;
  const X = C * (1 - Math.abs(hue % 2 - 1));
  const m = lum - C / 2;

  // if-else case. Only 14% speed.
  hue = Math.floor(hue) % 6; // %6 for 360deg
  return [
    ([C, X, 0, 0, X, C][hue] + m) * COLOR_MAXES.rgb,
    ([X, C, C, X, 0, 0][hue] + m) * COLOR_MAXES.rgb,
    ([0, 0, X, C, C, X][hue] + m) * COLOR_MAXES.rgb,
  ];
};

// ## RGB <-> HSB
/**
 * Convert RGB to HSB.
 * @param rgb RGB color array.
 * @return [hue, sat, brightness].
 */
export const rgb2hsb = (rgb: number[]): number[] => {
  const [hue, min, max] = rgb2hue(rgb);
  const sat = max ? ((max - min) / max) : 0;
  const bri = max / COLOR_MAXES.rgb;
  return [hue, COLOR_MAXES.hsl[1] * sat, COLOR_MAXES.hsl[2] * bri];
};
/**
 * Convert HSB to RGB.
 * @param hsb HSB color array.
 * @return RGB color array.
 */
export const hsb2rgb = ([hue, sat, bri]: number[]): number[] => {
  hue /= 60;
  sat /= COLOR_MAXES.hsl[1];
  bri /= COLOR_MAXES.hsl[2];
  if (sat === 0) {
    return[bri * COLOR_MAXES.rgb, bri * COLOR_MAXES.rgb, bri * COLOR_MAXES.rgb];
  }
  // Consts
  const C = sat * bri;
  const X = C * (1 - Math.abs(hue % 2 - 1));
  const m = bri - C;

  // if-else case. Only 14% speed.
  hue = Math.floor(hue) % 6;
  return [
    ([C, X, 0, 0, X, C][hue] + m) * COLOR_MAXES.rgb,
    ([X, C, C, X, 0, 0][hue] + m) * COLOR_MAXES.rgb,
    ([0, 0, X, C, C, X][hue] + m) * COLOR_MAXES.rgb,
  ];
};

// ## HWB <-> HSB
/**
 * Convert HWB to HSB.
 */
export const hwb2hsb = (hwb: number[]) => {
  return [
    hwb[0],
    hwb[2] === COLOR_MAXES.hsl[2] ? 0 :
      COLOR_MAXES.hsl[1] * (1 - hwb[1] / (COLOR_MAXES.hsl[2] - hwb[2])),
    COLOR_MAXES.hsl[2] * (1 - hwb[2] / COLOR_MAXES.hsl[2])
  ];
};


// ## RGB <-> HWB
/**
 * Convert RGB to HWB.
 * @param rgb RGB color array.
 * @return [hue, whiteness, blackness].
 */
export const rgb2hwb = (rgb: number[]): number[] => {
  const [hue, min, max] = rgb2hue(rgb);
  return [
    hue,
    min * COLOR_MAXES.hsl[1] / COLOR_MAXES.rgb,
    (COLOR_MAXES.rgb - max) * COLOR_MAXES.hsl[2] / COLOR_MAXES.rgb];
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

// ## RGB <-> CMYK
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
    (1 - r / max) * COLOR_MAXES.cmyk,
    (1 - g / max) * COLOR_MAXES.cmyk,
    (1 - b / max) * COLOR_MAXES.cmyk,
    (1 - max / COLOR_MAXES.rgb) * COLOR_MAXES.cmyk
  ];
};
/**
 * Convert CMY to RGB.
 * @param cmyk CMY color array.
 * @return RGB color array.
 */
export const cmy2rgb = ([c, m, y]: number[]): number[] => {
  return [
    COLOR_MAXES.rgb - c * COLOR_MAXES.rgb / COLOR_MAXES.cmyk,
    COLOR_MAXES.rgb - m * COLOR_MAXES.rgb / COLOR_MAXES.cmyk,
    COLOR_MAXES.rgb - y * COLOR_MAXES.rgb / COLOR_MAXES.cmyk
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
      clip(c + k, 0, COLOR_MAXES.cmyk),
      clip(m + k, 0, COLOR_MAXES.cmyk),
      clip(y + k, 0, COLOR_MAXES.cmyk),
    ]
  );
};

// ## RGB <-> CIE XYZ
/**
 * Convert RGB to CIE XYZ.
 * @param rgb RGB color array.
 * @return CIE XYZ color array. The result will be scaling to [0, 100]
 */
export const rgb2xyz = (rgb: number[]): number[] => {
  const linearRgb = map(rgb, val => srgb2linearRgb(val), 3),
    coeff = XYZ_MAX_SCALING / COLOR_MAXES.rgb;
  return [
    dot(RGB2XYZ_COEFF[0], linearRgb) * coeff,
    dot(RGB2XYZ_COEFF[1], linearRgb) * coeff,
    dot(RGB2XYZ_COEFF[2], linearRgb) * coeff,
  ];
};
/**
 * Convert CIE XYZ to RGB.
 * @param xyz RGB color array.
 * @return RGB color array.
 */
export const xyz2rgb = (xyz: number[]): number[] => {
  const coeff = COLOR_MAXES.rgb / XYZ_MAX_SCALING;
  return map(
    XYZ2RGB_COEFF,
    (row) => linearRgb2srgb(clip(dot(row, xyz) * coeff, 0, COLOR_MAXES.rgb))
  );
};

// ## RGB <-> CIE Lab
/**
 * Convert RGB to CIE Lab.
 * @param rgb RGB color array.
 * @return CIE Lab color array.
 */
export const rgb2lab = (rgb: number[]): number[] => {
  return xyz2lab(rgb2xyz(rgb));
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
 * Convert RGB to CIE Lch.
 * @param rgb RGB color array.
 * @return CIE Lch color array.
 */
export const rgb2lch = (rgb: number[]): number[] => {
  return lab2lch(xyz2lab(rgb2xyz(rgb)));
};
/**
 * Convert CIE Lch to RGB.
 * @param lch CIE Lch color array.
 * @return RGB color array.
 */
export const lch2rgb = (lch: number[]): number[] => {
  return xyz2rgb(lab2xyz(lch2lab(lch)));
};

// ## RGB <-> YUV
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
/**
 * Convert YUV to sRGB.
 * @param yuv YUV color array.
 * @return sRGB color array.
 */
export const yuv2rgb = (yuv: number[]) => {
  const pre = map(yuv, (val, i) => val - (i&&128), 3); // bias
  return [
    clip(dot([1,-0.00093, 1.401687], pre), 0, COLOR_MAXES.rgb),
    clip(dot([1,-0.3437, -0.71417 ], pre), 0, COLOR_MAXES.rgb),
    clip(dot([1, 1.77216, 0.00099 ], pre), 0, COLOR_MAXES.rgb)
  ];
};

// ## Hex
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
  const hexMatch = hexMatcher.exec(hex);
  if (!hexMatch) return [0, 0, 0];

  hex = hexMatch[1];
  if (hexMatch && hex.length === 3)
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


// ## Transformation wrap
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
  case 'CIELCH':
    return {
      labels: ['L*', 'C*', 'h'],
      range: COLOR_MAXES.lch,
      converter: rgb2lch,
      inverter: lch2rgb,
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
export const randRgbGen = (): number[] =>
  map(3, () => randInt(COLOR_MAXES.rgb));

/**
 * Generate a linear gradient along an axis for a given color and space.
 * TODO: color function隨空間改變，而不是固定為hex
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
    colors: number[],
    axis: number,
    space: ColorSpace,
  ) => {
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
