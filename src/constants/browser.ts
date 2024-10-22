import type { CSSProperties } from 'vue';

/**
 * font-weight that be used in selected option.
 */
export const CURRENT_OPTION_WEIGHT: CSSProperties = {
  fontWeight: 800,
};

export const COLOR_PICKER_CANVAS_SIZE = {
  width_: 270,
  height_: 135
} as const;

// Symbols: for inject and provide in custom components
export const MenuSymbol = Symbol('menu');

export const OverlayDiv = document.getElementById('overlay-container') as HTMLDivElement;
