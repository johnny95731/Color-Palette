
const urls = {
  close: 'i-close',
  del: 'i-delete',
  lock: 'i-lock',
  unlock: 'i-unlock',
  fav: 'i-fav',
  unfav: 'i-unfav',
  draggable: 'i-draggable',
  refresh: 'i-refresh',
  edit: 'i-edit',
  copy: 'i-copy',
  sort: 'i-sort',
  blend: 'i-blend',
  insert: 'i-insert',
  favorPallete: 'i-fav-pallete',
  unfavorPallete: 'i-unfav-pallete',
  bookmarks: 'i-bookmarks',
  list: 'i-list',
  caretLeft: 'i-caret-left',
  caretDown: 'i-caret-down',
  setting: 'i-setting',
  play: 'i-play',
  pause: 'i-pause',
} as const;

export type IconType = keyof typeof urls;

export const getIcon = (icon: IconType) => urls[icon];