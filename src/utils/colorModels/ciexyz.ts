import { COLOR_MAXES, linearRgb2srgb, srgb2linearRgb } from '../colors';
import { forLoop, map } from '../helpers';
import { clip, dot } from '../numeric';

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

export const XYZ_MAX_SCALING = 100;

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


/**
 * Function that be used in the transformation from CIE XYZ to CIE LAB and to CIE LUV.
 * The function maps [0, 1] into [4/29, 1] and is continuous.
 */
type cieTrans = (xyz: number[]) => number[];

/**
 * Function that be used in the transformation from CIE LAB to CIE XYZ and
 * from CIE LUV to CIE XYZ.
 * The function maps [4/29, 1] into [0, 1]
 */
type cieTransInv = (lab: number[]) => number[];

const [cieTrans, cieTransInv] = (() => {
  const threshInv = 6/29; // threshold for labFuncInv
  const thresh = threshInv ** 3; // threshold for labFunc
  const scaling = 903.3 / 116; // = 1 / (3 * threshInv**2)
  const bias = 4 / 29; // = 16 / 116

  const cieTrans = (val: number): number => {
    return val > thresh ? Math.cbrt(val) : (scaling * val + bias);
  };
  const cieTransInv = (val: number) => {
    return val > threshInv ? val ** 3 : ((val - bias) / scaling);
  };
  return [cieTrans, cieTransInv];
})();
export { cieTrans, cieTransInv };


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
