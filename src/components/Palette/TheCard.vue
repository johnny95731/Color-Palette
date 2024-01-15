<template>
  <div class="cardContainer"
    :style="{backgroundColor: card.hex}"
  >
    <ToolBar
      :cardId="cardId"
      :numOfCards="numOfCards"
      :card="card"
      :fgFilter="(fgFilter as Partial<CSSStyleValue>)"
      @dragging-card="$emit('dragging-card', $event)"
    />
    <div class="textDisplay">
      <div class="hexText"
        :style="fgFilter"
        @click="copyHex"
      >
        <TheIcon type="copy" />
        {{ card.hex }}
      </div>
      <div class="rgbText"
        :style="fgFilter"
        @click="copyHex"
      >
        <TheIcon type="copy" />
        {{ `${optionsState.colorSpace}(${colorArr.toString()})` }}
      </div>
    </div>
    <EditingDialog v-if="card.isEditing"
      :cardId="cardId"
      :card="card"
      :colorSpace="optionsState.colorSpace"
      :colorArr="colorArr"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
// Components
import TheIcon from '../TheIcon.vue';
import ToolBar from './ToolBar.vue';
import EditingDialog from './EditingDialog.vue';
// Utils
import {rgb2gray, getSpaceInfos} from '@/utils/colors';
import {copyHex} from '@/utils/helpers';
// Stores
import useOptionsStore from '@/features/stores/useOptionsStore.ts';
// Types
import type {cardType} from '@/features/types/pltType';

type Props = {
  cardId: number;
  numOfCards: number;
  card: cardType;
};
const props = defineProps<Props>();
const optionsState = useOptionsStore();

const spaceConverter = computed(() => {
  return getSpaceInfos(optionsState.colorSpace).converter;
});
const isLight = computed(() => rgb2gray(props.card.rgb) > 127);
const colorArr = computed(() => {
  return spaceConverter.value(props.card.rgb).map((val) => Math.round(val));
});
const fgFilter = computed(() => {
  return {filter: isLight.value ? '' : 'invert(1)'};
});
</script>

<style lang="scss" src="./TheCard.scss"></style>
