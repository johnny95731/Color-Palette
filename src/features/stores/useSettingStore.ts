import { defineStore } from 'pinia';
import { hasSameKeys } from '@/utils/helpers';
import type { BorderStyleType, TransitionType } from 'types/settingType.ts';


type StateType = {
  /**
   * Border of cards.
   */
  border: BorderStyleType;
  /**
   * Transition of cards
   */
  transition: TransitionType;
};

const initialState: StateType = {
  border: {
    show: false,
    width: 2,
    color: 'white',
  },
  transition: {
    pos: 200,
    color: 200,
  },
};
// Initialize Settings
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type stateKey = keyof typeof initialState;
for (const key of Object.keys(initialState)) {
  const storageItem = localStorage.getItem(key); // object in storage.
  const initItem = initialState[key as stateKey];
  // First time loading the page
  if (!storageItem) localStorage.setItem(key, JSON.stringify(initItem));
  // Updating versions may cause different keys.
  else if (!hasSameKeys(initItem, JSON.parse(storageItem))) {
    const storageObj = JSON.parse(storageItem);
    // Save previous value to current state for common attributes.
    for (const itemKey of Object.keys(storageObj)) {
      if (Object.hasOwn(initItem, itemKey)) {
        type attrKey = keyof typeof initItem;
        initItem[itemKey as attrKey] = storageObj[itemKey];
      }
    }
  } else Object.assign(initItem, JSON.parse(storageItem));
}


const useSettingStore = defineStore('setting', {
  state: () => initialState,
  actions: {
    setBorder(attr: keyof BorderStyleType, val: number | string | boolean) {
      // @ts-expect-error Ignore checking `attr`.
      this.border[attr] = val;
      // Update store
      localStorage.setItem('border', JSON.stringify(this.border));
    },
    setTransition(attr: keyof TransitionType, val: number) {
      this.transition[attr] = val;
      // Update store
      localStorage.setItem('transition', JSON.stringify(this.transition));
    },
  },
});
export default useSettingStore;
