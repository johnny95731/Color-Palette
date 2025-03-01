import { SortActionType } from '@/types/colors';

export const HOTKEYS = {
  refresh_: 'r',
  sorting_: {
    'luminance': 'g',
    'random': 'n',
    'inversion': 'j',
  } satisfies Partial<Record<SortActionType, string>>
} as const;
