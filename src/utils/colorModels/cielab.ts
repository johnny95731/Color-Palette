import { COLOR_MAXES } from '../colors';
import { rgb2xyz, xyz2rgb } from './ciexyz';

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
