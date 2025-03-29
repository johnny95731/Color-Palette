import { COLOR_MAXES } from '../colors';
import { dot } from '../numeric';
import { cieTrans, cieTransInv, rgb2xyz, xyz2rgb, XYZ_MAX_SCALING } from './ciexyz';


/**
 * Convert CIE XYZ to CIE LUV.
 * @param xyz CIE XYZ color array.
 * @return CIE LUV color array.
 */
type xyz2luv = (xyz: number[]) => number[]

/**
 * Convert CIE LUV to CIE XYZ.
 * @param luv CIE LUV color array.
 * @return CIE XYZ color array.
 */
type luv2xyz = (luv: number[]) => number[]


const [xyz2luv, luv2xyz] = (() => {
  const uTransform = (xyz: readonly number[]) => (
    4 * xyz[0] / (xyz[0] + 15 * xyz[1] + 3 * xyz[2])
  );
  const vTransform = (xyz: readonly number[]) => (
    9 * xyz[1] / (xyz[0] + 15 * xyz[1] + 3 * xyz[2])
  );

  const xyz2luv: xyz2luv = (xyz: number[]): number[] => {
    if (!dot(xyz, [1,1,1])) return [0, 0, 0];
    const u0 = uTransform(COLOR_MAXES.xyz);
    const v0 = vTransform(COLOR_MAXES.xyz);
    const L = 116 * cieTrans(xyz[1] / COLOR_MAXES.xyz[1]) - 16;
    return [
      L,
      13 * L * (uTransform(xyz) - u0),
      13 * L * (vTransform(xyz) - v0),
    ];
  };
  const luv2xyz: luv2xyz = (luv: number[]): number[] => {
    if (!luv[0]) return [0, 0, 0];
    const [lum, u, v] = luv;
    const u0 = uTransform(COLOR_MAXES.xyz);
    const v0 = vTransform(COLOR_MAXES.xyz);
    const u_ = u / (13 * lum) + u0;
    const v_ = v / (13 * lum) + v0;
    const Y = cieTransInv((lum + 16) / 116);
    return [
      2.25 * u_ / v_ * Y * XYZ_MAX_SCALING,
      Y * COLOR_MAXES.xyz[1], // X and Z does not be divided by maximums
      (3 - 0.75 * u_ - 5 * v_) / v_ * Y * XYZ_MAX_SCALING,
    ];
  };
  return [xyz2luv, luv2xyz];
})();
export { xyz2luv, luv2xyz };


/**
 * Convert RGB to CIE LUV.
 * @param rgb RGB color array.
 * @return CIE LUV color array.
 */
export const rgb2luv = (rgb: number[]): number[] => {
  return xyz2luv(rgb2xyz(rgb));
};

/**
 * Convert CIE LUV to RGB.
 * @param luv CIE LUV color array.
 * @return RGB color array.
 */
export const luv2rgb = (luv: number[]): number[] => {
  return xyz2rgb(luv2xyz(luv));
};
