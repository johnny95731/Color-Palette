import { removeNonHex } from '@/utils/colors';
import { expect, test } from 'vitest';


test('removeNonHex', () => {
  const cases = [
    ['#13sfdg', '13fd'],
    ['#123def', '123def'],
    ['qwrrtyu', ''],
  ] as const;
  for (const [args, expect_] of cases) {
    const result = removeNonHex(args);
    expect(result).toBe(expect_);
  }
});
