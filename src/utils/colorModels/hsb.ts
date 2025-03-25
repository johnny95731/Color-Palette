import { COLOR_MAXES, rgb2hue } from '../colors';


/**
 * Convert RGB to HSB.
 * @param rgb RGB color array.
 * @return [hue, sat, brightness].
 */
export const rgb2hsb = (rgb: number[]): number[] => {
  const [hue, min, max] = rgb2hue(rgb);
  const sat = max ? ((max - min) / max) : 0;
  const bri = max / COLOR_MAXES.rgb;
  return [hue, COLOR_MAXES.hsb[1] * sat, COLOR_MAXES.hsb[2] * bri];
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
