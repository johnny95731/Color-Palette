<template>
<div :class="$style.main">
  <TheCard v-for="(card, i) in pltState.cards" :key="`card${i}`"
    :ref="(el) => cardRefs[i] = (el as cardInstance)"
    :cardId="i"
    :numOfCards="pltState.numOfCards"
    :card="card"
    @dragging-card="handleDraggingCard($event, i)"
  />
  <!-- Insert Region -->
  <div :style="displayStyle"
  >
    <div v-for="(_, i) in Array.from({length: pltState.numOfCards + 1})"
      :key="`insert${i}`"
      tabindex="-1"
      class="insertWrapper"
      :style="positions[i]"
    >
      <div @click="handleAddCard(i)" >
        <TheIcon type="insert" />
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import {ref, watchEffect, inject, toRefs, computed, useCssModule} from 'vue';
import TheIcon from '../TheIcon.vue';
import TheCard from './TheCard.vue';
// Stores / Contexts
import usePltStore from '@/features/stores/usePltStore';
import useOptionsStore from '@/features/stores/useOptionsStore';
// Types
import type {Ref} from 'vue';
import type {MediaContextType} from '@/features/types/mediaType';

type cardInstance = InstanceType<typeof TheCard>;

const $style = useCssModule();
const cardRefs = ref<{
  nowDragging: number | null;
  [key: number]: cardInstance;
}>({nowDragging: null});

const pltState = usePltStore();
const optionsState = useOptionsStore();
const media = inject('media') as Ref<MediaContextType>;
const {windowSize, isSmall, pos, clientPos, bound} = toRefs(media.value);
const cardLength = computed(() => {
  const pltLength = windowSize.value[isSmall.value ? 0 : 1] - bound.value[0];
  return pltLength / pltState.numOfCards;
});
const cardsPos = computed(() => (
  Array.from({length: pltState.numOfCards},
      (_, i) => bound.value[0] + Math.floor(i * cardLength.value),
  )
));

// Drag events start
/**
 * The event is triggered when the `<->` icon on a card is dragging.
 * @param {number} cardId The n-th card.
 */
const handleDraggingCard = function(
    e: MouseEvent | TouchEvent, cardId: number,
) {
  if (!cardRefs.value) return;
  // Disable pull-to-refresh on mobile.
  document.body.style.overscrollBehavior = 'none';
  // Cursor position when mouse down.
  const nowPos = (
    (e as MouseEvent)[clientPos.value] ||
    (e as TouchEvent).touches[0][clientPos.value]
  );
  pltState.setIsReordering(true);
  cardRefs.value.nowDragging = cardId;
  const card = cardRefs.value[cardId].$el;
  card.classList.add($style.dragging);
  card.style[pos.value] = `${nowPos - cardsPos.value[cardId]}px`;
};

/**
 * The event is triggered when the `<->` icon on a card is dragging and mouse
 * is moving.
 */
const handleMouseMove = function(e: MouseEvent | TouchEvent) {
  const prevIdx = cardRefs.value.nowDragging;
  if (prevIdx === null) return;
  const nowPos = e.type === 'touchmove' ?
      (e as TouchEvent).touches[0][clientPos.value] :
      (e as MouseEvent)[clientPos.value];
  // Mouse is not in range.
  if (nowPos < bound.value[0] || nowPos > bound.value[1]) return;
  let card = cardRefs.value[prevIdx].$el;
  // Index of card that cursor at.
  const nowIdx = Math.floor((nowPos - bound.value[0]) / cardLength.value);
  if (prevIdx !== nowIdx) {
    // Reset prev dragging card.
    card.style[pos.value] = '';
    card.classList.remove($style.dragging);
    // Set current dragging card.
    card = cardRefs.value[nowIdx].$el;
    cardRefs.value.nowDragging = nowIdx;
    card.classList.add($style.dragging);
    pltState.moveCard({init: prevIdx, final: nowIdx});
  }
  card.style[pos.value] = `${nowPos - cardsPos.value[nowIdx]}px`;
};

/**
 * The event is triggered when release left buton.
 */
const handleMouseUp = function() {
  // Able pull-to-refresh on mobile.
  document.body.style.overscrollBehavior = '';

  const nowIdx = cardRefs.value.nowDragging;
  if (nowIdx == null) return;
  const card = cardRefs.value[nowIdx].$el;
  // Reset dragging card.
  card.style[pos.value] = '';
  card.classList.remove($style.dragging);
  pltState.setIsReordering(false);
  cardRefs.value.nowDragging = null;
};

watchEffect((cleanup) => {
  const body = document.body;
  body.addEventListener('mousemove', handleMouseMove);
  body.addEventListener('mouseup', handleMouseUp);
  body.addEventListener('touchmove', handleMouseMove);
  body.addEventListener('touchend', handleMouseUp);
  cleanup(() => {
    body.removeEventListener('mousemove', handleMouseMove);
    body.removeEventListener('mouseup', handleMouseUp);
    body.removeEventListener('touchmove', handleMouseMove);
    body.removeEventListener('touchend', handleMouseUp);
  });
});
// Drag events end

// Insert Regions
/**
 * Hide regions when pltState.numOfCards === 8(maximum of cards)
 */
const displayStyle = pltState.numOfCards === 8 ? {display: 'none'} : undefined;
/**
 * Positions (style: {left: positions[i]}) of insert.
 */
const positions = computed(() => {
  const step = 100 / pltState.numOfCards;
  return Array.from({length: pltState.numOfCards + 1}, (_, i) => {
    const style: {[key: string]: string} = {};
    style[media.value.pos] = `${i * step}%`;
    return style;
  });
});
const handleAddCard = function(idx: number) {
  pltState.addCard({
    idx,
    blendMode: optionsState.blendMode,
    colorSpace: optionsState.colorSpace,
  });
};
</script>

<style lang="scss" module>
@import '@/assets/commons.scss';
.main {
  position: absolute;
  display: flex;
  width: 100%;
  height: calc(100% - 60px);
  overflow: hidden;

  @include small {
    flex-direction: column;
    height: calc(100% - 40px);
  }
}

.dragging {
  position: relative;
  box-shadow: 0px 0px 20px black;
  border-width: 0px 1px;
  border-style: solid;
  border-color: #fff;
  transform: translateX(-50%);
  pointer-events: none;
  overscroll-behavior: none;
  z-index: 1;

  @include small {
    border-width: 1px 0px;
    transform: translateY(-50%);
  }
}
</style>
