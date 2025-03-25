import NamedColor from '@/assets/NamedColor.json';
import { map } from '../helpers';
import { l2DistSq } from '../numeric';
import { hex2rgb } from './hex';

/**
 * Add a white space before capital letters except the first letter.
 */
export const unzipCssNamed = (name: string) => name.replace(/([A-Z])/g, ' $1').trim();

/**
 * All names of CSS <named-color> (removed synonym name) with sapce between words.
 */
export const unzipedNameList = map(
  Object.keys(NamedColor),
  (name) => unzipCssNamed(name)
);


const cacheNameRgb: [string, number[]][] = [];
/**
 * Find the closet named-color.
 */
export const getClosestNamed = async (
  rgb: number[]
): Promise<keyof typeof NamedColor> => {
  if (!cacheNameRgb.length) {
    for (const [key, hex] of Object.entries(NamedColor)) {
      cacheNameRgb.push([key, hex2rgb(hex)]);
    }
  }
  let minDist = Infinity;
  let dist: number;
  let closest: keyof typeof NamedColor;
  for (let i = 0; i < cacheNameRgb.length; i++) {
    dist = l2DistSq(rgb, cacheNameRgb[i][1]);
    if (dist < minDist) {
      closest = cacheNameRgb[i][0] as keyof typeof NamedColor;
      minDist = dist;
    }
  }
  // @ts-expect-error `minDist` is init to be `Infinity`. Thus closest will be assigned value.
  return closest;
};

/**
 * Get rgb values of CSS <named-color> by index of .json file
 */
export const getNamedColorRgb = (name: string): number[] => {
  return hex2rgb(NamedColor[name as keyof typeof NamedColor] ?? 'fff');
};
