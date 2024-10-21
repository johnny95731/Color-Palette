<template>
  <div
    ref="cardContainerRef"
    :class="$style.container"
  >
    <TheCard
      v-for="(card, i) in pltState.cards"
      :key="`card${i}`"
      :ref="(el) => cardRefs[i] = (el as CardInstance)"
      :class="draggingIdx === i && $style.dragging"
      :cardIdx="i"
      :card="card"
      :cardDisplay="{
        size: cardAttrs.size.percent,
        position: cardAttrs.positions[i]
      }"
      :styleInSettings="styleInSettings"
      @transitionend="setIsInTrans(i, false)"
      @remove="handleRemoveCard(i)"
      @dragging="startDragging($event)"
    />
    <!-- Insert Region -->
    <div
      v-show="isShowInsert"
      :class="$style.insertOverlay"
    >
      <div
        v-for="(val, i) in cardAttrs.positions"
        :key="`insert${i}`"
        :class="$style.insertWrapper"
        :style="{[media.pos]: val}"
      >
        <TheBtn
          variant="flat"
          icon="insert"
          @click="handleAddCard(i)"
          :aria-label="`新增於位置${i}`"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, toValue, watch, nextTick } from 'vue';
import $style from './ThePalette.module.scss';
import TheBtn from '../Custom/TheBtn.vue';
import TheCard from './TheCard.vue';
import { useDragableElement } from '@/composables/useDragableElement';
import { equallyLength, evalPosition } from '@/utils/helpers';
import { rangeMapping, round } from '@/utils/numeric';
import { randRgbGen, rgb2hex } from '@/utils/colors';
import { mixers } from '@/utils/mixing';
import { INIT_NUM_OF_CARDS, MAX_NUM_OF_CARDS } from '@/constants/pltStore';
// Stores / Contexts
import usePltStore from '@/features/stores/usePltStore';
import useSettingStore from '@/features/stores/useSettingStore';
import media from '@/composables/useMedia';
// Types
import type { CSSProperties } from 'vue';
import type { Position } from '@vueuse/core';

type CardInstance = InstanceType<typeof TheCard>;

const cardContainerRef = ref<HTMLDivElement>();
const cardRefs = ref<CardInstance[]>([]);

const pltState = usePltStore();
const settingsState = useSettingStore();

const styleInSettings = computed<CSSProperties>(() => ({
  borderWidth: `${settingsState.border.width / 2}px`,
  borderColor: settingsState.border.show ? settingsState.border.color : '',
  transitionDuration: (
    `${settingsState.transition.pos}ms, ${
      settingsState.transition.pos}ms, ${
      settingsState.transition.color}ms`
  ),
}));

function calcCardAttrs() {
  const totalSpace = media.windowSize[media.isSmall ? 0 : 1] - media.bound[0];
  return {
    /**
     * Card width or height (depend on window width).
     */
    size: {
      px: totalSpace / pltState.numOfCards,
      percent: equallyLength(pltState.numOfCards)
    },
    /**
     * Card left or top (depend on window width).
     */
    positions: Array.from({ length: pltState.numOfCards + 1 },
      (_, i) => evalPosition(i, pltState.numOfCards),
    ),
  };
}
const cardAttrs = reactive(calcCardAttrs());
watch(() => pltState.numOfCards, () => {
  Object.assign(cardAttrs, calcCardAttrs());
});

// Set style to all cards.
/**
 * Set position of card from `start` to `end` with total cards
 * number `total`.
 * @param start The first index that be set position.
 * @param end The final index that be set position.
 * @param total Total number of cards.
 */
const resetPosition = (pass?: number) => {
  for (let i = 0; i < pltState.numOfCards; i++) {
    if (i !== pass)
      toValue(cardRefs)[i].setPos(evalPosition(i, pltState.numOfCards));
  }
};
const removeTransition = () => {
  for (let i = 0; i < pltState.numOfCards; i++) {
    toValue(cardRefs)[i].setTransProperty('none');
  }
};
const resetTransition = (end?: number, pass?: number) => {
  end ??= pltState.numOfCards;
  for (let i = 0; i < end; i++) {
    if (i !== pass)
      toValue(cardRefs)[i].setTransProperty('reset');
  }
};

// Add card, remove card, and drag card have transition event.
// The state is for checking the transition is end.
const isInTrans = reactive<{arr: boolean[]}>({
  arr: Array.from({ length: INIT_NUM_OF_CARDS }, () => false),
});
function setIsInTrans(idx: number, newVal: boolean) {
  const newState = [...isInTrans.arr];
  newState[idx] = newVal;
  isInTrans.arr = newState;
}

/**
 * Infomation that be used in some events like mouseup(dragging end), add a
 * card, or remove card.
 */
const eventInfo = ref<{
  event: 'mouseup' | 'add' | 'remove';
  idx?: number;
  rgb?: number[];
} | null
>(null);

