import { createSlice } from '@reduxjs/toolkit';
// Utils
import {
  hex2rgb, randRgbGen, rgb2gray, rgb2hex, gammaCorrection, getSpaceTrans,
  scaling,
} from 'utils/colors';
import { shuffle } from 'utils/helpers';
import {
  INIT_NUM_OF_CARDS, INIT_COLOR_SPACE, MAX_NUM_OF_CARDS,
} from 'utils/constants';
// Types
import type {
  CardType, OrderStateType, SortActionType, ColorSpacesType, BlendingType,
} from 'types/pltType';

/**
 * Create a new state object.
 * @return {CardType} State object.
 */
export const newCard = (
    order: number, colorSpace: ColorSpacesType, rgb?: number[],
): CardType => {
  const infos = getSpaceTrans(colorSpace);
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
  /**
   * Total number of cards.
   */
  numOfCards: number;
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
   * Adjust entire the palette.
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
  numOfCards: INIT_NUM_OF_CARDS,
  cards: Array.from({ length: INIT_NUM_OF_CARDS },
      (_, i) => newCard(i, INIT_COLOR_SPACE)),
  sortBy: 'random',
  isPending: false,
  editingIdx: -1,
  isAdjustingPlt: false,
  blendMode: 'mean',
  colorSpace: INIT_COLOR_SPACE,
};

