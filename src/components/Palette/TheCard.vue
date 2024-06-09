<template>
  <div
    :class="[
      'cardContainer',
      cardIdx === 0 ? 'first' : '',
      cardIdx === pltState.numOfCards-1 ? 'last' : '',
    ]"
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
      <div
        class="hexText"
        :style="fgFilter"
        @click="copyHex"
      >
        <TheIcon type="copy" />
        {{ card.hex }}
      </div>
      <div
        class="detailText"
        :style="fgFilter"
        @click="copyHex"
      >
        <TheIcon type="copy" />
        {{
          detail
        }}
      </div>
    </div>
    <EditingDialog
      v-if="pltState.editingIdx === cardIdx"
      :cardIdx="cardIdx"
      :card="card"
      :detail="detail"
      :colorSpace="pltState.colorSpace"
      :roundedColor="roundedColor"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue';
// Components
import TheIcon from '../TheIcon.vue';
import ToolBar from './ToolBar.vue';
import EditingDialog from './EditingDialog.vue';
// Utils
import { rgb2gray, namedColors } from '@/utils/colors';
import { equallyLength, evalPosition } from '@/utils/helpers';
import { copyHex } from '@/utils/eventHandler';
// Stores
import usePltStore from '@/features/stores/usePltStore';
// Types
import type { CSSProperties } from 'vue';
import type { CardType } from '@/features/types/pltType';
import type { MediaContextType } from '@/features/types/mediaType';

type Props = {
  cardIdx: number;
  card: CardType;
  cardDisplay: {
    size: string
    position: string;
  }
  styleInSettings: CSSProperties
};
const props = defineProps<Props>();
defineEmits<{
  (e: 'transitionend'): void,
  (e: 'remove'): void,
  (e: 'dragging', val: MouseEvent | TouchEvent): void
}>();

const pltState = usePltStore();
const media = inject('media') as MediaContextType;

const isLight = computed(() => {
  const { inverter } = pltState.spaceInfos;
  const rgb = inverter(props.card.color);
  return rgb2gray(rgb) > 127;
});
const roundedColor = computed(() => {
  return props.card.color.map((val) => Math.round(val));
});
const fgFilter = computed<CSSProperties>(() => {
  return {
    filter: isLight.value ? '' : 'invert(1)',
  };
});

const detail = computed(() => {
  return pltState.colorSpace === 'name' ?
    namedColors.fullNames[namedColors.getClosestIdx(props.card.color)] :
    `${pltState.colorSpace}(${roundedColor.value.toString()})`;
});

// states for dealing transition.
const size = ref<string>(equallyLength(pltState.numOfCards));
function setSize(newVal: string) { size.value = newVal; }

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

defineExpose({
  setSize,
  setPos,
  setTransProperty,
});

watch(() => pltState.numOfCards, () => {
  setPos(props.cardDisplay.position);
  setSize(props.cardDisplay.size);
});

const style = computed<CSSProperties>(function() {
  return {
    ...props.styleInSettings,
    backgroundColor: props.card.hex,
    [media.isSmall ? 'height' : 'width']: size.value,
    [media.pos]: pos.value,
    transitionProperty: transProperty.value,
  };
});
</script>

<style lang="scss" src="./TheCard.scss" />
