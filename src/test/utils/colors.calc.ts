import { calc } from '../calc';
import NamedColor from '@/assets/NamedColor.json';
import { forLoop } from '@/utils/helpers';
import { atan2Deg, l2DistSq, round } from '@/utils/numeric';
import { COLOR_MAXES, getSpaceInfos, randRgbGen, rgb2hue } from '@/utils/colors';
import { hex2rgb } from '@/utils/colorModels/hex';
import { getClosestNamed } from '@/utils/colorModels/named';
import { rgb2luv } from '@/utils/colorModels/cieluv';
import { rgb2lab } from '@/utils/colorModels/cielab';

/* v8 ignore start */
const getEnumeratedRgb = () => {
  const rangeList = Array.from({ length: COLOR_MAXES.rgb + 1 }, (_, i) => i);
  const allRgbs: number[][] = [];
  for (const r of rangeList)
    for (const g of rangeList)
      for (const b of rangeList)
        allRgbs.push([r, g, b]);
  return allRgbs;
};

const getEnumeratedXyz = () => {
  const xyzMax = COLOR_MAXES.xyz;
  const all: number[][] = [];
  for (let x = 0; x < xyzMax[0]; x ++)
    for (let y = 0; y < xyzMax[1]; y ++)
      for (let z = 0; z < xyzMax[2]; z ++)
        all.push([x, y, z]);
  all.push([...COLOR_MAXES.xyz]);
  return all;
};

/**
 * Minimum distance between two different css named-color
 */
const findNamedColorMinDist = () => {
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

const findLabMax = () => {
  const RGBs = getEnumeratedRgb();
  const max = [
    -Infinity,
    -Infinity,
    -Infinity,
  ];
  const min = [
    Infinity,
    Infinity,
    Infinity,
  ];
  for (const rgb of RGBs) {
    const luv = rgb2lab(rgb);
    forLoop(
      luv,
      (_, v, i) => {
        if (v > max[i]) max[i] = v;
        if (v < min[i]) min[i] = v;
      }
    );
  }
  console.log('sRGB -> CIELAB');
  console.log(`min: [${min}], max: [${max}]`);
  console.log();
};

const findLuvMax = () => {
  const RGBs = getEnumeratedRgb();
  const max = [
    -Infinity,
    -Infinity,
    -Infinity,
  ];
  const min = [
    Infinity,
    Infinity,
    Infinity,
  ];
  for (const rgb of RGBs) {
    const luv = rgb2luv(rgb);
    forLoop(
      luv,
      (_, v, i) => {
        if (v > max[i]) max[i] = v;
        if (v < min[i]) min[i] = v;
      }
    );
  }
  console.log('sRGB -> CIELUV');
  console.log(`min: [${min}], max: [${max}]`);
  console.log();
};


/**
 * Test equivalent of 2 ways of hue calculation
 */
const hueEquivalentTest = () => {
  const rgb = randRgbGen();
  const [, a, b] = getSpaceInfos('CIELAB').converter(rgb);
  const [, u, v] = getSpaceInfos('YUV').converter(rgb);

  const [hueHsb] = rgb2hue(rgb);
  const hueLab = atan2Deg(b, a);
  const hueYuv = atan2Deg(v, u);
  console.log(`Hue sample: [${rgb}]`);
  console.log(`HSB sys: ${hueHsb}`);
  console.log(`CIELAB sys: ${hueLab}`);
  console.log(`YUV sys: ${hueYuv}`);
  console.log();
};


const main = () => {
  calc('Min dist between two css named-color', findNamedColorMinDist);
  calc('Time cost of `getClosestNamed` (ms)', getNamedColorTimeCost, 500, 100);

  findLabMax();
  findLuvMax();
  hueEquivalentTest();
};
main();
/* v8 ignore stop */
