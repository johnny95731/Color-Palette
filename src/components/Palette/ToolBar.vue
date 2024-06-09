<template>
  <div
    className="toolContainer"
    :style="showToolbar"
  >
    <TheIcon
      type="close"
      :style="closeIconStyle"
      @click="$emit('remove')"
    />
    <TheIcon
      :type="isLockIcon"
      @click="pltState.setIsLock(cardIdx)"
    />
    <TheIcon
      :type="isFavIcon"
      @click="favState.favColorsChanged(card.hex);"
    />
    <TheIcon
      type="move"
      style="cursor: grab;"
      @mousedown="$emit('dragging', $event)"
      @touchstart="$emit('dragging', $event)"
    />
    <TheIcon
      type="refresh"
      @click="pltState.refreshCard(cardIdx)"
    />
    <TheIcon
      type="edit"
      @click="pltState.setEditingIdx(cardIdx)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import TheIcon from '../TheIcon.vue';
// Stores
import usePltStore from '@/features/stores/usePltStore.ts';
import useFavStore from '@/features/stores/useFavStore.ts';
import media from '@/features/useMedia';
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
    display: pltState.isPending ? 'none' : undefined,
    opacity: (pltState.editingIdx === props.cardIdx && !media.isSmall) ? '0' : ''
  };
});

const closeIconStyle = computed<CSSProperties | undefined>(() => {
  return pltState.numOfCards === 2 ?
    {
      opacity: '0',
      cursor: 'default',
    } : undefined;
});
const isLockIcon = computed(() => props.card.isLock ? 'lock' : 'unlock');
const isFavIcon = computed(() => isFav.value ? 'fav' : 'unfav');
</script>

<style lang="scss" src="./TheCard.scss"></style>
