<template>
  <main
    ref="cardContainerRef"
    :class="$style.container"
    :style="paletteGradient"
  >
    <TransitionGroup
      @before-enter="onBeforeEnter"
      @before-leave="onBeforeLeave"
    >
      <VCard
        v-for="(card, i) in pltState.cards_"
        :key="card.id_"
        :ref="(el) => cardRefs[i] = (el as CardInstance)"
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
        v-memo="[pltState.numOfCards_, media.beginPos_]"
        v-for="(val, i) in cardPosition"
        :key="`insert${i}`"
        :class="$style.insertWrapper"
        :style="{
          [media.beginPos_]: val
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
import { ref, computed, unref, watch } from 'vue';
import $style from './VPalette.module.scss';
import VBtn from '../Custom/VBtn.vue';
import VCard from './VCard.vue';
// utils
import { useDragableElement } from '@/composables/useDragableElement';
import { equallyLength, evalPosition, forLoop, isNullish, map } from '@/utils/helpers';
import { rangeMapping, round, toPercent } from '@/utils/numeric';
// Stores / Contexts
import usePltStore, { MAX_NUM_OF_CARDS } from '@/stores/usePltStore';
import useSettingStore from '@/stores/useSettingStore';
import media from '@/composables/useMedia';
// Types
import type { CSSProperties } from 'vue';
import type { Position } from '@vueuse/core';

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
    const cards = map(pltState.cards_, (card) => ({ hex_: card.hex_, order_: card.order_ }));
    cards.sort((a,b) => a.order_ - b.order_); // Works only when dragging
    const colorStops = map(
      cards,
      (card, i) => `${card.hex_} ${toPercent(half + i * step, 0)}%`
    );
    return {
      background: `linear-gradient(${direction},${colorStops.join()})`
    };
  }
});


const settingStyle = computed<CSSProperties>(() => {
  const pos = settingsState.transition.pos;
  const color = settingsState.transition.color;
  return {
    ...(
      settingsState.paletteDisplay === 'block' && {
        borderWidth: `${settingsState.border.width / 2}px`,
        borderColor: settingsState.border.show ? settingsState.border.color : ''
      }
    ),
    transitionDuration: `${pos}ms, ${pos}ms, ${color}ms`,
  };
});


const cardPosition = computed(
  () => map(
    pltState.numOfCards_ + 1,
    (_, i) => evalPosition(i, pltState.numOfCards_)
  )
);

const resetCardStyle = (transition: 'none' | '' = '') => {
  const length = pltState.numOfCards_;
  cardStyle.value = map(pltState.cards_, (_, i) => ({
    [media.beginPos_]: evalPosition(i, length),
    [media.cardAxis_]: equallyLength(length),
    transitionProperty: transition
  }));
};
const cardStyle = ref<{
  top?: CSSProperties['top']
  left?: CSSProperties['left']
  height?: CSSProperties['height']
  width?: CSSProperties['width']
  transitionProperty?: CSSProperties['transitionProperty']
}[]>([]);
resetCardStyle();

const setSize = (idx: number, size: string) => {
  unref(cardStyle)[idx][media.cardAxis_] = size;
};

const setPosition = (idx: number, pos?: string) => {
  unref(cardStyle)[idx][media.beginPos_] = pos ?? unref(cardPosition)[pltState.cards_[idx].order_];
};

const setTransitionProperty = (newVal: 'none' | '', idx?: number) => {
  const style = unref(cardStyle);
  if (isNullish(idx)) {
    forLoop(
      pltState.cards_,
      (_, __, i) => {
        style[i].transitionProperty = newVal;
      }
    );
  } else {
    style[idx].transitionProperty = newVal;
  }
};

watch(() => [pltState.numOfCards_, media.isSmall_], () => {
  resetCardStyle();
}, { flush: 'sync' });


// Add card, remove card, and drag card trigger transition.
// The state is for checking the transition is end.
const isInTrans = ref<boolean[]>(map(pltState.cards_, () => false));


/**
 * Infomation that be used in some events like mouseup(dragging end), add a
 * card, or remove card.
 */
const eventInfo = ref<{
  isDraggingEvent_?: boolean;
  idx_?: number;
    } | null
    >(null);


const addCard = async (idx: number) => {
  const newRgb = pltState.mixCard_(idx - 1);
  pltState.addCard_(idx, newRgb);
  if (settingsState.transition.pos) {
    setSize(idx, '0');
    setPosition(idx, evalPosition(idx, pltState.numOfCards_-1));
    isInTrans.value = map(pltState.cards_, () => true);
    pltState.setIsPending_(true);
    eventInfo.value = { idx_: idx };
  }
};

const onBeforeEnter = () => {
  if (!isNullish(eventInfo)) {
    const idx = unref(eventInfo)!.idx_!;
    setSize(idx, equallyLength(pltState.numOfCards_));
    setPosition(idx);
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
  if (!isNullish(eventInfo)) {
    const style = (el as HTMLElement).style;
    style[media.cardAxis_] = '0';
    style[media.beginPos_] = unref(cardPosition)[unref(eventInfo)!.idx_!];
  }
};


const draggingIdx = ref<number | null>(null);
const { start: startDragging } = (() => {
  let cardIdx: number | null;
  let halfCardLength: number = 50 / pltState.numOfCards_;
  /** Get mouse position along specific axis. */
  const getCoordinate = (pos: Position) => media.isSmall_ ? pos.y : pos.x;
  /** Get index of card that cursor on  */
  const getIdx = (pos: Position) => {
    return rangeMapping(
      getCoordinate(pos),
      0, 100,
      -0.49, pltState.numOfCards_-0.51,
      0 // rounding to integer
    );
  };

  const setNewPosition = (pos: Position) => {
    forLoop(
      pltState.cards_,
      (_, __, i) => setPosition(i)
    );
    setPosition(cardIdx!, `${round(getCoordinate(pos) - halfCardLength, 2)}%`);
  };

  const onStart_ = (pos: Position) => {
    halfCardLength = 50 / pltState.numOfCards_;
    cardIdx = getIdx(pos);
    unref(isInTrans)[cardIdx] = true;
    pltState.setIsPending_(true);
    draggingIdx.value = cardIdx;
    setTransitionProperty('none', cardIdx);
    setNewPosition(pos);
  };
  const onMove_ = (pos: Position) => {
    if (!isNullish(cardIdx)) {
      pltState.moveCardOrder_(unref(draggingIdx)!, getIdx(pos));
      setNewPosition(pos);
    }
  };
  const onEnd_ = () => {
    if (!isNullish(cardIdx)) {
      eventInfo.value = { isDraggingEvent_: true };
      if (!settingsState.transition.pos) {
        unref(isInTrans)[cardIdx] = false; // Triggering resetting order.
      }
      setTransitionProperty('', cardIdx);
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
watch(() => unref(isInTrans).some((val) => val),
  (someCardIsInTrans) => {
    if (someCardIsInTrans || !unref(eventInfo)) return;
    if (unref(eventInfo)?.isDraggingEvent_) {
      pltState.sortByOrder_();
      resetCardStyle('none');
      // update after 2 frames, 34 ~= 1000ms / 30ms
      setTimeout(setTransitionProperty, 34, '');
    }
    pltState.setIsPending_(false);
    eventInfo.value = null;
  }
);

/**
 * Style of insertion region.
 */
const isShowingInsert = computed(() =>
  !(pltState.numOfCards_ === MAX_NUM_OF_CARDS || pltState.isPending_));
</script>
