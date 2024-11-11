import { createStore, update } from 'idb-keyval';

// Favorite
const favStore = createStore('Palette', 'Favorites');
// -Key: Favorite Colors
const STORE_FAV_COLORS = 'Colors';
// -Key: Favorite Palettes
const STORE_FAV_PLTS = 'Plts';

const updateFavStore = <T extends unknown>(
  key: typeof STORE_FAV_COLORS | typeof STORE_FAV_PLTS,
  callback: (prev: T | undefined) => T
) => {
  return update<T>(
    key,
    callback,
    favStore
  )
    .catch((e) => console.error(e));
};

export const updateFavColors = <T extends string[]>(
  callback: (prev: T | undefined) => T
) => updateFavStore<T>(STORE_FAV_COLORS, callback);

export const updateFavPlts = <T extends string[]>(
  callback: (prev: T | undefined) => T
) => updateFavStore<T>(STORE_FAV_PLTS, callback);
