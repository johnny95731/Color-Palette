import type { SortActionType } from '@/features/types/pltType';

const sortingKeys: {
  [key in SortActionType]: string
} = {
  gray: 'g',
  random: 'n',
  inversion: 'j',
} as const;

export const HOT_KEYS = {
  refreshKey: 'r',
  sortingKeys
};

if (process.env.NODE_ENV === 'development') {
  const allHotKeys = Object.values(HOT_KEYS).map(val =>
    typeof val === 'string' ? val : Object.values(val)
  ).flat();
  console.log(
    allHotKeys.length === new Set(allHotKeys).size ?
      'No duplicate hot keys.' : 'Has duplicate hot keys.'
  );
}
