import { describe, expect, test } from 'vitest';
import { COLOR_MAXES, COLOR_SPACES, getSpaceInfos, hueRotation, linearRgb2srgb, srgb2linearRgb } from '@/utils/colors';
import { clip, randInt, round } from '@/utils/numeric';
import { getContrastAdjuster } from '@/utils/manipulate/contrast';


const stdRgbs: number[][] = [
  [0, 0, 0],
  [COLOR_MAXES.rgb, COLOR_MAXES.rgb, COLOR_MAXES.rgb],
  [COLOR_MAXES.rgb, 0, 0],
  [0, COLOR_MAXES.rgb, 0],
  [0, 0, COLOR_MAXES.rgb],
];

describe('Space transform stability', () => {
  for (const space of COLOR_SPACES) {
    test(`space ${space.name_}`, () => {
      const errorMsgs: string[] = [];
      const { converter, inverter } = getSpaceInfos(space);
      for (const rgb of stdRgbs) {
        const spaceColor = inverter(converter(rgb)).map(val => round(val));
        for (let i = 0;i < 3; i++) {
          if (Math.abs(spaceColor[i] - rgb[i]) > 1) {
            errorMsgs.push(
              `[${rgb}] is not stable: [${spaceColor}]\n`
            );
            break;
          }
        }
      }
      expect(errorMsgs, errorMsgs.join('. ')).toHaveLength(0);
    });
  }
});

describe('linear rgb', () => {
  test('srgb2linearRgb', () => {
    const cases = [
      [0, 0],
      [COLOR_MAXES.rgb, COLOR_MAXES.rgb],
    ] as const;
    for (const [args, expect_] of cases) {
      const result = srgb2linearRgb(args);
      expect(result).toBeCloseTo(expect_);
    }
  });
  test('linearRgb2srgb', () => {
    const cases = [
      [0, 0],
      [COLOR_MAXES.rgb, COLOR_MAXES.rgb],
    ] as const;
    for (const [args, expect_] of cases) {
      const result = linearRgb2srgb(args);
      expect(result).toBeCloseTo(expect_);
    }
  });
  test('stability', () => {
    const testNum = 500;
    for (let i = 0; i < testNum; i++) {
      const original = Math.random() * COLOR_MAXES.rgb;
      const linear = srgb2linearRgb(original);
      const back2Original = linearRgb2srgb(linear);
      const linear2 = srgb2linearRgb(back2Original);
      const cases = [
        original,
        linear,
        back2Original,
        linear2,
      ];
      for (let k = 0; k < 2; k++) {
        expect(cases[k]).toBeCloseTo(cases[k+2]);
      }
    }
  });
});


test('getContrastAdjuster("linear")', () => {
  const converter = getContrastAdjuster('linear');
  expect(converter(stdRgbs, 1)).toStrictEqual(stdRgbs);
  for (const rgb of stdRgbs) {
    const factor = randInt(3);
    const newRgb = converter([rgb], factor)[0];
    for (let i = 0; i < 3; i++)
      expect(newRgb[i]).toBeCloseTo(clip(rgb[i] * factor, 0, COLOR_MAXES.rgb));
  }
});

test('getContrastAdjuster("gamma")', () => {
  const converter = getContrastAdjuster('gamma');
  expect(converter(stdRgbs, 1)).toStrictEqual(stdRgbs);
});

test('hueRotation', () => {
  const cases = [
    [[0, 90], 90],
    [[359, 90], 89],
    [[0, -90], 270],
    [[90, -90], 0],
    [[90, -180], 270],
  ] as const;
  for (const [[hue, deg], expect_] of cases) {
    expect(hueRotation([hue,0,0], deg)[0]).toBe(expect_);
  }
});
