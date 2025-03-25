import { COLOR_MAXES } from '../colors';
import { map } from '../helpers';

/**
 * Convert RGB to CMYK.
 * @param rgb RGB color array.
 * @return CMYK color array.
 */
export const rgb2cmyk = (rgb: number[]): number[] => {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  return [
    (1 - r / max) * COLOR_MAXES.cmyk,
    (1 - g / max) * COLOR_MAXES.cmyk,
    (1 - b / max) * COLOR_MAXES.cmyk,
    (1 - max / COLOR_MAXES.rgb) * COLOR_MAXES.cmyk
  ];
};

/**
 * Convert CMYK to RGB.
 * @param cmyk CMYK color array.
 * @return RGB color array.
 */
export const cmyk2rgb = (cmyk: number[]): number[] => {
  return map(
    cmyk,
    (val) =>
      COLOR_MAXES.rgb *
        (1 - val/COLOR_MAXES.cmyk) *
        (1 - cmyk[3]/COLOR_MAXES.cmyk),
    3
  );
};
