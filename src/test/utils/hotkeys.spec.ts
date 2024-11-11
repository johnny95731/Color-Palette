import { expect, test } from 'vitest';
import { HOT_KEYS } from '@/constants/hotkeys';

test('Check duplicate hot keys.', () => {
  const allHotKeys = Object.values(HOT_KEYS).map(val =>
    typeof val === 'string' ? val : Object.values(val)
  ).flat();
  expect(
    allHotKeys,
    'Has duplicate hot keys.'
  ).toHaveLength(new Set(allHotKeys).size);
});
