import { defineStore } from 'pinia';
// Utils
import {
  rgb2hex, randRgbGen, hex2rgb, getSpaceInfos, getContrastAdjuster, getDistOp,
} from '@/utils/colors.ts';
import { shuffle } from '@/utils/helpers.ts';
import { INIT_COLOR_SPACE, INIT_NUM_OF_CARDS, MAX_NUM_OF_CARDS } from '@/constants/pltStore';
import { CONTRAST_METHODS, SORTING_ACTIONS } from '@/constants/colors';
// Types
import type { CardType } from '@/features/types/pltStore';
import type { OrderStateType, SortActionType, ColorSpacesType } from 'types/colors';
import type { MixingType } from 'types/mixing';
import type { ColorSpaceInfos } from '@/types/colors';
import { mixers } from '@/utils/mixing';


/**
 * Create a new state object.
 * @return {CardType} State object.
 */
export const newCard = (
  order: number, colorSpace: ColorSpacesType, color?: number[],
): CardType => {
  const { converter, inverter } = getSpaceInfos(colorSpace);
  if (!color) color = converter(randRgbGen());
  const hex = rgb2hex(inverter(color));
  return {
    order,
    hex,
    color,
    originHex: hex,
    originColor: color,
    isLock: false,
    isFav: false,
  };
};


type StateType = {
  cards: CardType[];
  /**
   * The order of cards.
   */
  sortBy: OrderStateType;
  /**
   * Start dealing events.
   */
  isPending: boolean;
  /**
   * Index of card that is editing.
   */
  editingIdx: number;
  /**
   * Edit the palette.
   */
  isAdjustingPlt: boolean;
  /**
   * How to evaluate a new color when insert a new card.
   */
  mixMode: MixingType;
  /**
   * Color space which will be displayed under hex code and be used in edit
   * mode.
   */
  colorSpace: ColorSpacesType;
}

const initialState: StateType = {
  cards: Array.from({ length: INIT_NUM_OF_CARDS },
    (_, i) => newCard(i, INIT_COLOR_SPACE)),
  sortBy: 'random',
  isPending: false,
  editingIdx: -1,
  isAdjustingPlt: false,
  mixMode: 'mean',
  colorSpace: INIT_COLOR_SPACE,
};

