export const COLOR_PICKER_CANVAS_SIZE = 200;

// Component default
export const V_DIALOG_OVERLAY_PROPS = {
  eager: true,
  role: 'dialog',
  transition: 'slide-y',
  transparent: true,
  type: 'dialog',
} as const;

// Symbols: for inject and provide in custom components
export const OVERLAY_SYMBOL = Symbol('overlay');
export const MENU_SYMBOL = Symbol('menu');
