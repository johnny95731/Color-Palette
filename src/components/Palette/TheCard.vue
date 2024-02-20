<template>
  <div class="cardContainer"
    :style="style"
    @transitionend="$emit('transitionend')"
  >
    <ToolBar
      :cardIdx="cardIdx"
      :card="card"
      :fgFilter="fgFilter"
      @remove="$emit('remove')"
      @dragging="$emit('dragging', $event)"
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
        {{ `${pltState.colorSpace}(${colorArr.toString()})` }}
      </div>
    </div>
    <EditingDialog v-if="card.isEditing"
      :cardIdx="cardIdx"
      :card="card"
      :colorSpace="pltState.colorSpace"
      :colorArr="colorArr"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed, inject, ref, watch} from 'vue';
// Components
import TheIcon from '../TheIcon.vue';
import ToolBar from './ToolBar.vue';
import EditingDialog from './EditingDialog.vue';
// Utils
import {rgb2gray, getSpaceTrans} from '@/utils/colors';
import {copyHex, evalLength, evalPosition} from '@/utils/helpers';
// Stores
import usePltStore from '@/features/stores/usePltStore';
// Types
import type {Ref, CSSProperties} from 'vue';
import type {CardType} from '@/features/types/pltType';
import type {MediaContextType} from '@/features/types/mediaType';

type Props = {
  cardIdx: number;
  card: CardType;
  styleInSettings: CSSProperties
};
const props = defineProps<Props>();
const pltState = usePltStore();
const media = inject('media') as Ref<MediaContextType>;

const size = ref<string>(evalLength(pltState.numOfCards));
function setSize(newVal: string) {
  size.value = newVal;
}
const pos = ref<string>(evalPosition(props.cardIdx, pltState.numOfCards));
function setPos(newVal: string) {
  pos.value = newVal;
}
const transProperty = ref<'none' | ''>('');
function setTransProperty(newVal: 'none' | 'reset') {
  if (newVal === 'none') {
    transProperty.value = 'none';
  } else {
    transProperty.value = '';
  }
}

const style = computed<CSSProperties>(function() {
  return {
    ...props.styleInSettings,
    backgroundColor: props.card.hex,
    [media.value.pos]: pos.value,
    [media.value.isSmall ? 'height' : 'width']: size.value,
    transitionProperty: transProperty.value as string,
  };
});

defineExpose({
  setSize,
  setPos,
  setTransProperty,
});

const inverter = computed(() => {
  return getSpaceTrans(pltState.colorSpace).inverter;
});
const isLight = computed(() => {
  const rgb = inverter.value(props.card.color);
  return rgb2gray(rgb) > 127;
});
const colorArr = computed(() => {
  return props.card.color.map((val) => Math.round(val));
});
const fgFilter = computed<CSSProperties>(() => {
  return {
    display: pltState.isPending ? 'none' : '',
    filter: isLight.value ? '' : 'invert(1)',
  };
});

watch(() => pltState.numOfCards, (newNum) => {
  setPos(evalPosition(props.cardIdx, newNum));
  setSize(evalLength(newNum));
});
</script>

<style lang="scss" src="./TheCard.scss" />