const usePltStore = defineStore('plt', {
  state: (): StateType => initialState,
  getters: {
    numOfCards(): number {
      return this.cards.length;
    },
    isEditing(): boolean {
      return this.editingIdx !== -1;
    },
    spaceInfos(): ColorSpaceInfos  {
      return getSpaceInfos(this.colorSpace);
    }
  },
  actions: {
    mixCard(left: number, right?: number) {
      right ??= left + 1;
      // Evaluate new color.
      let rgb;
      if (this.mixMode === 'random') rgb = randRgbGen();
      else {
        const { inverter } = this.spaceInfos;
        // Pick cards.
        let leftRgbColor;
        let rightRgbColor;
        // -Add to thequallyLengthsition. Blending the first card and black.
        if (left < 0) leftRgbColor = [0, 0, 0];
        else leftRgbColor = inverter(this.cards[left].color);
        // -Add to the last position. Blending the last card and white.
        if (right >= this.numOfCards) rightRgbColor = [255, 255, 255];
        else rightRgbColor = inverter(this.cards[right].color);
        rgb = mixers[this.mixMode](
          leftRgbColor, rightRgbColor, this.colorSpace,
        );
      }
      return rgb;
    },
    addCard(idx: number, rgb: number[]) {
      if (this.numOfCards == MAX_NUM_OF_CARDS) return;
      const cards = this.cards;
      const cardState = newCard(idx, this.colorSpace, this.spaceInfos.converter(rgb));
      cards.forEach((card) => {
        if (card.order >= idx) card.order++;
      });
      cards.splice(idx, 0, cardState);
      this.sortBy = 'random';
    },
    delCard(idx: number) {
      if (this.numOfCards === 2) return;
      const cards = this.cards;
      const removedOrder = cards.splice(idx, 1)[0].order;
      cards.forEach((card) => {
        if (card.order > removedOrder) card.order--;
      });
    },
    refreshCard(idx: number) {
      if (idx >= 0) {
        if (this.cards[idx].isLock) return;
        this.cards[idx] = newCard(idx, this.colorSpace);
      } else if (idx === -1) {
        this.cards.forEach((card, i) =>
          card.isLock || Object.assign(card, newCard(i, this.colorSpace))
        );
      }
      this.sortBy = 'random';
    },
    editCard(idx: number, color: number[]) {
      const { inverter } = this.spaceInfos;
      this.cards[idx].color = color;
      this.cards[idx].hex = rgb2hex(inverter(color));
      this.sortBy = 'random';
    },
    sortCards(sortBy: SortActionType) {
      const opIdx = SORTING_ACTIONS.indexOf(sortBy);
      if (opIdx === 1) { // random
        shuffle(this.cards);
      } else if (
        opIdx === 2 || // inversion
        this.sortBy === SORTING_ACTIONS[opIdx]
      ) this.cards.reverse();
      else  {
        const op = getDistOp(sortBy);
        const distToBlack = this.cards.map(({ hex }) => {
          return op(hex, '#000');
        });
        this.cards.sort((a, b) => {
          return distToBlack[a.order] - distToBlack[b.order];
        });
      }
      /**
       * Inversion will not change sortBy. For example, if cards are sorted
       * by gray, inversion just change the most lightest card on left side
       * or on right side.
       */
      if (opIdx !== 2)
        // @ts-expect-error
        this.sortBy = SORTING_ACTIONS[opIdx];
      this.cards.forEach((card, i) => card.order = i);
    },
    setIsLock(idx: number) {
      this.cards[idx].isLock = !this.cards[idx].isLock;
    },
    setEditingIdx(idx?: number) {
      idx = idx ?? -1;
      this.editingIdx = this.editingIdx === idx ? -1 : idx;
    },
    moveCardOrder(cardIdx: number, to: number) {
      const initOrder = this.cards[cardIdx].order;
      if (initOrder <= to) {
        this.cards.forEach((card) => {
          card.order > initOrder && card.order <= to && // if (cond)
            card.order--;
        });
      } else {
        this.cards.forEach((card) => {
          card.order >= to && card.order < initOrder && // if (cond)
            card.order++;
        });
      }
      this.cards[cardIdx].order = to;
      this.sortBy = 'random';
    },
    // Plt state
    resetOrder() {
      this.cards.sort((a, b) => a.order - b.order);
      this.cards.forEach((card, i) => card.order = i);
    },
    setIsPending(newVal: boolean) {
      this.isPending = newVal;
    },
    setIsAdjustingPlt(val: 'start' | 'reset' | 'cancel') {
      // start: Start adjusting and store origin color.
      // reset: Keep adjusting and reset color.
      // cancel: Keep adjusting and reset color.
      this.isAdjustingPlt = val !== 'cancel';
      if (val === 'start') {
        this.cards.forEach((card) => {
          card.originHex = card.hex;
          card.originColor = card.color;
        });
      } else { // 'reset' and 'cancel'
        this.cards.forEach((card) => {
          card.hex = card.originHex;
          card.color = card.originColor;
        });
      }
    },
    setPlt(plt: string[] | number[][]) {
      const { converter } = this.spaceInfos;
      const callback = (color: string | number[]) => {
        return Array.isArray(color) ? color : converter(hex2rgb(color));
      };
      this.cards = plt.map((color, i) => newCard(
        i, this.colorSpace, callback(color),
      ));
      this.sortBy = 'random';
    },
    setColorSpace(newColorSpace: ColorSpacesType) {
      this.colorSpace = newColorSpace;
      const { converter } = this.spaceInfos;
      for (let i = 0; i < this.numOfCards; i++) {
        const rgb = hex2rgb(this.cards[i].hex) as number[];
        this.cards[i].color = converter(rgb);
      }
    },
    setBlendMode(newBlendMode: MixingType) {
      this.mixMode = newBlendMode;
    },
    adjustContrast(method: number, coeff?: number) {
      if (!this.isAdjustingPlt) return;
      const { converter, inverter } = this.spaceInfos;
      const arr = this.cards.map((card) => inverter(card.originColor));
      const adjuster = getContrastAdjuster(CONTRAST_METHODS[method]);

      const newRgbs = adjuster(arr, coeff!);
      for (let i = 0; i < this.numOfCards; i++) {
        this.cards[i].color = converter(newRgbs[i]);
        this.cards[i].hex = rgb2hex(newRgbs[i]);
        // or, this.editCard(i, converter(newRgbs[i]))
      }
    },
  },
});
export default usePltStore;
