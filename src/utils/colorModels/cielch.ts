import { cartesian2polar, polar2cartesian } from '../numeric';
import { lab2xyz, xyz2lab } from './cielab';
import { rgb2xyz, xyz2rgb } from './ciexyz';



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
