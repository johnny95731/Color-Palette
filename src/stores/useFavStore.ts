import { defineStore } from 'pinia';
import { updateStore } from '@/utils/database.ts';
import { copyObj } from '@/utils/helpers';


export type State = {
  /**
   * Favorite colors.
   */
  colors_: string[];
  /**
   * Favorite palettes(plts).
   */
  plts_: string[];
  /**
   * Whether the colors/plts is loaded.
   */
  isInitialized_: [boolean, boolean];
}


const initialState: State = {
  colors_: [],
  plts_: [],
  isInitialized_: [false, false],
};

const useFavStore = defineStore('favorites', {
  state: (): State => initialState,
  actions: {
    async initializeColors_() {
      await updateStore<string[]>('colors', (prev) => {
        return this.colors_ = prev ?? [];
      });
      this.isInitialized_[0] = true;
    },
    async initializePlts_() {
      await updateStore<string[]>('plts', (prev) => {
        return this.plts_ = prev ?? [];
      });
      this.isInitialized_[1] = true;
    },
    favColorsChanged_(targetHex: string) {
      const isIncluding = this.colors_.includes(targetHex);
      // Update state
      if (isIncluding) { // Favoriting => Non-Favoriting
        this.colors_ = this.colors_.filter((hex) => hex !== targetHex);
      } else { // Non-Favoriting => Favoriting
        this.colors_.push(targetHex);
      }
      updateStore('colors', () => copyObj(this.colors_));
    },
    favPltsChanged_(targetPlt: string) {
      // Update state
      if (this.plts_.includes(targetPlt)) { // Favoriting => Non-Favoriting
        this.plts_ = this.plts_.filter((plt) => plt !== targetPlt);
      } else { // Non-Favoriting => Favoriting
        this.plts_.push(targetPlt);
      }
      updateStore('plts', () => copyObj(this.plts_));
    }
  },
});

export default useFavStore;
