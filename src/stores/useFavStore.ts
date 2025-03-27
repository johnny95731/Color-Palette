import { defineStore } from 'pinia';
import { updateStore } from '@/utils/database.ts';
import { copyObj } from '@/utils/helpers';


export type State = {
  /**
   * Favorite colors.
   */
  colors: string[];
  /**
   * Favorite palettes(plts).
   */
  plts: string[];
  /**
   * Whether the colors/plts is loaded.
   */
  isInitialized_: [boolean, boolean];
}


const initialState: State = {
  colors: [],
  plts: [],
  isInitialized_: [false, false],
};

const useFavStore = defineStore('favorites', {
  state: (): State => initialState,
  actions: {
    async initializeColors_() {
      await updateStore<string[]>('colors', (prev) => {
        return this.colors = prev ?? [];
      });
      this.isInitialized_[0] = true;
    },
    async initializePlts_() {
      await updateStore<string[]>('plts', (prev) => {
        return this.plts = prev ?? [];
      });
      this.isInitialized_[1] = true;
    },
    favColorsChanged(targetHex: string) {
      const isIncluding = this.colors.includes(targetHex);
      // Update state
      if (isIncluding) { // Favoriting => Non-Favoriting
        this.colors = this.colors.filter((hex) => hex !== targetHex);
      } else { // Non-Favoriting => Favoriting
        this.colors.push(targetHex);
      }
      updateStore('colors', () => copyObj(this.colors));
    },
    favPltsChanged(targetPlt: string) {
      // Update state
      if (this.plts.includes(targetPlt)) { // Favoriting => Non-Favoriting
        this.plts = this.plts.filter((plt) => plt !== targetPlt);
      } else { // Non-Favoriting => Favoriting
        this.plts.push(targetPlt);
      }
      updateStore('plts', () => copyObj(this.plts));
    }
  },
});

export default useFavStore;
