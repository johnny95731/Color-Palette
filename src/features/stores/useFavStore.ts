import { defineStore } from 'pinia';
import { updateFavColors, updateFavPlts } from '@/utils/database.ts';


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
      await updateFavColors((prev) => {
        return this.colors_ = prev ?? [];
      });
      this.isInitialized_[0] = true;
    },
    async initializePlts_() {
      await updateFavPlts((prev) => {
        return this.plts_ = prev ?? [];
      });
      this.isInitialized_[1] = true;
    },
    favColorsChanged_(targetHex: string) {
      const isIncluding = this.colors_.includes(targetHex);
      // Update database
      updateFavColors((prev) => {
        if (!prev) return [];
        let newFav: string[];
        if (isIncluding) { // Favoriting => Non-Favoriting
          newFav = prev.filter((hex) => hex != targetHex);
        } else { // Non-Favoriting => Favoriting
          newFav = [...prev];
          newFav.push(targetHex);
        }
        return newFav;
      });
      // Update state
      if (isIncluding) { // Favoriting => Non-Favoriting
        this.colors_ = this.colors_.filter((hex) => hex != targetHex);
      } else { // Non-Favoriting => Favoriting
        this.colors_.push(targetHex);
      }
    },
    favPltsChanged_(targetPlt: string) {
      // Update database
      updateFavPlts((prev) => {
        if (!prev) return [];
        let newFav: string[];
        if (prev.includes(targetPlt)) { // Favoriting => Non-Favoriting
          newFav = prev.filter((plt) => plt != targetPlt);
        } else { // Non-Favoriting => Favoriting
          newFav = [...prev];
          newFav.push(targetPlt);
        }
        return newFav;
      });
      // Update state
      if (this.plts_.includes(targetPlt)) { // Favoriting => Non-Favoriting
        this.plts_ = this.plts_.filter((plt) => plt != targetPlt);
      } else { // Non-Favoriting => Favoriting
        this.plts_.push(targetPlt);
      }
    },
  },
});

export default useFavStore;
