
export const refreshKey = 0;
export const sortingKey = 1;

export const HOT_KEYS = {
  [refreshKey]: 'r',
  [sortingKey]: {
    gray: 'g',
    random: 'n',
    inversion: 'j',
  }
} as const;

if (process.env.NODE_ENV === 'development') {
  const allHotKeys = Object.values(HOT_KEYS).map(val =>
    typeof val === 'string' ? val : Object.values(val)
  ).flat();
  console.info(
    allHotKeys.length === new Set(allHotKeys).size ?
      'No duplicate hot keys.' : 'Has duplicate hot keys.'
  );
}
