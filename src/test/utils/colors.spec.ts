import { describe, expect, test } from 'vitest';
import { COLOR_MAXES, COLOR_SPACES, getClosestNamed, getSpaceInfos, hex2rgb, hueRotation, isValidHex, linearRgb2srgb, rgb2hex, srgb2linearRgb, unzipCssNamed } from '@/utils/colors';
import { clip, randInt, round } from '@/utils/numeric';
import NamedColor from '@/assets/NamedColor.json';
import { getContrastAdjuster } from '@/utils/manipulate/contrast';


const stdRgbs: number[][] = [
  [0, 0, 0],
  [COLOR_MAXES.rgb, COLOR_MAXES.rgb, COLOR_MAXES.rgb],
  [COLOR_MAXES.rgb, 0, 0],
  [0, COLOR_MAXES.rgb, 0],
  [0, 0, COLOR_MAXES.rgb],
];

describe('hex', () => {
  test('stability', () => {
    const cases = [
      '#000000',
      '#FFFFFF',
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#00FFFF',
      '#FF00FF',
      '#F00000',
      '#0F0000',
      '#000F00',
      '#0000F0',
      '#00000F',
    ] as const;
    for (const hex of cases) {
      const rgb = hex2rgb(hex);
      const preimage = rgb2hex(rgb);
      expect(
        preimage,
        `${hex} is not stable`
      )
        .toBe(hex);
      expect(
        hex2rgb(preimage),
        `[${rgb.join(',')}] is not stable`
      )
        .toEqual(rgb);
    }
  });
  test('isValidHex', () => {
    const cases = [
      ['#000', true],
      ['#fff', true],
      ['000', true],
      ['fff', true],
      ['00a0', false],
      ['ffsfdf', false],
      ['fg48t4ghf', false],
      ['fffa8d', true],
    ] as const;
    for (const [hex, expect_] of cases) {
      expect(
        isValidHex(hex),
        `${hex} is ${expect_ ? '' : 'in'}valid, but get ${!expect_}`
      )
        .toBe(expect_);
    }
  });
});

describe('Space transform stability', () => {
  for (const space of COLOR_SPACES) {
    test(`space ${space}`, () => {
      const errorMsgs: string[] = [];
      const { converter, inverter } = getSpaceInfos(space);
      for (const rgb of stdRgbs) {
        const spaceColor = inverter(converter(rgb)).map(val => round(val));
        for (let i = 0;i < 3; i++) {
          if (Math.abs(spaceColor[i] - rgb[i]) > 1) {
            errorMsgs.push(
              `[${rgb}] is not stable: ${spaceColor}`
            );
            break;
          }
        }
      }
      expect(errorMsgs, errorMsgs.join('. ')).toHaveLength(0);
    });
  }
});

describe('CSS named-color', () => {
  test('unzipCssNamed function', () => {
    const cases = {
      TestCase: 'Test Case',
      testcase: 'testcase',
      testCase: 'test Case',
    } as const;
    for (const [key, val] of Object.entries(cases))
      expect(unzipCssNamed(key), `${key} should be ${val}`).toBe(val);
    for (const name of Object.keys(NamedColor)) {
      const result = unzipCssNamed(name).replaceAll(' ', '');
      expect(result, `${result} should be ${name}`).toBe(name);
    }
  });

  test('stability of `getClosestNamed`', () => {
    for (const [name, hex] of Object.entries(NamedColor)) {
      getClosestNamed(hex2rgb(hex))
        .then(result => {
          expect(result, `${result} should be ${name}`).toBe(name);
        });
    }
  });
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
