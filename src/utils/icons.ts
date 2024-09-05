const iconMap = {
  mix: 'file-earmark-plus',
  bookmarks: 'bookmarks',
  caretDown: 'caret-down-fill',
  caretLeft: 'caret-left-fill',
  close: 'x-lg',
  copy: 'copy',
  delete: 'trash3-fill',
  draggable: 'arrows',
  edit: 'sliders',
  fav: 'star-fill',
  favPallete: 'bookmark-plus',
  info: 'info-circle',
  insert: 'arrows-expand-vertical',
  list: 'list',
  lock: 'lock-fill',
  pause: 'pause-fill',
  play: 'play',
  refresh: 'arrow-clockwise',
  setting: 'gear',
  sort: 'sort-down',
  unfav: 'star',
  unfavPallete: 'bookmark-dash',
  unlock: 'unlock-fill',
} as const;

export type IconType = keyof typeof iconMap;
export const getIcon = (icon: IconType) => `bi bi-${iconMap[icon]}`;
