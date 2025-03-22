import { defineStore } from 'pinia';
import { updateStore } from '@/utils/database';
import type { ColorSpaces } from '@/utils/colors';
import { copyObj } from '@/utils/helpers';


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
  colorSyntax_: typeof COLOR_SYNTAX[number],
  /**
   * Auto sorting after operations such as refresh, add, and delete.
   */
  autoSort_: boolean,
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
    return {
      border: {
        show: false,
        width: 3,
        color: 'white',
      },
      transition: {
        pos: 200,
        color: 200,
      },
      paletteDisplay_: 'block',
      colorSyntax_: 'modern',
      autoSort_: false,
    };
  },
  actions: {
    initializeSettings_() {
      // Initialize Settings
      return updateStore<State | undefined>('settings', (prev) => {
        if (!prev) return copyObj(this.$state);
        for (const key of Object.keys(this.$state) as (keyof State)[]) {
          const initItem = this[key];
          let storageItem: typeof initItem;
          try {
            storageItem = prev[key];
          } catch {
            continue;
          }
          // Updating versions may cause different keys.
          // Pick and assign the common part.
          if (typeof initItem === 'object') {
            // Assign previous value to current state for common attributes.
            for (const itemKey of Object.keys(initItem) as (keyof typeof initItem)[]) {
              // @ts-expect-error
              if (typeof initItem[itemKey] === typeof storageItem[itemKey])
                // @ts-expect-error
                initItem[itemKey] = storageItem[itemKey];
            }
          } else {
            // @ts-expect-error
            this[key] = storageItem;
          }
        }
        return copyObj(this.$state);
      });
    },
    setBorder_(attr: keyof BorderStyle, val: number | string | boolean) {
      // @ts-expect-error.
      this.border[attr] = val;
    },
    setTransition_(attr: keyof TransitionStyle, val: number) {
      this.transition[attr] = val;
    },
    getColorFunction_(space: ColorSpaces, arr: number[]) {
      const sep = this.colorSyntax_ === 'modern' ? ' ' : ',';
      return `${space}(${arr.join(sep)})`;
    },
    updateStorage() {
      updateStore('settings', () => {
        return JSON.parse(JSON.stringify(this.$state));
      });
    }
  },
});
export default useSettingStore;
