import { expect, test } from 'vitest';
import { HOTKEYS } from '@/utils/hotkeys';

test('Check duplicate hot keys.', () => {
  const allHotKeys = Object.values(HOTKEYS).map(val =>
    typeof val === 'string' ? val : Object.values(val)
  ).flat();
  expect(
    allHotKeys,
    'Has duplicate hot keys.'
  ).toHaveLength(new Set(allHotKeys).size);
});
