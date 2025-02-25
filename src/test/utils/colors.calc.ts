import { calc } from '../calc';
import NamedColor from '@/assets/NamedColor.json';
import { isSameFloat, l2DistSq, mod, rangeMapping, round } from '@/utils/numeric';
import { getClosestNamed, getSpaceInfos, hex2rgb, randRgbGen, rgb2hex, rgb2hue } from '@/utils/colors';
import { COLOR_SPACES, RGB_MAX } from '@/constants/colors';

/* v8 ignore start */

/**
 * Minimum distance between two different css named-color
 */
const namedColorMinDist = () => {
  const keys = Object.keys(NamedColor);
  const rgbs = keys.map(key => hex2rgb(NamedColor[key as keyof typeof NamedColor]));
  let minDist = Infinity;
  for (let i = 0; i < keys.length; i++) {
    for (let j = i+1; j < keys.length; j++) {
      const dist = l2DistSq(rgbs[i], rgbs[j]);
      if (!dist) // two named-color are same
        console.log(keys[i], rgbs[i], keys[j], rgbs[j]);
      if (dist < minDist) {
        minDist = dist;
      }
    }
  }
  return minDist;
};



/** Test average time for getClosestNamed */
const getNamedColorTimeCost = (arrNum: number = 200, loopNum: number = 100) => {
  const rgbs = Array.from({ length: arrNum }, () => randRgbGen());
  const t1 = performance.now();
  for (let i = 0; i < loopNum; i++) {
    for (const rgb of rgbs)
      getClosestNamed(rgb);
  }
  return round((performance.now() - t1) / (loopNum * arrNum), 3);
};

const atan2Deg = (() => {
  const pi2 = 2 * Math.PI;
  return (y: number, x: number) =>
    mod(rangeMapping(Math.atan2(y,x), -pi2, pi2, -360, 360), 360);
})();

/**
 * Test equivalent of 2 ways of hue calculation
 */
const hueEquivalentTest = () => {
  const rgb = randRgbGen();
  const [l,a,b] = getSpaceInfos('lab').converter(rgb);
  const [y,u,v] = getSpaceInfos('yuv').converter(rgb);

  const [hue1] = rgb2hue(rgb);
  const hue2 = atan2Deg(b, a);
  console.log(rgb2hex(rgb));
  console.log(hue1, hue2);
};


const main = () => {
  calc('Min dist between two css named-color', namedColorMinDist);
  calc('Time cost of `getClosestNamed` (ms)', getNamedColorTimeCost, 500, 100);
  // hueEquivalentTest();

  const rangeList = Array.from({ length: RGB_MAX }, (_, i) => i);
  const allRgbs: number[][] = [];
  for (const r of rangeList)
    for (const g of rangeList)
      for (const b of rangeList)
        allRgbs.push([r, g, b]);
  for (const space of COLOR_SPACES) {
    const { converter, inverter } = getSpaceInfos(space);
    if (space !== 'xyz') continue;
    allRgbs.forEach((rgb, i) => {
      const spaceColor = inverter(converter(rgb)).map(val => round(val));
      for (let i = 0;i < 3; i++) {
        if (!isSameFloat(spaceColor[i], rgb[i])) {
          console.log(space, rgb, 'is not stable:', spaceColor);
          break;
        }
      }
    });
  }
};
main();

/* v8 ignore stop */
