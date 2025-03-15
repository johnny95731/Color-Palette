import { describe, expect, test } from 'vitest';
import { COLOR_SPACES, getClosestNamed, getSpaceInfos, hex2hsb, hex2rgb, hsb2hex, hueRotation, isValidHex, linearRgb2srgb, rgb2hex, RGB_MAX, srgb2linearRgb, unzipCssNamed } from '@/utils/colors';
import { clip, randInt, round } from '@/utils/numeric';
import NamedColor from '@/assets/NamedColor.json';
import { getContrastAdjuster } from '@/utils/manipulate/contrast';


const stdRgbs: number[][] = [
  [0, 0, 0],
  [RGB_MAX, RGB_MAX, RGB_MAX],
  [RGB_MAX, 0, 0],
  [0, RGB_MAX, 0],
  [0, 0, RGB_MAX],
];


describe('Space transform stability', () => {
  for (const space of COLOR_SPACES) {
    test(`space ${space}`, () => {
      const errorMsgs: string[] = [];
      const { converter, inverter } = getSpaceInfos(space);
      stdRgbs.forEach((rgb) => {
        const spaceColor = inverter(converter(rgb)).map(val => round(val));
        for (let i = 0;i < 3; i++) {
          if (Math.abs(spaceColor[i] - rgb[i]) > 1) {
            errorMsgs.push(
              `[${rgb}] is not stable: ${spaceColor}`
            );
            break;
          }
        }
      });
      expect(errorMsgs, errorMsgs.join('. ')).toHaveLength(0);
    });
  }
});

