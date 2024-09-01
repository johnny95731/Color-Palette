import { defineStore } from 'pinia';
// Utils
import {
  rgb2gray, rgb2hex, randRgbGen, hex2rgb, getSpaceInfos, gammaCorrection, scaling,
} from '@/utils/colors.ts';
import { shuffle } from '@/utils/helpers.ts';
import {
  INIT_COLOR_SPACE, INIT_NUM_OF_CARDS, MAX_NUM_OF_CARDS,
} from '@/utils/constants.ts';
// Types
import type {
  CardType, OrderStateType, SortActionType, ColorSpacesType, BlendingType,
} from '../types/pltType.ts';
import type { ColorSpaceInfos, ColorSpaceTrans } from '@/types/utilTypes.ts';


/**
 * Create a new state object.
 * @return {CardType} State object.
 */
export const newCard = (
  order: number, colorSpace: ColorSpacesType, rgb?: number[],
): CardType => {
  const infos = getSpaceInfos(colorSpace);
  if (!rgb) rgb = randRgbGen();
  const color = infos.converter(rgb);
  const hex = rgb2hex(rgb);
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
  blendMode: BlendingType;
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
  blendMode: 'mean',
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
    spaceInfos(): ColorSpaceTrans & ColorSpaceInfos {
      return getSpaceInfos(this.colorSpace);
    }
  },
  actions: {
    addCard(idx: number, rgb: number[]) {
      if (this.numOfCards == MAX_NUM_OF_CARDS) return;
      const cards = this.cards;
      const cardState = newCard(idx, this.colorSpace, rgb);
      cards.forEach((card) => {
        if (card.order >= idx) card.order++;
      });
      cards.splice(idx, 0, cardState);
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
        for (let i = 0; i < this.numOfCards; i++) {
          if (this.cards[i].isLock) continue;
          this.cards[i] = newCard(i, this.colorSpace);
        }
      }
      this.sortBy = 'random';
    },
    editCard({ idx, color }: {idx: number; color: number[]}) {
      const { inverter } = this.spaceInfos;
      this.cards[idx].color = color;
      this.cards[idx].hex = rgb2hex(inverter(color));
      this.sortBy = 'random';
    },
    sortCards(sortBy: SortActionType) {
      const { inverter } = this.spaceInfos;
      switch (sortBy) {
      case 'gray':
        if (this.sortBy === 'gray') {
          this.cards.reverse();
          break;
        }
        this.cards.sort((a, b) => {
          return rgb2gray(inverter(a.color)) - rgb2gray(inverter(b.color));
        });
        this.sortBy = 'gray';
        break;
      case 'inversion':
        /**
           * Inversion will not change sortBy. For example, if cards are sorted
           * by gray (brightness), inversion just change most lightest card on
           * left side or on right side.
           */
        this.cards.reverse();
        break;
      case 'random':
        shuffle(this.cards);
        this.sortBy = 'random';
      }
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
    setPlt(plt: string[]) {
      this.cards = plt.map((hex, i) => newCard(
        i, this.colorSpace, hex2rgb(hex) as number[],
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
    setBlendMode(newBlendMode: BlendingType) {
      this.blendMode = newBlendMode;
    },
    adjustContrast(method: number, coeff?: number) {
      if (!this.isAdjustingPlt) return;
      const { converter, inverter } = this.spaceInfos;
      const originRgbs = this.cards.map((card) => inverter(card.originColor));
      let newRgbs = originRgbs;
      switch (method) {
      case 0:
        newRgbs = scaling(originRgbs, coeff as number) as number[][];
        break;
      case 1:
        newRgbs = gammaCorrection(originRgbs, coeff as number) as number[][];
        break;
      }
      for (let i = 0; i < this.numOfCards; i++) {
        this.cards[i].color = converter(newRgbs[i]);
        this.cards[i].hex = rgb2hex(newRgbs[i]);
      }
    },
  },
});
export default usePltStore;
