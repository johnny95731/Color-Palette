<template>
  <div
    ref="cardContainerRef"
    :class="$style.container"
  >
    <TheCard
      v-for="(card, i) in pltState.cards_"
      :key="`card${i}`"
      :ref="(el) => cardRefs[i] = (el as CardInstance)"
      :class="draggingIdx === i && $style.dragging"
      :style="[styleInSettings, cardStyle[i]]"
      :cardIdx="i"
      :card="card"
      @transitionend="isInTrans.arr[i] = false;"
      @remove="handleRemoveCard(i)"
      @dragging="startDragging($event)"
    />
    <!-- Insert Region -->
    <div
      v-show="isShowInsert"
      :class="$style.insertOverlay"
    >
      <div
        v-for="(val, i) in cardPosition"
        :key="`insert${i}`"
        :class="$style.insertWrapper"
        :style="val"
      >
        <TheBtn
          variant="flat"
          icon="arrows-expand-vertical"
          @click="handleAddCard(i)"
          :aria-label="`新增於位置${i}`"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, watch, nextTick } from 'vue';
import $style from './ThePalette.module.scss';
import TheBtn from '../Custom/TheBtn.vue';
import TheCard from './TheCard.vue';
import { useDragableElement } from '@/composables/useDragableElement';
import { equallyLength, evalPosition, map } from '@/utils/helpers';
import { rangeMapping, round } from '@/utils/numeric';
import { rgb2hex } from '@/utils/colors';
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


/**
 * Card left or top (depend on window width).
 */
const cardPosition = computed(
  () => map(
    pltState.numOfCards_ + 1,
    (_, i) => ({ [media.pos]: evalPosition(i, pltState.numOfCards_) })
  )
);

const resetCardStyle = () => {
  const length = pltState.numOfCards_;
  cardStyle.value = map(pltState.cards_, (_,i) => ({
    [media.pos]: evalPosition(i, length),
    [media.isSmall ? 'height' : 'width']: equallyLength(length),
    transitionProperty: 'none'
  }));
};
const cardStyle = ref<CSSProperties[]>([]);
resetCardStyle();

const setSize = (idx: number, size?: string) => {
  cardStyle.value[idx][media.isSmall ? 'height' : 'width'] =
    size ?? equallyLength(pltState.numOfCards_);
};
const setPosition = (idx: number, pos?: string) => {
  cardStyle.value[idx][media.pos] = pos ?? evalPosition(pltState.cards_[idx].order_, pltState.numOfCards_);
};
const setTransitionProperty = (idx: number, newVal: 'none' | '') => {
  cardStyle.value[idx].transitionProperty = newVal;
};

watch(() => [pltState.numOfCards_, media.isSmall], resetCardStyle);
watch(() => pltState.isPending_, (newVal) => {
  const property = newVal ? '' : 'none';
  for (let i = 0; i < pltState.numOfCards_; i++)
    setTransitionProperty(i, property);
  if (draggingIdx.value)
    setTransitionProperty(draggingIdx.value, newVal ? 'none' : '');
}, { flush: 'sync' });

// Set style to all cards.
/**
 * Set position of card from `start` to `end` with total cards
 * number `total`.
 * @param start The first index that be set position.
 * @param end The final index that be set position.
 * @param total Total number of cards.
 */
const resetPosition = (pass?: number) => {
  for (let i = 0; i < pltState.numOfCards_; i++) {
    if (i !== pass) setPosition(i);
  }
};

// Add card, remove card, and drag card have transition event.
// The state is for checking the transition is end.
const isInTrans = reactive<{arr: boolean[]}>({
  arr: map(INIT_NUM_OF_CARDS, () => false),
});


/**
 * Infomation that be used in some events like mouseup(dragging end), add a
 * card, or remove card.
 */
const eventInfo = ref<{
  event_: 'mouseup' | 'add' | 'remove';
  idx_?: number;
  rgb_?: number[];
} | null
>(null);

