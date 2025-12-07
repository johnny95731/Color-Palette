<template>
  <main
    ref="cardContainerRef"
    :class="$style.container"
    :style="paletteGradient"
  >
    <TransitionGroup
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @before-leave="onBeforeLeave"
    >
      <VCard
        v-for="(card, i) in pltState.cards_"
        :key="card.id_"
        :ref="(el) => (cardRefs[i] = el as CardInstance)"
        :class="draggingIdx === i && $style.dragging"
        :style="[settingStyle, cardStyle[i]]"
        :cardIdx="i"
        @transitionend="isInTrans[i] = false"
        @remove="removeCard(i)"
        @dragging="startDragging($event)"
      />
    </TransitionGroup>
    <!-- Insert Region -->
    <div
      v-show="isShowingInsert"
      :class="$style.insertOverlay"
    >
      <div
        v-memo="[pltState.numOfCards_, media.cardPos_]"
        v-for="(val, i) in cardPosition"
        :key="`insert${i}`"
        :class="$style.insertWrapper"
        :style="{
          [media.cardPos_]: val,
        }"
      >
        <VBtn
          variant="flat"
          icon="arrows-expand-vertical"
          @click="addCard(i)"
          :aria-label="`新增於位置${i}`"
        />
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { map, rangeMapping, round } from '@johnny95731/color-utils';
import { computed, nextTick, ref, unref, watch } from 'vue';

import { useDragableElement } from '@/composables/useDragableElement';
import media from '@/composables/useMedia';
import usePltStore, { MAX_NUM_OF_CARDS } from '@/stores/usePltStore';
import useSettingStore from '@/stores/useSettingStore';
import { isNullish } from '@/utils/helpers';
import { frac2percentage, toPercent } from '@/utils/numeric';

import VCard from './VCard.vue';
import $style from './VPalette.module.scss';
import VBtn from '../Custom/VBtn.vue';

import type { Position } from '@vueuse/core';
import type { CSSProperties } from 'vue';


type CardInstance = InstanceType<typeof VCard>;

const cardContainerRef = ref<HTMLDivElement>();
const cardRefs = ref<CardInstance[]>([]);

const pltState = usePltStore();
const settingsState = useSettingStore();

const paletteGradient = computed(() => {
  if (settingsState.paletteDisplay === 'block') return;
  else {
    const direction = `${media.isSmall_ ? 180 : 90}deg`;
    const step = 1 / pltState.numOfCards_;
    const half = step / 2;
    const cards = map(pltState.cards_, card => ({
      hex_: card.hex_,
      order_: card.order_,
    }));
    cards.sort((a, b) => a.order_ - b.order_); // Works only when dragging
    const colorStops = map(
      cards,
      (card, i) => `${card.hex_} ${toPercent(half + i * step, 0)}%`,
    );
    return {
      background: `linear-gradient(${direction},${colorStops.join()})`,
    };
  }
});

const settingStyle = computed<CSSProperties>(() => {
  const pos = settingsState.transition.pos;
  const color = settingsState.transition.color;
  return {
    ...(settingsState.paletteDisplay === 'block' && {
      borderWidth: `${settingsState.border.width / 2}px`,
      borderColor: settingsState.border.show ? settingsState.border.color : '',
    }),
    transitionDuration: `${pos}ms, ${pos}ms, ${color}ms`,
  };
});

const cardPosition = computed(() =>
  map(pltState.numOfCards_ + 1, i =>
    frac2percentage(i, pltState.numOfCards_),
  ),
);

const resetCardStyle = (transition: 'none' | '' = '') => {
  const pos = unref(cardPosition);
  cardStyle.value = map(pltState.numOfCards_, i => ({
    [media.cardPos_]: pos[i],
    [media.cardSize_]: pos[1],
    transitionProperty: transition,
  }));
};
const cardStyle = ref<
  {
    top?: CSSProperties['top']
    left?: CSSProperties['left']
    height?: CSSProperties['height']
    width?: CSSProperties['width']
    transitionProperty?: CSSProperties['transitionProperty']
  }[]
>([]);
resetCardStyle();

const setSize = (idx: number, size: string) => {
  unref(cardStyle)[idx][media.cardSize_] = size;
};

const setPosition = (idx: number, pos?: string) => {
  unref(cardStyle)[idx][media.cardPos_]
    = pos ?? unref(cardPosition)[pltState.cards_[idx].order_];
};

const setTransitionProperty = (idx: number, newVal: 'none' | '') => {
  unref(cardStyle)[idx].transitionProperty = newVal;
};

watch(
  () => pltState.numOfCards_,
  () => resetCardStyle(),
  { flush: 'sync' },
);
watch(
  () => media.isSmall_,
  () => resetCardStyle(),
);

// Add card, remove card, and drag card trigger transition.
// The state is for checking the transition is end.
const isInTrans = ref<boolean[]>(map(pltState.cards_, () => false));

/**
 * Infomation that be used in some events like mouseup(dragging end), add a
 * card, or remove card.
 */
const eventInfo = ref<{
  isDraggingEvent_?: boolean
  idx_?: number
} | null>(null);

