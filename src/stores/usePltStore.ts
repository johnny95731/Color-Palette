import { defineStore } from 'pinia';
// Utils
import { map, forLoop, shuffle } from '@/utils/helpers.ts';
import { randRgbGen, getSpaceInfos, COLOR_SPACES } from '@/utils/colors.ts';
import { hex2rgb, rgb2hex } from '@/utils/colorModels/hex';
import { getMixer } from '@/utils/manipulate/mixing';
import { getDistOp, SORTING_ACTIONS, tspGreedy } from '@/utils/manipulate/sorting';
import { CONTRAST_METHODS, getContrastAdjuster } from '@/utils/manipulate/contrast';
import useSettingStore from './useSettingStore';
// Types
import type { ColorSpaceInfos, ColorSpace } from '@/utils/colors.ts';
import type { Mixing } from '@/utils/manipulate/mixing';
import type { SortActions } from '@/utils/manipulate/sorting';


export const MIN_NUM_OF_CARDS = 2;
export const MAX_NUM_OF_CARDS = 8;

/**
 * The current order of cards.
 */
export type OrderState = Exclude<SortActions, 'inversion'>;


export type Card = {
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


/**
 * Create a new state object.
 * @return {Card} State object.
 */
const newCard = (
  order: number, colorSpace: ColorSpace, color?: number[],
): Card => {
  const { converter, inverter } = getSpaceInfos(colorSpace);
  if (!color) color = converter(randRgbGen());
  const hex = rgb2hex(inverter(color));
  return {
    order_: order,
    hex_: hex,
    color_: color,
    originHex_: hex,
    originColor_: color,
    isLock_: false,
    isFav_: false,
  };
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
   * How to evaluate a new color when insert a new card.
   */
  mixMode_: Mixing;
  /**
   * Color space which will be displayed under hex code and be used in edit
   * mode.
   */
  colorSpace_: ColorSpace;
}


const usePltStore = defineStore('plt', {
  state(): State {
    const space = COLOR_SPACES.find(({ name_: name_ }) => name_ === 'Named')!;
    return {
      cards_: map(5, (_, i) => newCard(i, space)),
      sortBy_: 'random',
      isPending_: false,
      editingIdx_: -1,
      isAdjustingPlt_: false,
      mixMode_: 'mean',
      colorSpace_: space,
    };
  },
  getters: {
    isInNamedSpace_(): boolean {
      return this.colorSpace_.name_ === 'Named';
    },
    numOfCards_(): number {
      return this.cards_.length;
    },
    isEditing_(): boolean {
      return this.editingIdx_ !== -1;
    },
    spaceInfos_(): ColorSpaceInfos  {
      return getSpaceInfos(this.colorSpace_);
    },
  },
  actions: {
    mixCard_(left: number, right?: number) {
      right ??= left + 1;
      // Evaluate new color.
      let rgb;
      if (this.mixMode_ === 'random') rgb = randRgbGen();
      else {
        const { inverter } = this.spaceInfos_;
        // Pick cards.
        let leftRgbColor;
        let rightRgbColor;
        // -Add to thequallyLengthsition. Blending the first card and black.
        if (left < 0) leftRgbColor = [0, 0, 0];
        else leftRgbColor = inverter(this.cards_[left].color_);
        // -Add to the last position. Blending the last card and white.
        if (right >= this.numOfCards_) rightRgbColor = [255, 255, 255];
        else rightRgbColor = inverter(this.cards_[right].color_);
        rgb = getMixer(this.mixMode_)(
          leftRgbColor, rightRgbColor, this.colorSpace_,
        );
      }
      return rgb;
    },
    addCard_(idx: number, rgb: number[]) {
      if (this.numOfCards_ == MAX_NUM_OF_CARDS) return;
      const tempSort = this.sortBy_;
      const cards = this.cards_;
      const cardState = newCard(idx, this.colorSpace_, this.spaceInfos_.converter(rgb));
      forLoop(cards, (_, card) => {
        if (card.order_ >= idx) card.order_++;
      });
      cards.splice(idx, 0, cardState);
      this.sortBy_ = 'random';
      if (useSettingStore().autoSort && tempSort !== 'random') {
        this.sortCards_(tempSort);
      }
    },
    delCard_(idx: number) {
      if (this.numOfCards_ === MIN_NUM_OF_CARDS) return;
      const tempSort = this.sortBy_;
      const cards = this.cards_;
      const removedOrder = cards.splice(idx, 1)[0].order_;
      forLoop(cards, (_, card) => {
        if (card.order_ > removedOrder) card.order_--;
      });
      this.sortBy_ = 'random';
      if (useSettingStore().autoSort && tempSort !== 'random') {
        this.sortCards_(tempSort);
      }
    },
    refreshCard_(idx: number) {
      const tempSort = this.sortBy_;
      if (idx >= 0) {
        if (this.cards_[idx].isLock_) return;
        this.cards_[idx] = newCard(idx, this.colorSpace_);
      } else if (idx === -1) {
        forLoop(this.cards_, (_, card, i) =>
          card.isLock_ || Object.assign(card, newCard(i, this.colorSpace_))
        );
      }
      this.sortBy_ = 'random';
      if (useSettingStore().autoSort && tempSort !== 'random') {
        this.sortCards_(tempSort);
      }
    },
    editCard_(idx: number, color: number[]) {
      const { inverter } = this.spaceInfos_;
      const card = this.cards_[idx];
      card.color_ = color;
      card.hex_ = rgb2hex(inverter(color));
      this.sortBy_ = 'random';
    },
    sortCards_(sortBy: SortActions) {
      const opIdx = SORTING_ACTIONS.indexOf(sortBy);
      const op = getDistOp(sortBy);
      if (opIdx === 1) { // random
        shuffle(this.cards_);
      } else if (
        opIdx === 2 || // inversion
        this.sortBy_ === SORTING_ACTIONS[opIdx]
      ) {
        this.cards_.reverse();
      } else if (opIdx === 0) {
        const distToBlack = map(this.cards_, ({ hex_: hex }) => {
          return op(hex, '#000');
        });
        this.cards_.sort((a, b) => {
          return distToBlack[a.order_] - distToBlack[b.order_];
        });
      }
      else {
        const dist = (a: Pick<Card, 'hex_'>, b: Pick<Card, 'hex_'>) => {
          return op(a.hex_, b.hex_);
        };
        this.cards_ = tspGreedy(this.cards_, dist, { hex_: '#000' });
      }
      /**
       * Inversion will not change sortBy. For example, if cards are sorted
       * by gray, inversion just change the most lightest card on left side
       * or on right side.
       */
      if (opIdx !== 2)
        // @ts-expect-error
        this.sortBy_ = sortBy;
      forLoop(this.cards_, (_, card, i) => card.order_ = i);
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
      if (initOrder <= to) {
        forLoop(
          this.cards_,
          (_, card) => {
            if (initOrder < card.order_ && card.order_ <= to)
              card.order_--;
          }
        );
      } else {
        forLoop(
          this.cards_,
          (_, card) => {
            if (to <= card.order_ && card.order_ < initOrder)
              card.order_++;
          }
        );
      }
      this.cards_[cardIdx].order_ = to;
      this.sortBy_ = 'random';
    },
    // Plt state
    resetOrder_() {
      this.cards_.sort((a, b) => a.order_ - b.order_);
      forLoop(this.cards_, (_, card, i) => card.order_ = i);
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
        forLoop(
          this.cards_,
          (_, card) => {
            card.originHex_ = card.hex_;
            card.originColor_ = [...card.color_];
          }
        );
      } else { // 'reset' and 'cancel'
        forLoop(
          this.cards_,
          (_, card) => {
            card.hex_ = card.originHex_;
            card.color_ = [...card.originColor_];
          }
        );
      }
    },
    setPlt_(plt: string[] | number[][]) {
      const { converter } = this.spaceInfos_;
      const callback = (color: string | number[]) => {
        return Array.isArray(color) ? color : converter(hex2rgb(color));
      };
      this.cards_ = map<Card, string | number[]>(
        plt,
        (color, i) => newCard(
          i, this.colorSpace_, callback(color),
        )
      );
      this.sortBy_ = 'random';
    },
    setColorSpace_(idx: number) {
      this.colorSpace_ = COLOR_SPACES[idx];
      const { converter } = this.spaceInfos_;
      forLoop(
        this.cards_,
        (_, card) => {
          const rgb = hex2rgb(card.hex_) as number[];
          card.color_ = converter(rgb);
        },
      );
    },
    setBlendMode_(newBlendMode: Mixing) {
      this.mixMode_ = newBlendMode;
    },
    adjustContrast_(method: number, coeff?: number) {
      if (!this.isAdjustingPlt_) return;
      const { converter, inverter } = this.spaceInfos_;

      const arr = map(
        this.cards_,
        card => inverter(card.originColor_)
      );
      const adjuster = getContrastAdjuster(CONTRAST_METHODS[method]);

      const newRgbs = adjuster(arr, coeff!);
      forLoop(this.cards_, (_, card, i) => {
        card.color_ = converter(newRgbs[i]);
        card.hex_ = rgb2hex(newRgbs[i]);
      });
    },
  },
});
export default usePltStore;
