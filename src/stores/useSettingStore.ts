import { defineStore } from 'pinia';
import type { ColorSpaces } from '@/utils/colors';


// consts
export const BORDER_MAX_WIDTH = 10 as const;
export const BORDER_COLOR = ['white', 'gray', 'black'] as const;

export const TRANSITION_MAX_POS = 1000;
export const TRANSITION_MAX_COLOR = 3000;

export const COLOR_SYNTAX = ['modern', 'legacy'] as const;
export const PALETTE_DISPLAY = ['block', 'gradient'] as const;


export type BorderStyle = {
  /**
   * Show border or not.
   */
  show: boolean;
  width: number;
  color: typeof BORDER_COLOR[number];
};

export type TransitionStyle = {
  /**
   * Position transition (happens only when dragging) duration (in `ms`).
   */
  pos: number;
  /**
   * Background-color transition duration (in `ms`).
   */
  color: number
}

type PrimitiveValState = {
  /**
   *  Display the colors in palette as block or as gradient.
   */
  paletteDisplay_: typeof PALETTE_DISPLAY[number]
  /**
   * CSS color-value syntax.
   * Modern syntax: `rgb(0 0 0)`,
   * or
   * legacy syntaxL `rgb(0,0,0)`
   */
  colorSyntax_: typeof COLOR_SYNTAX[number]
}

export type State = {
  /**
   * Border of cards.
   */
  border: BorderStyle;
  /**
   * Transition of cards
   */
  transition: TransitionStyle;
} & PrimitiveValState;


const useSettingStore = defineStore('setting', {
  state(): State {
    const initialState: State = {
      border: {
        show: false,
        width: 2,
        color: 'white',
      },
      transition: {
        pos: 200,
        color: 200,
      },
      paletteDisplay_: 'block',
      colorSyntax_: 'modern',
    };
    // Initialize Settings
    for (const key of Object.keys(initialState) as (keyof State)[]) {
      const storageItem = localStorage.getItem(key); // object in storage.
      const initItem = initialState[key];
      // First time loading the page
      if (!storageItem) localStorage.setItem(key, JSON.stringify(initItem));
      else {
        const storageObj = JSON.parse(storageItem);
        if (typeof initItem === typeof storageObj) continue;
        // Updating versions may cause different keys.
        // Pick and assign the common part.
        if (typeof initItem === 'object') {
          // Assign previous value to current state for common attributes.
          for (const itemKey of Object.keys(storageObj)) {
        type attrKey = keyof typeof initItem;
        if (typeof initItem[itemKey as attrKey] === typeof storageObj[itemKey])
          initItem[itemKey as attrKey] = storageObj[itemKey];
          }
        } else {
          // @ts-expect-error
          initialState[key] = storageObj;
        }
      }
    }
    return initialState;
  },
  actions: {
    setBorder_(attr: keyof BorderStyle, val: number | string | boolean) {
      // @ts-expect-error.
      this.border[attr] = val;
      // Update store
      localStorage.setItem('border', JSON.stringify(this.border));
    },
    setTransition_(attr: keyof TransitionStyle, val: number) {
      this.transition[attr] = val;
      // Update store
      localStorage.setItem('transition', JSON.stringify(this.transition));
    },
    getColorFunction_(space: ColorSpaces, arr: number[]) {
      const sep = this.colorSyntax_ === 'modern' ? ' ' : ',';
      return `${space}(${arr.join(sep)})`;
    }
  },
});
export default useSettingStore;
