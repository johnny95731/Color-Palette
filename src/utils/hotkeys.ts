import type { Sort } from '@johnny95731/color-utils';

export const HOTKEYS = {
  refresh_: 'r',
  sorting_: {
    luminance: 'g',
    random: 'n',
    reversion: 'j',
  } satisfies Partial<Record<Sort, string>>
} as const;
