<template>
  <div
    :class="styles.toolContainer"
    :style="showToolbar"
    role="toolbar"
    :aria-label="`卡片${cardIdx}工具列`"
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
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import styles from './TheCard.module.scss';
import TheBtn from '../Custom/TheBtn.vue';
// Stores
import usePltStore from '@/features/stores/usePltStore.ts';
import useFavStore from '@/features/stores/useFavStore.ts';
// Types
import type { CSSProperties } from 'vue';
import type { CardType } from '@/features/types/pltType.ts';

type Props = {
  cardIdx: number
  card: CardType;
  fgFilter: CSSProperties;
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
    ...props.fgFilter,
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
  isFav.value ?
    { icon: 'fav', label: '移出書籤' } as const :
    { icon: 'unfav', label: '加入書籤' } as const
));
</script>
