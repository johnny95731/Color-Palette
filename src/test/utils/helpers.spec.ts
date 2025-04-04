import { frac2percentage, getLetterCaseConverter, invertBoolean, isNullish, objPick, randomCharacter, shuffle } from '@/utils/helpers';
import { describe, expect, test } from 'vitest';
import { ref } from 'vue';



test('objPick', () => {
  const cases = [
    [
      {
        x: 1,
        y: 2,
        z: 3,
      },
      ['x'],
      { x: 1 },
    ],
    [
      {
        x: 1,
        y: 2,
        z: 3,
      },
      ['x', 'y'],
      { x: 1, y: 2 },
    ],
    [
      {
        x: 1,
        y: 2,
        z: 3,
      },
      ['x', 'y', 'z'],
      { x: 1, y: 2, z: 3 },
    ],
    [
      {
        a: 'sfadsf',
        t: 5,
        r: 999,
      },
      ['x'],
      { x: undefined },
    ],
    [
      {
        a: 'sfadsf',
        t: 5,
        r: 999,
      },
      ['x', 'a'],
      { x: undefined, a: 'sfadsf' },
    ],
  ] as const;
  for (const [obj, keys, expect_] of cases) {
    // @ts-expect-error
    expect(objPick(obj, keys)).toStrictEqual(expect_);
  }
});

test('shuffle', () => {
  const cases = [
    Array.from({ length: 100 }, (_,i) => i),
    Array.from({ length: 100 }, (_,i) => 2*i),
  ];
  for (const args of cases) {
    const shuffled = shuffle(JSON.parse(JSON.stringify(args)));
    for (const val of shuffled) {
      expect(args).toContain(val);
    }
  }
});

test('isNullish', () => {
  const cases = [
    [null, true],
    [undefined, true],
    [0, false],
    [1, false],
    [Number.NaN, false],
    ['', false],
    ['546', false],
  ];
  for (const [args, expect_] of cases) {
    expect(isNullish(args)).toBe(expect_);
  }
});

test('invertBoolean', () => {
  const cases = [
    [[ref(true)], false],
    [[ref(true), true], true],
    [[ref(true), false], false],
    [[ref(false)], true],
    [[ref(false), true], true],
    [[ref(false), false], false],
    [[ref(undefined)], true],
    [[ref(undefined), true], true],
    [[ref(undefined), false], false],
  ];
  for (const [args, expect_] of cases) {
    // @ts-expect-error
    expect(invertBoolean(...args)).toBe(expect_);
  }
});


test('evalPosition', () => {
  const cases = [
    [[0, 2], '0%'],
    [[1, 2], '50%'],
    [[5, 10], '50%'],
    [[3, 4], '75%'],
    [[0, 3], '0%'],
  ];
  for (const [args, expect_] of cases) {
    // @ts-expect-error
    expect(frac2percentage(...args)).toBe(expect_);
  }
});

test('randomCharacter', () => {
  const testNum = 200;
  for (let i = 0; i < testNum; i++) {
    expect('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
      .contain(randomCharacter(true));
    expect('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
      .contain(randomCharacter());
  }
});

describe('Letter cases', () => {
  test('identity', () => {
    const converter = getLetterCaseConverter('');
    const cases = [
      [['sadfg'], 'sadfg'],
      [['50%'], '50%'],
      [[2], 2],
    ];
    for (const [args, expect_] of cases) {
      // @ts-expect-error
      expect(converter(...args)).toBe(expect_);
    }
  });

  test('toStartCase', () => {
    const converter = getLetterCaseConverter('start');
    const cases = [
      [['sadfg'], 'Sadfg'],
      [['50%'], '50%'],
      [['dafsgd asfdghido'], 'Dafsgd Asfdghido'],
      [['start case'], 'Start Case'],
    ];
    for (const [args, expect_] of cases) {
      // @ts-expect-error
      expect(converter(...args)).toBe(expect_);
    }
  });

  test('to all-caps', () => {
    const converter = getLetterCaseConverter('all-caps');
    const cases = [
      [['sadfg'], 'SADFG'],
      [['aa asg'], 'AA ASG'],
      [['AB59faG'], 'AB59FAG'],
      [['start case'], 'START CASE'],
    ];
    for (const [args, expect_] of cases) {
      // @ts-expect-error
      expect(converter(...args)).toBe(expect_);
    }
  });
});