const addCard = async (idx: number) => {
  pltState.addCard_(idx, pltState.mixCard_(idx));
  if (settingsState.transition.pos) {
    setSize(idx, '0');
    setPosition(idx, frac2percentage(idx, pltState.numOfCards_ - 1));
    isInTrans.value = map(pltState.cards_, () => true);
    pltState.setIsPending_(true);
    eventInfo.value = { idx_: idx };
  }
};

const onBeforeEnter = (el: Element) => {
  if (!isNullish(eventInfo)) {
    const idx = unref(eventInfo)!.idx_!;
    setSize(idx, frac2percentage(1, pltState.numOfCards_));
    setPosition(idx);
  }
  else {
    const style = (el as HTMLElement).style;
    style[media.cardSize_] = '0';
    style[media.cardPos_] = '100%';
  }
};

const onEnter = (el: Element, done: () => void) => {
  if (isNullish(eventInfo)) {
    const style = (el as HTMLElement).style;
    style[media.cardSize_] = '0';
    style[media.cardPos_] = '100%';
    nextTick().then(done);
  }
};
const onAfterEnter = (el: Element) => {
  if (isNullish(eventInfo)) {
    const style = (el as HTMLElement).style;
    const idx = [...unref(cardContainerRef)!.children].findIndex(
      child => child === el,
    );
    style[media.cardSize_] = frac2percentage(1, pltState.numOfCards_);
    style[media.cardPos_] = frac2percentage(idx, pltState.numOfCards_);
  }
};

const removeCard = (idx: number) => {
  if (pltState.numOfCards_ === 2) return;
  pltState.delCard_(idx);
  if (settingsState.transition.pos) {
    isInTrans.value = map(pltState.cards_, () => true);
    pltState.setIsPending_(true);
    eventInfo.value = { idx_: idx };
  }
};

const onBeforeLeave = (el: Element) => {
  const style = (el as HTMLElement).style;
  const idx = [...unref(cardContainerRef)!.children].findIndex(
    child => child === el,
  );
  if (!isNullish(eventInfo)) {
    style[media.cardSize_] = '0';
  }
  else {
    style[media.cardSize_] = '100%'; // fill empty space.
  }
  style[media.cardPos_] = frac2percentage(idx, pltState.numOfCards_);
};

const draggingIdx = ref<number | null>(null);
const { start: startDragging } = (() => {
  let cardIdx: number | null;
  let halfCardLength: number = 50 / pltState.numOfCards_;
  /** Get mouse position along specific axis. */
  const getCoordinate = (pos: Position) => (media.isSmall_ ? pos.y : pos.x);
  /** Get index of card that cursor on  */
  const getIdx = (pos: Position) => {
    return rangeMapping(
      getCoordinate(pos),
      0,
      100,
      -0.49,
      pltState.numOfCards_ - 0.51,
      0, // rounding to integer
    );
  };

  const setNewPosition = (pos: Position) => {
    const len = pltState.numOfCards_;
    for (let i = 0; i < len; i++) setPosition(i);
    setPosition(cardIdx!, `${round(getCoordinate(pos) - halfCardLength, 2)}%`);
  };

  const onStart_ = (pos: Position) => {
    halfCardLength = 50 / pltState.numOfCards_;
    cardIdx = getIdx(pos);
    unref(isInTrans)[cardIdx] = true;
    pltState.setIsPending_(true);
    draggingIdx.value = cardIdx;
    setTransitionProperty(cardIdx, 'none');
    setNewPosition(pos);
  };
  const onMove_ = (pos: Position) => {
    if (!isNullish(cardIdx)) {
      pltState.moveCardOrder_(cardIdx, getIdx(pos));
      setNewPosition(pos);
    }
  };
  const onEnd_ = () => {
    if (!isNullish(cardIdx)) {
      eventInfo.value = { isDraggingEvent_: true };
      if (!settingsState.transition.pos) {
        unref(isInTrans)[cardIdx] = false; // Triggering resetting order.
      }
      setTransitionProperty(cardIdx, '');
      setPosition(cardIdx);
      draggingIdx.value = cardIdx = null;
    }
  };
  return useDragableElement(cardContainerRef, {
    containerElement_: cardContainerRef,
    binding_: false,
    onStart_,
    onMove_,
    onEnd_,
  });
})();

// Side effect when transition is over.
watch(
  () => unref(isInTrans).some(val => val),
  (someCardIsInTrans) => {
    if (someCardIsInTrans || !unref(eventInfo)) return;
    if (unref(eventInfo)!.isDraggingEvent_) {
      pltState.sortByOrder_();
      resetCardStyle('none');
      // update after 2 frames, 34 ~= 1000ms / 30ms
      setTimeout(() => {
        for (let i = 0; i < pltState.numOfCards_; i++) {
          setTransitionProperty(i, '');
        }
      }, 34);
    }
    pltState.setIsPending_(false);
    eventInfo.value = null;
  },
);

/**
 * Style of insertion region.
 */
const isShowingInsert = computed(
  () => !(pltState.numOfCards_ === MAX_NUM_OF_CARDS || pltState.isPending_),
);
</script>