// Insert Regions
const handleAddCard = (idx: number) => {
  const newRgb = pltState.mixCard_(idx - 1);
  if (!settingsState.transition.pos) { // no transition.
    pltState.addCard_(idx, newRgb);
  } else {
    pltState.setIsPending_(true);
    document.body.style.backgroundColor = rgb2hex(newRgb);
    eventInfo.value = { event_: 'add', idx_: idx, rgb_: newRgb };
    // Transition: shrink and move card. The enpty space is new card
    const length = equallyLength(pltState.numOfCards_ + 1);
    for (let i = 0; i < pltState.numOfCards_; i++) {
      setSize(i, length);
      const bias = i >= idx ? 1 : 0;
      setPosition(i, evalPosition(i + bias, pltState.numOfCards_ + 1));
    }
    // Trigger side effect when !isInTrans.some()
    isInTrans.arr = map(INIT_NUM_OF_CARDS, () => true);
  }
};

// Handle delete card.
/**
 * Transition before delete card object.
 * @param idx
 */
const handleRemoveCard = (idx: number) => {
  if (pltState.numOfCards_ === 2) return;
  if (!settingsState.transition.pos) { // no transition.
    pltState.delCard_(idx);
  } else {
    pltState.setIsPending_(true);
    isInTrans.arr = map(pltState.cards_, () => true);
    const newSize = equallyLength(pltState.numOfCards_ - 1);
    // Shrink target card and expand other card.
    for (let i = 0; i < pltState.numOfCards_; i++) {
      setSize(i, i === idx ? '0' : newSize);
      const bias = i > idx ? 1 : 0;
      setPosition(i, evalPosition(i - bias, pltState.numOfCards_ - 1));
    }
    eventInfo.value = { event_: 'remove', idx_: idx };
  }
};

// Drag events start
const draggingIdx = ref<number | null>(null);
const { start: startDragging } = (() => {
  let cardIdx: number | null;
  let halfCardLength: number = 50 / pltState.numOfCards_;
  /** Get mouse position along specific axis. */
  const getCoordinate = (pos: Position) => media.isSmall ? pos.y : pos.x;
  /** Get index of card that cursor on  */
  const getIdx = (pos: Position) => {
    return rangeMapping(
      getCoordinate(pos),
      0, 100,
      -0.49, pltState.numOfCards_-0.51,
      0
    );
  };

  const setNewPosition = (pos?: Position) => {
    if (pos)
      setPosition(cardIdx!, `${round(getCoordinate(pos) - halfCardLength, 2)}%`);
    resetPosition(cardIdx!);
  };

  const onStart = (pos: Position) => {
    halfCardLength = 50 / pltState.numOfCards_;
    cardIdx = getIdx(pos);
    draggingIdx.value = cardIdx;
    isInTrans.arr[cardIdx] = true;
    pltState.setIsPending_(true);
    setNewPosition(pos);
  };
  const onMove = (pos: Position) => {
    if (!cardIdx) return;
    // Change `.order` attribute.
    pltState.moveCardOrder_(draggingIdx.value!, getIdx(pos));
    setNewPosition(pos);
  };
  const onEnd = () => {
    if (!cardIdx) return;
    eventInfo.value = { event_: 'mouseup' };
    if (!settingsState.transition.pos) {
      isInTrans.arr[cardIdx] = false;
    }
    // Dragging card move to target position.
    setPosition(cardIdx);
    cardStyle.value[cardIdx].transitionProperty = '';
    draggingIdx.value = cardIdx = null;
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
    if (someCardIsInTrans || !eventInfo.value) return;
    const info = eventInfo.value;
    eventInfo.value = null;
    const start = info?.idx_ ? info.idx_ : 0;
    switch (info.event_) {
    case 'add':
      document.body.style.backgroundColor = '';
      pltState.addCard_(start, info.rgb_ as number[]);
      break;
    case 'remove':
      pltState.delCard_(start);
      break;
    case 'mouseup':
      pltState.resetOrder_();
      resetPosition();
      break;
    }
    await nextTick();
    pltState.setIsPending_(false);
  }
);

/**
 * Style of insertion region.
 */
const isShowInsert = computed(() =>
  !(pltState.numOfCards_ === MAX_NUM_OF_CARDS || pltState.isPending_));
</script>
