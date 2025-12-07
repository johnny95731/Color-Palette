import { createStore, update } from 'idb-keyval';

// Favorite
const favStore = createStore('Palette', 'Favorites');

const STORE_KEYS = {
  /**
   * Favorite colors
   */
  colors: 'Colors',
  /**
   * Favorite palettes
   */
  plts: 'Plts',
  /**
   * Settings
   */
  settings: 'Settings',
} as const;

export const updateStore = <T>(
  key: keyof typeof STORE_KEYS,
  callback: (prev: T | undefined) => T,
) => {
  return update<T>(
    STORE_KEYS[key],
    callback,
    favStore,
  )
    .catch(e => console.error(e));
};
