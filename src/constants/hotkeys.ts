import { SortActionType } from '@/types/colors';

export const HOT_KEYS = {
  refresh_: 'r',
  sorting_: [
    ['luminance', 'g'],
    ['random', 'n'],
    ['inversion', 'j'],
  ] satisfies [SortActionType, string][]
} as const;
