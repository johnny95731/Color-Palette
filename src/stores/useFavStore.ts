import { defineStore } from 'pinia';
import { cloneDeep } from '@johnny95731/color-utils';
import { updateStore } from '@/utils/database.ts';


export type State = {
  /**
   * Favorite colors.
   */
  colors_?: string[];
  /**
   * Favorite palettes(plts).
   */
  plts_?: string[];
}



const useFavStore = defineStore('favorites', {
  state: (): State => ({}),
  actions: {
    initializeColors_() {
      return updateStore<string[]>('colors', (prev) => {
        return this.colors_ = prev ?? [];
      });
    },
    initializePlts_() {
      return updateStore<string[]>('plts', (prev) => {
        return this.plts_ = prev ?? [];
      });
    },
    isFavColor_(hex: string){
      this.colors_ ??= [];
      updateStore('colors', () => []);
      return this.colors_?.includes(hex);
    },
    isFavPlt_(plt: string){
      this.plts_ ??= [];
      updateStore('plts', () => []);
      return this.plts_?.includes(plt);
    },
    favColorsChanged_(targetHex: string) {
      this.colors_ ??= [];
      if (this.colors_.includes(targetHex)) { // Favoriting => Non-Favoriting
        this.colors_ = this.colors_?.filter((hex) => hex !== targetHex);
      } else { // Non-Favoriting => Favoriting
        this.colors_.push(targetHex);
      }
      updateStore('colors', () => cloneDeep(this.colors_));
    },
    favPltsChanged_(targetPlt: string) {
      if (this.plts_?.includes(targetPlt)) { // Favoriting => Non-Favoriting
        this.plts_ = this.plts_.filter((plt) => plt !== targetPlt);
      } else { // Non-Favoriting => Favoriting
        this.plts_?.push(targetPlt);
      }
      updateStore('plts', () => cloneDeep(this.plts_));
    }
  },
});

export default useFavStore;