describe('CSS named-color', () => {
  test('unzipCssNamed function', () => {
    const cases = {
      TestCases: 'Test Cases',
      red: 'red',
      rEd: 'r Ed',
    } as const;
    for (const [key, val] of Object.entries(cases))
      expect(unzipCssNamed(key), `${key} should be ${val}`).toBe(val);
    for (const name of Object.keys(NamedColor)) {
      const result = unzipCssNamed(name).replaceAll(' ', '');
      expect(result, `${result} should be ${name}`).toBe(name);
    }
  });

  test('stability of `getClosestNamed`', () => {
    for (const [name, rgb] of Object.entries(NamedColor)) {
      getClosestNamed(hex2rgb(rgb))
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
      [RGB_MAX, RGB_MAX],
    ] as const;
    for (const [args, expect_] of cases) {
      const result = srgb2linearRgb(args);
      expect(result).toBeCloseTo(expect_);
    }
  });
  test('linearRgb2srgb', () => {
    const cases = [
      [0, 0],
      [RGB_MAX, RGB_MAX],
    ] as const;
    for (const [args, expect_] of cases) {
      const result = linearRgb2srgb(args);
      expect(result).toBeCloseTo(expect_);
    }
  });
  test('stability', () => {
    const testNum = 500;
    for (let i = 0; i < testNum; i++) {
      const original = Math.random() * RGB_MAX;
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


describe('hex', () => {
  test('stability', () => {
    const cases = [
      ['#000000'],
      ['#FFFFFF'],
      ['#FF0000'],
      ['#00FF00'],
      ['#0000FF'],
      ['#FFFF00'],
      ['#00FFFF'],
      ['#FF00FF'],
    ] as const;
    for (const [hex] of cases) {
      const rgb = hex2rgb(hex);
      expect(
        rgb2hex(rgb),
        `${hex} is not stable`
      )
        .toStrictEqual(hex);
      expect(
        hex2rgb(rgb2hex(rgb)),
        `[${rgb.join(',')}] is not stable`
      )
        .toStrictEqual(rgb);
      const hsb = hex2hsb(hex);
      expect(
        hsb2hex(hsb),
        `${hex} is not stable`
      )
        .toStrictEqual(hex);
      expect(
        hex2hsb(hsb2hex(hsb)),
        `[${hsb.join(',')}] is not stable`
      )
        .toStrictEqual(hsb);
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

// describe('Sorting', () => {
//   test('By luminance', () => {
//     const case1 = sortingByLuminance([
//       { hex: '000' },
//       { hex: 'fff' },
//     ]);
//     expect(rgb2gray(hex2rgb(case1[0].hex))).toBeLessThan(rgb2gray(hex2rgb(case1[1].hex)));
//     const case2 = sortingByLuminance([
//       { hex: 'fff' },
//       { hex: '000' },
//     ]);
//     expect(rgb2gray(hex2rgb(case2[0].hex))).toBeLessThan(rgb2gray(hex2rgb(case2[1].hex)));
//   });
// });

test('getContrastAdjuster("linear")', () => {
  const converter = getContrastAdjuster('linear');
  expect(converter(stdRgbs, 1)).toStrictEqual(stdRgbs);
  for (const rgb of stdRgbs) {
    const factor = randInt(3);
    const newRgb = converter([rgb], factor)[0];
    for (let i = 0; i < 3; i++)
      expect(newRgb[i]).toBeCloseTo(clip(rgb[i] * factor, 0, RGB_MAX));
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

// describe('getHarmonize', () => {
//   const hsb = [0,0,0];
//   test('analogous', () => {
//     const analogous = getHarmonize('analogous')(hsb);
//     expect(analogous).toContainEqual(hsb);
//     expect(analogous).toContainEqual([30,0,0]);
//     expect(analogous).toContainEqual([330,0,0]);
//   });
//   test('triad', () => {
//     const analogous = getHarmonize('triad')(hsb);
//     expect(analogous).toContainEqual(hsb);
//     expect(analogous).toContainEqual([120,0,0]);
//     expect(analogous).toContainEqual([240,0,0]);
//   });
//   test('complement', () => {
//     const analogous = getHarmonize('complement')(hsb);
//     expect(analogous).toContainEqual(hsb);
//     expect(analogous).toContainEqual([180,0,0]);
//   });
//   test('split complement', () => {
//     const analogous = getHarmonize('split complement')(hsb);
//     expect(analogous).toContainEqual(hsb);
//     expect(analogous).toContainEqual([150,0,0]);
//     expect(analogous).toContainEqual([210,0,0]);
//   });
//   test('tetrad', () => {
//     const analogous = getHarmonize('tetrad')(hsb);
//     expect(analogous).toContainEqual(hsb);
//     expect(analogous).toContainEqual([30,0,0]);
//     expect(analogous).toContainEqual([180,0,0]);
//     expect(analogous).toContainEqual([210,0,0]);
//   });
//   test('square', () => {
//     const analogous = getHarmonize('square')(hsb);
//     expect(analogous).toContainEqual(hsb);
//     expect(analogous).toContainEqual([90,0,0]);
//     expect(analogous).toContainEqual([180,0,0]);
//     expect(analogous).toContainEqual([270,0,0]);
//   });
//   test('compound', () => {
//     const analogous = getHarmonize('compound')(hsb);
//     expect(analogous).toContainEqual(hsb);
//     expect(analogous).toContainEqual([30,0,0]);
//     expect(analogous).toContainEqual([180,0,0]);
//     expect(analogous).toContainEqual([150,0,0]);
//   });
//   const hsb2 = [0,100,100];
//   test('shades', () => {
//     const analogous = getHarmonize('shades')(hsb2, 2);
//     expect(analogous).toContainEqual(hsb2);
//     expect(analogous).toContainEqual([0,100,50]);
//   });
//   test('tints', () => {
//     const analogous = getHarmonize('tints')(hsb2, 2);
//     expect(analogous).toContainEqual(hsb2);
//     expect(analogous).toContainEqual([0,50,100]);
//   });
//   test('tones', () => {
//     const analogous = getHarmonize('tones')(hsb2, 2);
//     expect(analogous).toContainEqual(hsb2);
//     expect(analogous).toContainEqual([0,50,50]);
//   });
// });
