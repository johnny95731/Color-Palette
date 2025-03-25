import { COLOR_MAXES, rgb2hue } from '../colors';
import { hsb2rgb } from './hsb';

/**
 * Convert HWB to HSB.
 */
export const hwb2hsb = (hwb: number[]) => {
  return [
    hwb[0],
    hwb[2] === COLOR_MAXES.hsb[2] ? 0 :
      COLOR_MAXES.hsb[1] * (1 - hwb[1] / (COLOR_MAXES.hsb[2] - hwb[2])),
    COLOR_MAXES.hsb[2] * (1 - hwb[2] / COLOR_MAXES.hsb[2])
  ];
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
    min * COLOR_MAXES.hsb[1] / COLOR_MAXES.rgb,
    (COLOR_MAXES.rgb - max) * COLOR_MAXES.hsb[2] / COLOR_MAXES.rgb];
};

/**
 * Convert HWB to sRGB.
 * @param hwb HWB color array.
 * @return RGB color array.
 */
export const hwb2rgb = (hwb: number[]): number[] => {
  // eslint-disable-next-line
  let [h, w, b] = hwb;
  if (w + b > 100) [w, b] = [100 * w / (w+b), 100 * b / (w+b)];
  return hsb2rgb(hwb2hsb([h,w,b]));
};
