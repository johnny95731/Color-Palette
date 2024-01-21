import {defineStore} from 'pinia';
// Utils
import {rgb2gray, rgb2hex} from '@/utils/colors.ts';
import {shuffle, inversion} from '@/utils/helpers.ts';
import {blendBy} from '@/utils/blend.ts';
import {newCard} from '../types/pltType.ts';
// Types
import type {
  cardType, orderStateType, SortActionType,
} from '../types/pltType.ts';
import type {ColorSpacesType, BlendingType} from '../types/optionsType.ts';

type state = {
  /**
   * Total number of cards.
   */
  numOfCards: number;
  cards: cardType[];
  /**
   * The order of cards.
   */
  sortBy: orderStateType;
  /**
   * The cards is reordering. `true` if and only if cursor dragging a card.
   */
  isReordering: boolean;
}

const INIT_NUM_OF_CARDS = 5;
const initialState: state = {
  numOfCards: INIT_NUM_OF_CARDS,
  cards: Array.from({length: INIT_NUM_OF_CARDS}, () => newCard()),
  sortBy: 'random',
  isReordering: false,
};

const usePltStore = defineStore('plt', {
  state: (): state => initialState,
  actions: {
    addCard({idx, blendMode, colorSpace}: {
        idx: number;
        blendMode: BlendingType;
        colorSpace: ColorSpacesType;
    }) {
      if (this.numOfCards == 8) return;
      const cards = this.cards;
      const cardState = newCard();
      if (blendMode !== 'random') { // RGB Mean
        // Pick cards.
        let leftColor = cards[idx - 1]?.rgb;
        let rightColor = cards[idx]?.rgb;
        // -Add to the first. Blending the first card and black.
        if (!leftColor) leftColor = [0, 0, 0];
        // -Add to the last. Blending the last card and white.
        if (!rightColor) rightColor = [255, 255, 255];
        // Blend
        cardState.rgb = blendBy[blendMode](leftColor, rightColor, colorSpace);
      }
      cardState.hex = rgb2hex(cardState.rgb);
      this.cards.splice(idx, 0, cardState);
      this.numOfCards = this.numOfCards + 1;
    },
    delCard(idx: number) {
      if (this.numOfCards === 2) return;
      const [...cards] = this.cards;
      cards.splice(idx, 1);
      this.cards = cards;
      this.numOfCards = this.numOfCards - 1;
      return this;
    },
    refreshCard(idx: number) {
      if (idx >= 0) {
        if (this.cards[idx].isLock) return;
        this.cards[idx] = newCard();
      } else if (idx === -1) {
        for (let i = 0; i < this.numOfCards; i++) {
          if (this.cards[i].isLock) continue;
          this.cards[i] = newCard();
        }
      }
      this.sortBy = 'random';
    },
    editCard({idx, color}: {idx: number; color: number[]}) {
      this.cards[idx].rgb = color;
      this.cards[idx].hex = rgb2hex(color);
      this.sortBy = 'random';
    },
    sortCards(sortBy: SortActionType) {
      switch (sortBy) {
        case 'gray':
          if (this.sortBy === 'gray') {
            inversion(this.cards);
            break;
          }
          this.cards.sort((a, b) => rgb2gray(a.rgb) - rgb2gray(b.rgb));
          this.sortBy = 'gray';
          break;
        case 'inversion':
          /**
           * Inversion will not change sortBy. For example, if cards are sorted
           * by gray (brightness), inversion just change most lightest card on
           * left side or on right side.
           */
          inversion(this.cards);
          break;
        case 'random':
          shuffle(this.cards);
          this.sortBy = 'random';
      }
    },
    setIsLock(idx: number) {
      this.cards[idx].isLock = !this.cards[idx].isLock;
    },
    setIsEditing(idx: number, newVal?: boolean) {
      if (newVal === undefined) {
        this.cards[idx].isEditing = !this.cards[idx].isEditing;
      } else {
        this.cards[idx].isEditing = newVal;
      }
    },
    moveCard({init, final}: {init: number; final: number}) {
      const card = this.cards.splice(init, 1)[0];
      this.cards.splice(final, 0, card);
    },
    setIsReordering(newVal: boolean) {
      this.isReordering = newVal;
    },
    setPlt(colors: string[]) {
      this.cards = colors.map((hex) => newCard(hex));
      this.numOfCards = colors.length;
      this.sortBy = 'random';
    },
  },
});

export default usePltStore;
