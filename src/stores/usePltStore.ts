import { defineStore } from 'pinia';
// Utils
import { reduce } from '@/utils/helpers.ts';
import { cloneDeep, map, COLOR_SPACES, randRgbGen, getColorSpace, hex2rgb, rgb2hex, mixColors, SORTING_ACTIONS, sortColors, adjContrast, meanMix, toSpace } from '@johnny95731/color-utils';
import useSettingStore from './useSettingStore';
// Types
import type { ColorSpace, Sort } from '@johnny95731/color-utils';


export const MIN_NUM_OF_CARDS = 2;
export const MAX_NUM_OF_CARDS = 8;


export const SPACES = map(
  COLOR_SPACES,
  ({ name_ }) => ({
    name: name_,
    val: name_
  })
);
SPACES.unshift({ ...SPACES[0] });
SPACES[0].name = 'NAMED';
SPACES[0].val = 'NAMED';

/**
 * Storage of IDs. Get value when creating new card. Save to storage when delete
 * card.
 */
const cardIDs = map(MAX_NUM_OF_CARDS, i => i);

/**
 * The current order of cards.
 */
export type OrderState = Exclude<Sort, 'reversion'>;

export type Card = {
  /**
   * Unique identity for controling the transition of card.
   */
  id_: number;
  /**
   * Order of card in palette.
   */
  order_: number;
  /**
   * RGB hex code.
   */
  hex_: string;
  /**
   * Color array in specific color space.
   */
  color_: number[];
  /**
   * Stores hex before editing the palette.
   */
  originHex_: string;
  /**
   * Stores color before editing the palette.
   */
  originColor_: number[];
  /**
   * The card is lock (can't refresh the card).
   */
  isLock_: boolean;
  /**
   * The card is in bookmarks.
   */
  isFav_: boolean;
};


type State = {
  cards_: Card[];
  /**
   * The order of cards.
   */
  sortBy_: OrderState;
  /**
   * Start dealing events.
   */
  isPending_: boolean;
  /**
   * Index of card that is editing.
   */
  editingIdx_: number;
  /**
   * Edit the palette.
   */
  isAdjustingPlt_: boolean;
  /**
   * Method of card color mix.
   */
  mixMode_: number;
  /**
   * Color space which will be displayed under hex code and be used in edit
   * mode.
   */
  spaceName_: string;
  colorSpace_: ColorSpace
}


