import { COLOR_MAXES } from '../colors';
import { cieTrans, cieTransInv, rgb2xyz, xyz2rgb } from './ciexyz';

/**
 * Convert CIE XYZ to CIE Lab.
 * @param xyz CIE XYZ color array.
 * @return CIE Lab color array.
 */
export const xyz2lab = (xyz: number[]): number[] => {
  const f0 = cieTrans(xyz[0] / COLOR_MAXES.xyz[0]),
    f1 = cieTrans(xyz[1] / COLOR_MAXES.xyz[1]),
    f2 = cieTrans(xyz[2] / COLOR_MAXES.xyz[2]);
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
export const lab2xyz = (lab: number[]): number[] => {
  const c1 = (lab[0] + 16) / 116,
    c2 = lab[1] / 500,
    c3 = lab[2] / 200;
  return [
    cieTransInv(c1 + c2) * COLOR_MAXES.xyz[0],
    cieTransInv(c1) * COLOR_MAXES.xyz[1],
    cieTransInv(c1 - c3) * COLOR_MAXES.xyz[2],
  ];
};

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
