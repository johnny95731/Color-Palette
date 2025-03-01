import { defineStore } from 'pinia';
import { updateFavColors, updateFavPlts } from '@/utils/database.ts';
import type { StateType } from 'types/favStore';


const initialState: StateType = {
  colors: [],
  plts: [],
  isInitialized: [false, false],
};

const useFavStore = defineStore('favorites', {
  state: (): StateType => initialState,
  actions: {
    async initializeColors() {
      await updateFavColors((prev) => {
        return this.colors = prev ?? [];
      });
      this.isInitialized[0] = true;
    },
    async initializePlts() {
      await updateFavPlts((prev) => {
        return this.plts = prev ?? [];
      });
      this.isInitialized[1] = true;
    },
    favColorsChanged(targetHex: string) {
      const isIncluding = this.colors.includes(targetHex);
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
        this.colors = this.colors.filter((hex) => hex != targetHex);
      } else { // Non-Favoriting => Favoriting
        this.colors.push(targetHex);
      }
    },
    favPltsChanged(targetPlt: string) {
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
      if (this.plts.includes(targetPlt)) { // Favoriting => Non-Favoriting
        this.plts = this.plts.filter((plt) => plt != targetPlt);
      } else { // Non-Favoriting => Favoriting
        this.plts.push(targetPlt);
      }
    },
  },
});

export default useFavStore;
