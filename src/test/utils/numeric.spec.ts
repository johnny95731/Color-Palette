import { expect, test } from 'vitest';
import { cartesian2polar, clip, countDecimals, deg2rad, dot, elementwiseMean, isSameFloat, l2Dist, mod, polar2cartesian, rad2deg, randInt, rangeMapping, round, sum, toPercent } from '@/utils/numeric';
import { describe } from 'node:test';

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

test('randInt', () => {
  const testNum = 100;
  const max = 10;
  for (let i = 0; i < testNum; i++) {
    const rand = randInt(max);
    expect(rand, `${rand} should in the range [0, 10]`)
      .toBeGreaterThanOrEqual(0);
    expect(rand, `${rand} should in the range [0, 10]`)
      .toBeLessThanOrEqual(max);
  }
});

test('isSameFloat', () => {
  const cases = [
  // [val1, val2, expect]
    [10, 0, false],
    [0, 0, true],
    [1, 1 - Number.EPSILON/2, true],
    [3, 3 - Number.EPSILON/2, true],
    [0.0001, 0.0001 - Number.EPSILON/2, true],
    [1.00001, 1, false],
    [1.00001, 1.0001, false],
    [1.0000000001, 0.999999999999, false],
  ] as const;
  for (const [val1, val2, expect_] of cases) {
    expect(
      isSameFloat(val1, val2),
      `${val1} and ${val2} are ${!expect_ ? 'same' : 'different'}, but get ${expect_}.`
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
      `${val} should have ${expect_} decimals.`
    )
      .toBe(expect_);
  }
});

test('round', () => {
  const cases = [
  // [arg1, arg2, expect]
    [1, 0, 1],
    [5, 0, 5],
    [-5.15, 0, -5],
    [-2.1546, 0, -2],
    [-1.15, 0, -1],
    [-5.1546, 0, -5],
    // specific digit
    [1, 2, 1],
    [5, 2, 5],
    [-5.15, 2, -5.15],
    [-2.1546, 2, -2.15],
    [-1.15, 2, -1.15],
    [-5.1546, 2, -5.15],
    [1.959, 2, 1.96],
    [5.789, 2, 5.79],
    [5.799, 2, 5.8],
  ];
  // eslint-disable-next-line
  for (let [arg1, arg2, expect_] of cases) {
    const result = round(arg1, arg2);
    if (!arg2) expect_ = round(arg1);
    expect(
      result,
      `round(${arg1}, ${arg2}) should be ${expect_}, not ${result}.`
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
      `toPercent(${arg1}, ${arg2}) should be ${expect_}, not ${result}.`
    )
      .toBe(expect_);
  }
});

test('clip', () => {
  const cases = [
  // [args, expect]
    [[1], 1],
    [[1, 0, 2], 1],
    [[1, 2, 3], 2],
    [[1, 0, 0.5], 0.5],
    [[1, 1, 0], 0],
  ] as const;
  for (const [args, expect_] of cases) {
    // @ts-expect-error
    const result = clip(...args);
    expect(
      result,
      `clip(${args.join(',')}) should be ${expect_}, not ${result}.`
    )
      .toBe(expect_);
  }
});

test('rangeMapping', () => {
  const cases = [
  // [args, expect]
    [[1, 0, 1, -100, 100], 100],
    [[1, 1, 2, -100, 100], -100],
    [[1, 0, 2, -100, 100], 0],
    [[1, 2, 3, -100, 100], -100],
    [[1, -1, 0, -100, 100], 100],
    [[0, -1, 1, 0, 0.01, 3], 0.005],
  ] as const;
  for (const [args, expect_] of cases) {
    // @ts-expect-error
    const result = rangeMapping(...args);
    expect(
      result,
      `rangeMapping(${args.join(',')}) should be ${expect_}, not ${result}.`
    )
      .toBe(expect_);
  }
});