const usePltStore = defineStore('plt', {
  state(): State {
    return {
      cards_: [],
      sortBy_: 'random',
      isPending_: false,
      editingIdx_: -1,
      isAdjustingPlt_: false,
      mixMode_: 0,
      spaceName_: 'NAMED',
      colorSpace_: COLOR_SPACES[0]
    };
  },
  getters: {
    isInNamedSpace_(): boolean {
      return this.spaceName_ === 'NAMED';
    },
    numOfCards_(): number {
      return this.cards_.length;
    },
    isEditing_(): boolean {
      return this.editingIdx_ !== -1;
    },
    editingDialogInfo_(): {
      labels_: string[],
      max_: number[],
      displayedRange_: (readonly [number, number])[],
      len_: number
      } {
      const { max_, labels_ } = this.colorSpace_;
      return {
        labels_,
        max_: map(max_, bound => bound[1]),
        displayedRange_: map(max_, (r) => {
          return r[1] === 360 ? r : [r[0] === 0 ? 0 : -100, 100];
        }),
        len_: labels_.length
      };
    }
  },
  actions: {
    initCards_() {
      for (let i = 0; i < 5; i++) this.cards_.push(this.newCard_(i));
    },
    newCard_(
      order: number, id?: Card['id_'], color?: number[]
    ): Card {
      const { fromRgb_, toRgb_ } = this.colorSpace_;
      color ??= fromRgb_(randRgbGen());
      const hex = rgb2hex(toRgb_(color));
      return {
        id_: id ?? cardIDs.shift()!,
        order_: order,
        hex_: hex,
        color_: color,
        originHex_: hex,
        originColor_: color,
        isLock_: false,
        isFav_: false,
      };
    },
    mixCard_(rIdx: number) {
      const lIdx = rIdx - 1;
      // Evaluate new color.
      const { fromRgb_, toRgb_ } = this.colorSpace_;
      const cards = this.cards_;

      let leftColor: number[];
      let rightColor: number[];
      if (!this.mixMode_) { // In original space
        leftColor = cards[lIdx]?.color_ ?? fromRgb_([0, 0, 0]);
        rightColor = cards[rIdx]?.color_ ?? fromRgb_([255, 255, 255]);
        return meanMix(leftColor, rightColor);
      } else { // Conver to RGB.
        // -Add to the fist position. Blending the first card and black.
        leftColor =
          lIdx < 0 ? [0, 0, 0] : toRgb_(cards[lIdx].color_);
        // -Add to the last position. Blending the last card and white.
        rightColor =
          rIdx >= this.numOfCards_ ?
            [255, 255, 255] :
            toRgb_(cards[rIdx].color_);
        return fromRgb_(mixColors([leftColor, rightColor], this.mixMode_));
      }
    },
    addCard_(idx: number, color: number[]) {
      if (this.numOfCards_ == MAX_NUM_OF_CARDS) return;

      const newCard = this.newCard_(
        this.numOfCards_,
        undefined,
        color
      );
      this.cards_.splice(idx, 0, newCard);

      this.resetOrder_();
      this.checkAutoSort_();
    },
    delCard_(idx: number) {
      if (this.numOfCards_ === MIN_NUM_OF_CARDS) return;

      const card = this.cards_.splice(idx, 1)[0];
      cardIDs.push(card.id_);

      this.resetOrder_();
      this.checkAutoSort_();
    },
    refreshCard_(idx: number) {
      const cards = this.cards_;
      if (idx >= 0 && !cards[idx].isLock_) {
        cards[idx] = this.newCard_(idx, cards[idx].id_);
      } else if (idx < 0) {
        this.cards_ = map(cards, (card, i) =>
          card.isLock_ ? card : this.newCard_(i, card.id_)
        );
      }

      this.checkAutoSort_();
    },
    editCard_(idx: number, color: number[]) {
      const toRgb = this.colorSpace_.toRgb_;

      const card = this.cards_[idx];
      card.color_ = color;
      card.hex_ = rgb2hex(toRgb(color));

      this.sortBy_ = 'random';
    },
    checkAutoSort_() {
      const oldSortBy = this.sortBy_;
      // Prevent trigger reversion: when newSortBy === oldSortBy
      this.sortBy_ = 'random';
      if (useSettingStore().autoSort && oldSortBy !== 'random') {
        this.sortCards_(oldSortBy);
      }
    },
    sortCards_(sortBy?: Sort) {
      sortBy ??= this.sortBy_;
      let cards = cloneDeep(this.cards_);

      let opIdx = SORTING_ACTIONS.indexOf(sortBy);
      if (opIdx !== 1 && this.sortBy_ === sortBy) opIdx = 2;

      const { toRgb_, fromRgb_ } = this.colorSpace_;
      const rgbGetter = (card: Card) => toRgb_(card.color_);

      // OpIdx > 2 <=> TSP sort.
      // The first element will compare to the black in TSP sort.
      if (opIdx > 2) cards.unshift(this.newCard_(-1, -1, fromRgb_([0,0,0])));
      cards = sortColors(cards, opIdx, rgbGetter);
      if (opIdx > 2) cards.shift(); // TSP sort will not move first element.

      reduce(cards, (_, card, i) => card.id_ = this.cards_[i].id_);
      this.cards_ = cards;

      /**
       * Inversion will not change sortBy. For example, if cards are sorted
       * by gray, inversion just change the most lightest card on left side
       * or on right side.
       */
      if (opIdx !== 2)
        // @ts-expect-error
        this.sortBy_ = sortBy;
      this.resetOrder_();
    },
    setIsLock_(idx: number) {
      this.cards_[idx].isLock_ = !this.cards_[idx].isLock_;
    },
    setEditingIdx_(idx?: number) {
      idx ??= -1;
      this.editingIdx_ = this.editingIdx_ === idx ? -1 : idx;
    },
    moveCardOrder_(cardIdx: number, to: number) {
      const initOrder = this.cards_[cardIdx].order_;
      if (initOrder !== to) {
        for (const card of this.cards_) {
          if (initOrder < card.order_ && card.order_ <= to)
            card.order_--;
          else if (to <= card.order_ && card.order_ < initOrder)
            card.order_++;
        }
        this.cards_[cardIdx].order_ = to;
        this.sortBy_ = 'random';
      }
    },
    // Plt state
    sortByOrder_() {
      this.cards_.sort((a, b) => a.order_ - b.order_);
    },
    /**
     * Set card.order_ = index.
     */
    resetOrder_() {
      reduce(this.cards_, (_, card, i) => card.order_ = i);
    },
    setIsPending_(newVal: boolean) {
      this.isPending_ = newVal;
    },
    setIsAdjustingPlt_(val: 'start' | 'reset' | 'cancel') {
      // start: Start adjusting and store origin color.
      // reset: Keep adjusting and reset color.
      // cancel: Keep adjusting and reset color.
      this.isAdjustingPlt_ = val !== 'cancel';
      if (val === 'start') {
        reduce(
          this.cards_,
          (_, card) => {
            card.originHex_ = card.hex_;
            card.originColor_ = [...card.color_];
          }
        );
      } else { // 'reset' and 'cancel'
        reduce(
          this.cards_,
          (_, card) => {
            card.hex_ = card.originHex_;
            card.color_ = [...card.originColor_];
          }
        );
      }
    },
    setPlt_(plt: string[] | number[][]) {
      const fromRgb = this.colorSpace_.fromRgb_;
      const callback = (color: string | number[]): number[] => {
        return Array.isArray(color) ? color : fromRgb(hex2rgb(color));
      };
      // newCard_ will take first value of cardIDs
      cardIDs.unshift(...map(this.cards_, (card) => card.id_));
      this.cards_ = map(
        plt,
        (color, i) => this.newCard_(i, undefined, callback(color))
      );
      this.sortBy_ = 'random';
    },
    setColorSpace_(space: string) {
      const oldSpace = this.colorSpace_;
      const newSpace =  getColorSpace(space);
      this.spaceName_ = space;
      this.colorSpace_ = newSpace;
      reduce(
        this.cards_,
        (_, card) =>
          card.color_ = toSpace(card.color_, oldSpace, newSpace),
      );
    },
    adjustContrast_(method: number, coeff?: number) {
      if (!this.isAdjustingPlt_) return;
      const { fromRgb_, toRgb_ } = this.colorSpace_;

      const rgbs = map(this.cards_, card => toRgb_(card.originColor_));
      const newRgbs = adjContrast(rgbs, method, coeff!);
      reduce(this.cards_, (_, card, i) => {
        card.color_ = fromRgb_(newRgbs[i]);
        card.hex_ = rgb2hex(newRgbs[i]);
      });
    },
  },
});
export default usePltStore;