const cardSlice = createSlice({
  name: 'plt',
  initialState,
  reducers: {
    // Card actions
    addCard(state, action: {
      payload: {
        idx: number;
        rgb: number[];
      };
      type: string;
    }) {
      if (state.numOfCards == MAX_NUM_OF_CARDS) return state;
      const { idx, rgb } = action.payload;
      const cards = state.cards;
      const cardState = newCard(idx, state.colorSpace, rgb);
      cards.forEach((card) => {
        if (card.order >= idx) card.order += 1;
      });
      cards.splice(idx, 0, cardState);
      state.numOfCards = cards.length;
    },
    delCard(state, action: {
      payload: number;
      type: string;
    }) {
      if (state.numOfCards === 2) return state;
      const idx = action.payload;
      const removedOrder = state.cards.splice(idx, 1)[0].order;
      state.numOfCards = state.numOfCards - 1;
      state.cards.forEach((card) => {
        if (card.order > removedOrder) card.order -= 1;
      });
    },
    refreshCard(state, action: {
      payload: number;
      type: string;
    }) {
      const idx = action.payload;
      if (idx >= 0 && !state.cards[idx].isLock) {
        state.cards[idx] = newCard(state.cards[idx].order, state.colorSpace);
      } else if (idx === -1) {
        for (let i = 0; i < state.numOfCards; i++) {
          if (state.cards[i].isLock) continue;
          state.cards[i] = newCard(state.cards[i].order, state.colorSpace);
        }
      }
      state.sortBy = 'random';
    },
    editCard(state, action: {
      payload: {
        idx: number;
        color: number[];
      };
      type: string;
    }) {
      const { idx, color } = action.payload;
      const { inverter } = getSpaceTrans(state.colorSpace);
      state.cards[idx].hex = rgb2hex(inverter(color));
      state.cards[idx].color = color;
      state.sortBy = 'random';
    },
    sortCards(state, action: {
      payload: SortActionType;
      type: string;
    }) {
      const sortBy = action.payload;
      const { inverter } = getSpaceTrans(state.colorSpace);
      switch (sortBy) {
        case 'gray':
          if (state.sortBy === 'gray') state.cards.reverse();
          else {
            state.cards.sort((a, b) => {
              return rgb2gray(inverter(a.color)) - rgb2gray(inverter(b.color));
            });
            state.sortBy = 'gray';
          }
          break;
        case 'inversion':
          /**
           * Inversion will not change sortBy. For example, if cards are sorted
           * by gray (brightness), inversion just change most lightest card on
           * left side or on right side.
           */
          state.cards.reverse();
          break;
        case 'random':
          shuffle(state.cards);
          state.sortBy = 'random';
      }
      state.cards.forEach((card, i) => card.order = i);
    },
    setIsLock(state, action: {
      payload: number;
      type: string;
    }) {
      const idx = action.payload;
      state.cards[idx].isLock = !state.cards[idx].isLock;
    },
    moveCardOrder(state, action: {
      payload: {cardIdx: number; to: number};
      type: string;
    }) {
      const { cardIdx, to } = action.payload;
      const initOrder = state.cards[cardIdx].order;
      if (initOrder <= to) {
        state.cards.forEach((card) => {
          if (card.order > initOrder && card.order <= to) card.order -= 1;
        });
      } else {
        state.cards.forEach((card) => {
          if (card.order >= to && card.order < initOrder) card.order += 1;
        });
      }
      state.cards[cardIdx].order = to;
      state.sortBy = 'random';
    },
    // Plt state
    /**
     * which card start editing
     */
    setEditingIdx(state, action: {
      payload: number | undefined;
      type: string;
    }) {
      const idx = action.payload ?? -1;
      state.editingIdx = state.editingIdx === idx ? -1 : idx;
    },
    resetOrder(state) {
      state.cards.sort((a, b) => a.order - b.order);
      state.cards.forEach((card, i) => card.order = i);
    },
    setIsPending(state, action: {
      payload: boolean;
      type: string;
    }) {
      const newVal = action.payload;
      state.isPending = newVal;
    },
    setIsAdjustingPlt(state, action: {
      payload: 'start' | 'reset' | 'cancel';
      type: string;
    }) {
      // start: Start adjusting and store origin color.
      // reset: Keep adjusting and reset color.
      // cancel: Keep adjusting and reset color.
      const val = action.payload;
      state.isAdjustingPlt = val !== 'cancel';
      if (val === 'start') {
        state.cards.forEach((card) => {
          card.originHex = card.hex;
          card.originColor = card.color;
        });
      } else { // "reset" and "cancel"
        state.cards.forEach((card) => {
          card.hex = card.originHex;
          card.color = card.originColor;
        });
      }
    },
    setPlt(state, action: {
      payload: string[];
      type: string;
    }) {
      const plt = action.payload;
      state.cards = plt.map((hex, i) => newCard(
          i, state.colorSpace, hex2rgb(hex) as number[],
      ));
      state.numOfCards = plt.length;
      state.sortBy = 'random';
    },
    setColorSpace(state, action: {
      payload: ColorSpacesType;
      type: string;
    }) {
      state.colorSpace = action.payload;
      const { converter } = getSpaceTrans(action.payload);
      for (let i = 0; i < state.numOfCards; i++) {
        const rgb = hex2rgb(state.cards[i].hex) as number[];
        state.cards[i].color = converter(rgb);
      }
    },
    setBlendMode(state, action: {
      payload: BlendingType;
      type: string;
    }) {
      state.blendMode = action.payload;
    },
    adjustContrast(state, action: {
      payload: {
        method: string;
        coeff?: number;
      };
      type: string;
    }) {
      if (!state.isAdjustingPlt) return state;
      const { method, coeff } = action.payload;
      const { converter, inverter } = getSpaceTrans(state.colorSpace);
      const originRgbs = state.cards.map((card) => inverter(card.originColor));
      let newRgbs = originRgbs;
      switch (method) {
        case 'multiplication':
          newRgbs = scaling(originRgbs, coeff as number) as number[][];
          break;
        case 'gamma':
          newRgbs = gammaCorrection(originRgbs, coeff as number) as number[][];
          break;
      }
      for (let i = 0; i < state.numOfCards; i++) {
        state.cards[i].color = converter(newRgbs[i]);
        state.cards[i].hex = rgb2hex(newRgbs[i]);
      }
    },
  },
});

export const {
  addCard, delCard, refreshCard, editCard, sortCards, setIsLock, setEditingIdx,
  moveCardOrder, setIsPending, setIsAdjustingPlt, setPlt, setColorSpace,
  setBlendMode, adjustContrast, resetOrder,
} = cardSlice.actions;
export default cardSlice.reducer;
