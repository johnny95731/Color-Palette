<template>
  <div className="toolContainer" :style="props.fgFilter">
    <TheIcon type="close" :style="closeIconStyle"
      @click="$emit('remove')"
    />
    <TheIcon :type="isLockIcon"
      @click="isLockChanged"
    />
    <TheIcon :type="isFavIcon"
      @click="handleFavClick"
    />
    <TheIcon type="move" style="cursor: grab;"
      @mousedown="$emit('dragging', $event)"
    />
    <TheIcon type="refresh"
      @click="refreshCard"
    />
    <TheIcon type="edit"
      @click="isEditingChanged"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import TheIcon from '../TheIcon.vue';
// Stores
import usePltStore from '@/features/stores/usePltStore.ts';
import useFavStore from '@/features/stores/useFavStore.ts';
// Types
import type {CSSProperties} from 'vue';
import type {CardType} from '@/features/types/pltType.ts';

type Props = {
  cardIdx: number
  card: CardType;
  fgFilter: CSSProperties;
}
const props = defineProps<Props>();
// States / Consts
const pltState = usePltStore();
const favState = useFavStore();
const isFav = computed(() => {
  return favState.colors.includes(props.card.hex);
});

const closeIconStyle = computed<CSSProperties>(() => {
  return pltState.numOfCards === 2 ?
    {
      opacity: '0',
      cursor: 'default',
    } :
    {};
});
const isLockIcon = computed(() => props.card.isLock ? 'lock' : 'unlock');
const isFavIcon = computed(() => isFav.value ? 'fav' : 'unfav');

// Icon Events
function isLockChanged() {
  pltState.setIsLock(props.cardIdx);
}
function handleFavClick() {
  favState.favColorsChanged(props.card.hex);
}
function refreshCard() {
  pltState.refreshCard(props.cardIdx);
}
function isEditingChanged() {
  pltState.setIsEditing(props.cardIdx);
}
</script>

<style lang="scss" src="./TheCard.scss"></style>
