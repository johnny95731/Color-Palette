<template>
  <div
    :class="$style.toolContainer"
    :style="showToolbar"
    role="toolbar"
    :aria-label="`卡片${cardIdx}工具列`"
    @keydown="stopPropagation"
  >
    <CondWrapper
      tag="div"
      :is-wrap="isSmall"
    >
      <TheBtn
        v-once
        icon="close"
        :style="closeIconStyle"
        aria-label="移除"
        @click="$emit('remove')"
      />
      <TheBtn
        v-memo="[card.isLock]"
        :icon="isLock.icon"
        :style="closeIconStyle"
        :aria-label="isLock.label"
        @click="pltState.setIsLock(cardIdx)"
      />
      <TheBtn
        :icon="isFavIcon.icon"
        :aria-label="isFavIcon.label"
        @click="favState.favColorsChanged(card.hex);"
      />
    </CondWrapper>
    <CondWrapper
      tag="div"
      :is-wrap="isSmall"
    >
      <TheBtn
        icon="draggable"
        style="cursor: grab;"
        aria-label="拖動"
        @mousedown.passive="$emit('dragging', $event)"
        @touchstart.passive="$emit('dragging', $event)"
      />
      <TheBtn
        icon="refresh"
        aria-label="刷新"
        @click="pltState.refreshCard(cardIdx)"
      />
      <TheBtn
        icon="edit"
        aria-label="調整"
        aria-haspopup="dialog"
        @click="pltState.setEditingIdx(cardIdx)"
      />
    </CondWrapper>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { toValue } from '@vueuse/core';
import $style from './TheCard.module.scss';
import TheBtn from '../Custom/TheBtn.vue';
import CondWrapper from '../Custom/CondWrapper.vue';
import { stopPropagation } from '@/utils/browser';
// Stores
import usePltStore from '@/features/stores/usePltStore.ts';
import useFavStore from '@/features/stores/useFavStore';
// Types
import type { CSSProperties } from 'vue';
import type { CardType } from '@/features/types/pltStore';

type Props = {
  cardIdx: number
  card: CardType;
  isSmall: boolean;
}
const props = defineProps<Props>();

defineEmits<{
  (e: 'remove'): void,
  (e: 'dragging', val: MouseEvent | TouchEvent): void
}>();
// States / Consts
const pltState = usePltStore();
const favState = useFavStore();
const isFav = computed(() => {
  return favState.colors.includes(props.card.hex);
});
const showToolbar = computed(() => {
  return {
    opacity: pltState.isPending ? '0' : undefined
  };
});

const closeIconStyle = computed<CSSProperties | undefined>(() => {
  return pltState.numOfCards === 2 ?
    {
      opacity: '0',
      cursor: 'default',
    } : undefined;
});
const isLock = computed(() => (
  props.card.isLock ?
    { icon: 'lock', label: '解鎖刷新' } as const :
    { icon: 'unlock', label: '鎖定刷新' } as const
));
const isFavIcon = computed(() => (
  toValue(isFav) ?
    { icon: 'fav', label: '移出書籤' } as const :
    { icon: 'unfav', label: '加入書籤' } as const
));
</script>