// Insert Regions
const handleAddCard = (idx: number) => {
  // Evaluate new color.
  let rgb;
  if (pltState.mixMode === 'random') rgb = randRgbGen();
  else {
    const { inverter } = pltState.spaceInfos;
    // Pick cards.
    let leftRgbColor;
    let rightRgbColor;
    // -Add to thequallyLengthsition. Blending the first card and black.
    if (!idx) leftRgbColor = [0, 0, 0];
    else leftRgbColor = inverter(pltState.cards[idx - 1].color);
    // -Add to the last position. Blending the last card and white.
    if (idx === pltState.numOfCards) rightRgbColor = [255, 255, 255];
    else rightRgbColor = inverter(pltState.cards[idx].color);
    rgb = mixers[pltState.mixMode](
      leftRgbColor, rightRgbColor, pltState.colorSpace,
    );
  }
  if (!settingsState.transition.pos) { // no transition.
    pltState.addCard(idx, rgb);
    removeTransition();
    setTimeout(() => resetTransition(), 50);
    return;
  }
  document.body.style.backgroundColor = rgb2hex(rgb);
  eventInfo.value = { event: 'add', idx, rgb };
  // Transition: shrink and move card. The enpty space is new card
  const length = equallyLength(pltState.numOfCards + 1);
  for (let i = 0; i < pltState.numOfCards; i++) {
    toValue(cardRefs)[i].setSize(length);
    const bias = i >= idx ? 1 : 0;
    toValue(cardRefs)[i].setPos(evalPosition(i + bias, pltState.numOfCards + 1));
  }
  // Trigger side effect when !isInTrans.some()
  isInTrans.arr = Array.from({ length: pltState.numOfCards }, () => true);
  pltState.setIsPending(true);
};

// Handle delete card.
/**
 * Transition before delete card object.
 * @param idx
 */
const handleRemoveCard = (idx: number) => {
  if (!settingsState.transition.pos) { // no transition.
    pltState.delCard(idx);
    removeTransition();
    setTimeout(() => resetTransition(pltState.numOfCards - 1), 50);
    return;
  }
  const newSize = equallyLength(pltState.numOfCards - 1);
  // Shrink target card and expand other card.
  for (let i = 0; i < pltState.numOfCards; i++) {
    toValue(cardRefs)[i].setSize(i === idx ? '0%' : newSize);
    const bias = i > idx ? 1 : 0;
    toValue(cardRefs)[i].setPos(evalPosition(i - bias, pltState.numOfCards - 1));
  }
  eventInfo.value = { event: 'remove', idx };
  isInTrans.arr = Array.from({ length: pltState.numOfCards }, () => true);
  pltState.setIsPending(true);
};

// Drag events start
const draggingIdx = ref<number | null>(null);
const { start: startDragging } = (() => {
  let card: CardInstance | null;
  const halfCardLength = computed(() => 100 / (2 * pltState.numOfCards));
  /** Get mouse position along specific axis. */
  const getCoordinate = (pos: Position) => media.isSmall ? pos.y : pos.x;
  /** Get index of card that cursor on  */
  const getIdx = (pos: Position) => {
    return rangeMapping(
      getCoordinate(pos),
      0, 100,
      -0.49, pltState.numOfCards-0.51,
      0
    );
  };

  const setNewPosition = (pos?: Position) => {
    pos && card?.setPos(`${round(getCoordinate(pos) - halfCardLength.value, 2)}%`);
    for (let i = 0; i < pltState.numOfCards; i++) {
      if (i !== draggingIdx.value)
        toValue(cardRefs)[i].setPos(cardAttrs.positions[pltState.cards[i].order]);
    }
  };

  const onStart = (pos: Position) => {
    draggingIdx.value = getIdx(pos);
    if (settingsState.transition.pos) {
      setIsInTrans(draggingIdx.value, true);
    }
    pltState.setIsPending(true);
    card = toValue(cardRefs)[draggingIdx.value];
    setNewPosition(pos);
    card.setTransProperty('none');
  };
  const onMove = (pos: Position) => {
    if (!card) return;
    // Change `.order` attribute.
    pltState.moveCardOrder(draggingIdx.value!, getIdx(pos));
    setNewPosition(pos);
  };
  const onEnd = () => {
    if (!card) return;
    eventInfo.value = { event: 'mouseup' };
    if (!settingsState.transition.pos) {
      removeTransition();
      pltState.resetOrder();
      resetPosition();
      return;
    }
    draggingIdx.value = null;
    // Dragging card move to target position.
    setNewPosition();
    card.setTransProperty('reset');
    card = null;
  };
  return useDragableElement(cardContainerRef, {
    containerElement: cardContainerRef,
    binding: false,
    onStart,
    onMove,
    onEnd,
  });
})();
// Drag events end
// Side effect when transition is over.
watch(() => isInTrans.arr.some((val) => val),
  async (someCardIsInTrans) => {
    if (someCardIsInTrans || !toValue(eventInfo)) return;
    const info = toValue(eventInfo) as NonNullable<typeof eventInfo.value>;
    // This LayoutEffect occurs only when transition is over.
    removeTransition();
    const start = info?.idx ? info.idx : 0;
    switch (info.event) {
    case 'add':
      document.body.style.backgroundColor = '';
      pltState.addCard(start, info.rgb as number[]);
      break;
    case 'remove':
      pltState.delCard(start);
      break;
    case 'mouseup':
      pltState.resetOrder();
      resetPosition();
      break;
    }
    eventInfo.value = null;
    await nextTick();
    resetTransition();
    pltState.setIsPending(false);
  }
);

/**
 * Style of insertion region.
 */
const isShowInsert = computed(() =>
  !(pltState.numOfCards === MAX_NUM_OF_CARDS || pltState.isPending));
</script>
