<template>
  <div className="toolContainer" :style="props.fgFilter">
    <TheIcon type="close" :style="closeIconStyle"
      @click="delCard"
    />
    <TheIcon :type="isLockIcon"
      @click="isLockChanged"
    />
    <TheIcon :type="isFavIcon"
      @click="handleFavClick"
    />
    <TheIcon type="move" style="cursor: grab;"
      @mousedown="$emit('dragging-card', $event)"
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
import type {cardType} from '@/features/types/pltType.ts';

type Props = {
  cardId: number
  numOfCards: number;
  card: cardType;
  fgFilter: Partial<CSSStyleValue>;
}
const props = defineProps<Props>();
// States / Consts
const pltState = usePltStore();
const favState = useFavStore();
const isFav = computed(() => {
  return favState.colors.includes(props.card.hex);
});

const closeIconStyle = computed(() => {
  return props.numOfCards === 2 ?
    {
      opacity: '0',
      cursor: 'default',
    } as Partial<CSSStyleValue> :
    undefined;
});
const isLockIcon = computed(() => props.card.isLock ? 'lock' : 'unlock');
const isFavIcon = computed(() => isFav.value ? 'fav' : 'unfav');

// Icon Events
function delCard() {
  pltState.delCard(props.cardId);
}
function isLockChanged() {
  pltState.setIsLock(props.cardId);
}
function handleFavClick() {
  favState.favColorsChanged(props.card.hex);
}
function refreshCard() {
  pltState.refreshCard(props.cardId);
}
function isEditingChanged() {
  pltState.setIsEditing(props.cardId);
}
</script>

<style lang="scss" src="./TheCard.scss"></style>
