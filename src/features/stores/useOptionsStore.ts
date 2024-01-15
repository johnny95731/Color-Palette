import {defineStore} from 'pinia';
// Types
import type {ColorSpacesType, BlendingType} from '../types/optionsType.ts';

type state = {
  blendMode: BlendingType;
  colorSpace: ColorSpacesType;
};

/**
 * The initial state about options.
 * @property {SuportMixingModeType} blendMode - How to evaluate a new color
 *   when insert a new card.
 * @property {SuportColorSpacesType} colorSpace - Color space which will be
 *   display under hex code and be used in edit mode.
 */
const initialState: {
  blendMode: BlendingType;
  colorSpace: ColorSpacesType;
} = {
  /**
   * How to evaluate a new color when insert a new card.
   */
  blendMode: 'mean',
  /**
   * Color space which will be display under hex code and be used in edit mode.
   */
  colorSpace: 'rgb',
};

const useOptionsStore = defineStore('options', {
  state: (): state => initialState,
  actions: {
    setColorSpace(newColorSpace: ColorSpacesType) {
      this.colorSpace = newColorSpace;
    },
    setBlendMode(newBlendMode: BlendingType) {
      this.blendMode = newBlendMode;
    },
  },
});

// export const {editModeChanged, mixingModeChanged} = useOptionStore.actions;
export default useOptionsStore;
