import type { SortActions } from '@/utils/manipulate/sorting';

export const HOTKEYS = {
  refresh_: 'r',
  sorting_: {
    luminance: 'g',
    random: 'n',
    inversion: 'j',
  } satisfies Partial<Record<SortActions, string>>
} as const;
