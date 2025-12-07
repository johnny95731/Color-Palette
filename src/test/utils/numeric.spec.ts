import { describe } from 'node:test';

import { randInt } from '@johnny95731/color-utils';
import { expect, test } from 'vitest';

import {
  cartesian2polar, countDecimals, frac2percentage, isSameFloat, mod,
  polar2cartesian, toPercent,
} from '@/utils/numeric';


test('mod', () => {
  const cases = [ // mod 10
  // [test, expect]
    [10, 0],
    [0, 0],
    [-1, 9],
    [5, 5],
    [-10, 0],
  ] as const;
  for (const [val, expect_] of cases) {
    expect(mod(val, 10), `(${val} mod 10) should be ${expect_}`).toBe(expect_);
  }
});


test('frac2percentage', () => {
  const cases = [
    [[0, 2], '0%'],
    [[1, 2], '50%'],
    [[5, 10], '50%'],
    [[3, 4], '75%'],
    [[0, 3], '0%'],
  ] as const;
  for (const [[num, denom], expect_] of cases) {
    expect(frac2percentage(num, denom)).toBe(expect_);
  }
});

test('isSameFloat', () => {
  const cases = [
  // [val1, val2, expect]
    [10, 0, false],
    [0, 0, true],
    [1, 1 - Number.EPSILON / 2, true],
    [3, 3 - Number.EPSILON / 2, true],
    [0.0001, 0.0001 - Number.EPSILON / 2, true],
    [1.00001, 1, false],
    [1.00001, 1.0001, false],
    [1.0000000001, 0.999999999999, false],
  ] as const;
  for (const [val1, val2, expect_] of cases) {
    expect(
      isSameFloat(val1, val2),
      `${val1} and ${val2} are ${
        !expect_ ? 'same' : 'different'
      }, but get ${expect_}.`,
    )
      .toBe(expect_);
  }
});

test('countDecimals', () => {
  const cases = [
  // [test, expect]
    [1, 0],
    [5, 0],
    [1.0001, 4],
    [1.0001e0, 4],
    [1.0001e-0, 4],
    [5.0000001e-0, 7],
    [5.0000001e-2, 9],
    [5.0000001e2, 5],
    [1.0001e4, 0],
    [1.000e0, 0],
    [1.0001e4, 0],
    [1.000e-50, 50],
    [1.000e-70, 70],
  ] as const;
  for (const [val, expect_] of cases) {
    const result = countDecimals(val);
    expect(
      result,
      `${val} should have ${expect_} decimals.`,
    )
      .toBe(expect_);
  }
});

test('toPercent', () => {
  const cases = [
  // [arg1, arg2, expect]
    [1, 0, 100],
    [5, 0, 500],
    [-0.15, 0, -15],
    [-0.1546, 0, -15],
    [-0.156, 0, -16],
    [0.15, 0, 15],
    [0.1546, 0, 15],
    [0.156, 0, 16],
  ] as const;
  for (const [arg1, arg2, expect_] of cases) {
    const result = toPercent(arg1, arg2);
    expect(
      result,
      `toPercent(${arg1}, ${arg2}) should be ${expect_}, not ${result}.`,
    )
      .toBe(expect_);
  }
});

describe('Coordinate system', () => {
  test('cartesian2polar', () => {
    const cases = [
      [[0, 0, 0], { deg: 0, radius: 0 }],
      [[1, 0], { deg: 90, radius: 1 }],
      [[-1, 0], { deg: 270, radius: 1 }],
      [[0, 1], { deg: 0, radius: 1 }],
      [[0, -1], { deg: 180, radius: 1 }],
    ] as const;
    for (const [args, expect_] of cases) {
      // @ts-expect-error
      const result = cartesian2polar(...args);
      expect(
        result,
        `deg2rad(${args}) should be ${expect_}, not ${result}.`,
      )
        .toStrictEqual(expect_);
    }
  });

  test('polar2cartesian', () => {
    const cases = [
      [[0, 0, 2], { x: 0, y: 0 }],
      [[1, 0, 2], { x: 1, y: 0 }],
      [[1, 90, 2], { x: 0, y: 1 }],
      [[1, 180, 2], { x: -1, y: 0 }],
      [[1, 270, 2], { x: 0, y: -1 }],
      [[1, 360, 2], { x: 1, y: 0 }],
    ] as const;
    for (const [args, expect_] of cases) {
      // @ts-expect-error
      const result = polar2cartesian(...args);
      if (Object.is(result.x, -0)) result.x = 0;
      if (Object.is(result.y, -0)) result.y = 0;
      expect(result).toStrictEqual(expect_);
    }
  });

  test('stability', () => {
    const testNum = 100;
    for (let i = 0; i < testNum; i++) {
      const cartesian = {
        y: randInt(10) - 5,
        x: randInt(10) - 5,
      };
      const polar = cartesian2polar(cartesian.y, cartesian.x, 5);
      const newCartesian = polar2cartesian(polar.radius, polar.deg, 0);
      const newPolar = cartesian2polar(newCartesian.y, newCartesian.x, 5);
      for (const obj of [polar, newCartesian, newPolar]) {
        for (const key in obj) {
          // @ts-expect-error
          if (Object.is(obj[key], -0)) obj[key] = 0;
        }
      }
      expect(
        cartesian,
        `(x,y)=(${
          cartesian.x},${cartesian.y
        }) is not stable in coordinate tranformation.`,
      )
        .toStrictEqual(newCartesian);

      expect(
        polar,
        `(r,theta)=(${
          polar.radius},${polar.deg
        }) is not stable in coordinate tranformation.`,
      )
        .toStrictEqual(newPolar);
    }
  });
});
