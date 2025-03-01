import { defineStore } from 'pinia';
import type { BorderStyleType, TransitionType, StateType } from 'types/settingStore';

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
type stateKey = keyof typeof initialState;
for (const key of Object.keys(initialState)) {
  const storageItem = localStorage.getItem(key); // object in storage.
  const initItem = initialState[key as stateKey];
  // First time loading the page
  if (!storageItem) localStorage.setItem(key, JSON.stringify(initItem));
  // Updating versions may cause different keys.
  // Pick and assign the common part.
  else {
    const storageObj = JSON.parse(storageItem);
    // Assign previous value to current state for common attributes.
    for (const itemKey of Object.keys(storageObj)) {
      type attrKey = keyof typeof initItem;
      if (typeof initItem[itemKey as attrKey] === typeof storageObj[itemKey])
        initItem[itemKey as attrKey] = storageObj[itemKey];
    }
  }
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
