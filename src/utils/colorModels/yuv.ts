import { COLOR_MAXES, rgb2gray } from '../colors';
import { map } from '../helpers';
import { clip, dot } from '../numeric';


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
