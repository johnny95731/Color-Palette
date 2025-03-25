import { COLOR_MAXES, rgb2hue } from '../colors';

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
