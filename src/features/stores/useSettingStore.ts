import { defineStore } from 'pinia';
import { BORDER_COLOR, COLOR_FUNCTIONS } from '@/constants/settingStore';
import { ColorSpaces } from '@/types/colors';


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
  colorNotation_: typeof COLOR_FUNCTIONS[number]
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
  colorNotation_: 'modern',
};
// Initialize Settings
for (const key of Object.keys(initialState) as (keyof State)[]) {
  const storageItem = localStorage.getItem(key); // object in storage.
  const initItem = initialState[key];
  // First time loading the page
  if (!storageItem) localStorage.setItem(key, JSON.stringify(initItem));
  // Updating versions may cause different keys.
  // Pick and assign the common part.
  else if (typeof initItem === 'object') {
    const storageObj = JSON.parse(storageItem);
    // Assign previous value to current state for common attributes.
    for (const itemKey of Object.keys(storageObj)) {
      type attrKey = keyof typeof initItem;
      if (typeof initItem[itemKey as attrKey] === typeof storageObj[itemKey])
        initItem[itemKey as attrKey] = storageObj[itemKey];
    }
  } else {
    const storageObj = JSON.parse(storageItem);
    initialState[key] = storageObj;
  }
}


const useSettingStore = defineStore('setting', {
  state: () => initialState,
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
    setColorFunction_(attr: keyof PrimitiveValState, val: string) {
      // @ts-expect-error.
      this[attr] = val;
    },
    getColorString_(space: ColorSpaces, arr: number[]) {
      const sep = this.colorNotation_ === 'modern' ? ' ' : ',';
      return `${space}(${arr.join(sep)})`;
    }
  },
});
export default useSettingStore;