describe('degree and radian', () => {
  test('deg2rad', () => {
    const cases = [
    // [arg1, expect]
      [0, 0],
      [180, Math.PI],
      [360, 2 * Math.PI],
      [90, Math.PI / 2],
    ] as const;
    for (const [arg, expect_] of cases) {
      const result = deg2rad(arg);
      expect(
        result,
        `deg2rad(${arg}) should be ${expect_}, not ${result}.`
      )
        .toBe(expect_);
    }
  });

  test('rad2deg', () => {
    const cases = [
    // [arg1, expect]
      [0, 0],
      [Math.PI, 180],
      [2 * Math.PI, 360],
      [Math.PI / 2, 90],
    ] as const;
    for (const [arg, expect_] of cases) {
      const result = rad2deg(arg);
      expect(
        result,
        `deg2rad(${arg}) should be ${expect_}, not ${result}.`
      )
        .toBe(expect_);
    }
  });

  test('stability', () => {
    const testNum = 100;
    for (let i = 0; i < testNum; i++) {
      const deg = randInt(359);
      const rad = deg2rad(deg);
      expect(
        rad2deg(deg2rad(deg)),
        `Degree ${deg} is not stable in rad2deg(deg2rad())`
      )
        .toBeCloseTo(deg);
      expect(
        deg2rad(rad2deg(rad)),
        `Radian ${deg} is not stable in deg2rad(rad2deg())`
      )
        .toBeCloseTo(rad);
    }
  });
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
        `deg2rad(${args}) should be ${expect_}, not ${result}.`
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
        `(x,y)=(${cartesian.x},${cartesian.y}) is not stable in coordinate tranformation.`
      )
        .toStrictEqual(newCartesian);

      expect(
        polar,
        `(r,theta)=(${polar.radius},${polar.deg}) is not stable in coordinate tranformation.`
      )
        .toStrictEqual(newPolar);
    }
  });
});

test('dot', () => {
  const cases = [
    // [arr1, arr2, expect]
    [[1], [1], 1],
    [[1,1,1], [1,1,1], 3],
    [[1,1,1], [0,0,0], 0],
    [[1,1,1], [1,2,3], 6],
    [[1,2,3], [1,2,3], 14],
  ] as const;
  for (const [arr1, arr2, expect_] of cases) {
    const result = dot(arr1, arr2);
    expect(
      result,
      `dot([${arr1.join(',')}], [${arr2.join(',')}]) should be ${expect_}, not ${result}.`
    )
      .toBeCloseTo(expect_);
  }
});

test('sum', () => {
  const cases = [
    // [arr1, expect]
    [[1], 1],
    [[1,1], 2],
    [[1,1,1], 3],
    [[0,0,0,0,0,0,0,0], 0],
    [[1,2,3], 6],
  ] as const;
  for (const [arr1, expect_] of cases) {
    const result = sum(arr1);
    expect(
      result,
      `sum([${arr1.join(',')}]) should be ${expect_}, not ${result}.`
    )
      .toBeCloseTo(expect_);
  }
});

test('l2Dist', () => {
  const cases = [
    // [arr1, arr2, expect]
    [[1], [1], 0],
    [[1,1,1], [1,1,1], 0],
    [[1,1,1], [0,0,0], 3],
    [[1,1,1], [1,2,3], 5],
    [[1,2,3], [1,2,3], 0],
    [[2,1], [1,2], 2],
  ] as const;
  for (const [arr1, arr2, expect_] of cases) {
    // @ts-expect-error
    const result = l2Dist(arr1, arr2);
    expect(
      result,
      `l2Dist([${arr1.join(',')}], [${arr2.join(',')}]) should be ${expect_}, not ${result}.`
    )
      .toBeCloseTo(expect_);
  }
});

test('elementwiseMean', () => {
  const cases = [
    // [arr1, arr2, expect]
    [[1], [1], [1]],
    [[1,1,1], [1,1,1], [1,1,1]],
    [[1,1,1], [0,0,0], [.5,.5,.5]],
    [[1,1,1], [1,2,3], [1,1.5,2]],
    [[1,2,3], [1,2,3], [1,2,3]],
    [[7,1], [1,3], [4,2]],
  ] as const;
  for (const [arr1, arr2, expect_] of cases) {
    // @ts-expect-error
    const result = elementwiseMean(arr1, arr2);
    expect(
      result,
      `elementwiseMean([${arr1.join(',')}], [${arr2.join(',')}]) should be [${expect_.join(',')}], not [${result.join(',')}].`
    )
      .toStrictEqual(expect_);
  }
});
