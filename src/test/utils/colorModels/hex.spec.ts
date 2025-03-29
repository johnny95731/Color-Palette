import { describe, expect, test } from 'vitest';
import NamedColor from '@/assets/NamedColor.json';
import { hex2rgb, isValidHex, rgb2hex } from '@/utils/colorModels/hex';
import { getClosestNamed, unzipCssNamed } from '@/utils/colorModels/named';



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
