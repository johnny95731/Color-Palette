<template>
<div class="editing" ref="containerRef"
  tabindex="-1"
  @blur="handleDialogBlurred"
  @keydown="stopPropagation($event)"
>
  <div :style="{backgroundColor: props.card.hex}">
  </div>
  <input type="text" maxlength="7" class="hexInput"
    :value="card.hex"
    :id="`card${props.cardIdx}-hex`"
    @change="hexTextEdited($event)"
    @blur="handleHexEditingFinished($event)"
    @keydown="handleHexEditingFinished($event)"
  />
  <div class="sliders" >
    <template v-for="(val, i) in props.colorArr"
      :key="`card${props.cardId}-label${i}`"
    >
      <label v-text="`${space.labels[i]}: ${val}`">
      </label>
      <TheSlider
        :showRange="false" :showVal="false"
        :trackerBackground="gradientGen(props.colorArr, i, colorSpace)"
        :min="0" :max="space.maxes[i]" :step="1" :digit="0"
        :value="val"
        @change="(newVal: number) => handleSliderChange(newVal, i)"
      />
    </template>
  </div>
</div>
</template>

<script setup lang='ts'>
import {computed, inject, watchEffect, ref, onMounted} from 'vue';
import TheSlider from '../Custom/TheSlider.vue';
// Utils
import {hexTextEdited, stopPropagation} from '@/utils/helpers';
import {
  hex2rgb, rgb2hex, getSpaceInfos, getSpaceTrans, isValidHex,
  gradientGen,
} from '@/utils/colors';
// Stores
import usePltStore from '@/features/stores/usePltStore';
// Types
import type {Ref} from 'vue';
import type {CardType, ColorSpacesType} from '@/features/types/pltType';
import type {MediaContextType} from '@/features/types/mediaType.ts';

type Props = {
  cardIdx: number;
  card: CardType;
  colorSpace: ColorSpacesType
  colorArr: number[];
}

const props = defineProps<Props>();
const containerRef = ref<HTMLDivElement>();

const pltState = usePltStore();
const space = computed(() => {
  return {
    ...getSpaceInfos(pltState.colorSpace),
    ...getSpaceTrans(pltState.colorSpace),
  };
});

/**
 * Close dialog when blurred.
 */
const handleDialogBlurred = (e: FocusEvent) => {
  if (props.card.isEditing && e.relatedTarget === null) {
    handleHexEditingFinished(e);
    pltState.setIsEditing(props.cardIdx);
  }
};
// Focus after created.
onMounted(() => {
  containerRef.value?.focus();
});

/**
 * Finish Hex editing when input is blurred or press 'Enter'
 */
const handleHexEditingFinished = function(e: FocusEvent | KeyboardEvent) {
  if (e.type === 'keydown' && (e as KeyboardEvent).key !== 'Enter') {
    return false;
  }
  const textInput = e.currentTarget as HTMLInputElement;
  const text = textInput.value;
  if (isValidHex(text)) {
    const newRGB = hex2rgb(text);
    if (!newRGB) return;
    const newModeColor = space.value.converter(newRGB);
    pltState.editCard({idx: props.cardIdx, color: newRGB});
    let slider;
    for (let i = 0; i < 4; i++) {
      slider = (
        document.getElementById(`card${props.cardIdx}-slider${i}`) as
        HTMLInputElement
      );
      if (slider) slider.value = String(newModeColor[i]);
    }
    if (text.length === 4) {
      const hex6 = `#${text[1]+text[1]}${text[2]+text[2]}${text[3]+text[3]}`;
      textInput.value = hex6;
    }
  }
};

/**
 * Slider changed event.
 */
const handleSliderChange = function(newVal: number, idx: number) {
  const newColorArr = [...props.card.color];
  newColorArr[idx] = newVal;
  pltState.editCard({idx: props.cardIdx, color: newColorArr});
  // Set hex to hex input.
  const textInput = (
    document.getElementById(`card${props.cardIdx}-hex`) as HTMLInputElement
  );
  const rgb = space.value.inverter(newColorArr);
  textInput.value = rgb2hex(rgb);
};

// Check container is out of window or not.
const media = inject('media') as Ref<MediaContextType>;
const stylePos = computed(() => {
  if (media.value.isSmall) {
    return {
      endPos: 'bottom',
      resetPos: ['left', 'right'],
    } as const;
  } else {
    return {
      endPos: 'right',
      resetPos: ['top', 'bottom'],
    } as const;
  }
});
watchEffect(() => {
  const container = containerRef.value;
  if (!container) return;
  const rect = container.getBoundingClientRect();
  // Reset style
  container.style[stylePos.value.resetPos[0]] = '';
  container.style[stylePos.value.resetPos[1]] = '';
  if (media.value.isSmall) return;
  // Adjust pos if container is out of window.
  if (rect[media.value.pos] <= media.value.bound[0]) {
    container.style.transform = 'none';
    container.style[media.value.pos] = '0';
  } else if ((rect[stylePos.value.endPos]) >= media.value.bound[1]) {
    container.style.transform = 'none';
    container.style[media.value.pos] = 'auto';
    container.style[stylePos.value.endPos] = '0';
  } else {
    container.style.transform = '';
    container.style[media.value.pos] = '';
    container.style[stylePos.value.endPos] = '';
  }
});
// Check container is out of window or not.

// Change slider value when color space changed.
watchEffect(() => {
  if (props.card.isEditing) {
    let slider;
    for (let i = 0; i < 4; i++) {
      slider = (
        document.getElementById(`card${props.cardIdx}-slider${i}`)
      );
      if (slider) {
        (slider as HTMLInputElement).value = String(props.colorArr[i]);
      }
    }
  }
});
</script>

<style lang="scss" src="./TheCard.scss"></style>
