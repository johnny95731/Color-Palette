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
    :id="`card${props.cardId}-hex`"
    @change="hexTextEdited($event)"
    @blur="handleHexEditingFinished($event)"
    @keydown="handleHexEditingFinished($event)"
  />
  <div class="sliders" >
    <template v-for="(val, i) in props.colorArr"
      :key="`card${props.cardId}-label${i}`"
    >
      <label v-text="`${spaceInfo.labels[i]}: ${val}`">
      </label>
      <input
        type="range" min="0" :max="spaceInfo.maxes[i]" step="0.01"
        :id="`card${props.cardId}-slider${i}`"
        :value="val"
        @input="handleSliderChange($event, i)"
        @change="handleSliderChange($event, i)"
      />
    </template>
  </div>
</div>
</template>

<script lang='ts' setup>
import {computed, inject, watchEffect, ref, onMounted} from 'vue';
// Utils
import {hexTextEdited, stopPropagation} from '@/utils/helpers';
import {hex2rgb, rgb2hex, getSpaceInfos, isValidHex} from '@/utils/colors';
// Stores
import usePltStore from '@/features/stores/usePltStore';
import useOptionsStore from '@/features/stores/useOptionsStore';
// Types
import type {Ref} from 'vue';
import type {cardType} from '@/features/types/pltType';
import type {ColorSpacesType} from '@/features/types/optionsType';
import type {MediaContextType} from '@/features/types/mediaType.ts';

type Props = {
  cardId: number;
  card: cardType;
  colorSpace: ColorSpacesType
  colorArr: number[];
}

const props = defineProps<Props>();
const containerRef = ref<HTMLDivElement>();

const pltState = usePltStore();
const optionsState = useOptionsStore();
const spaceInfo = getSpaceInfos(optionsState.colorSpace);

/**
 * Close dialog when blurred.
 */
const handleDialogBlurred = (e: FocusEvent) => {
  if (props.card.isEditing && e.relatedTarget === null) {
    handleHexEditingFinished(e);
    pltState.setIsEditing(props.cardId, false);
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
    const newModeColor = spaceInfo.converter(newRGB);
    pltState.editCard({idx: props.cardId, color: newRGB});
    let slider;
    for (let i = 0; i < 4; i++) {
      slider = (
        document.getElementById(`card${props.cardId}-slider${i}`) as
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
const handleSliderChange = function(e: Event, idx: number) {
  const target = e.target as HTMLInputElement;
  const newColorArr = spaceInfo.converter(props.card.rgb);
  newColorArr[idx] = Number(target.value);
  const newRGB = spaceInfo.inverter(newColorArr);
  pltState.editCard({idx: props.cardId, color: newRGB});
  // Set hex to hex input.
  const textInput = (
    document.getElementById(`card${props.cardId}-hex`) as HTMLInputElement
  );
  textInput.value = rgb2hex(newRGB);
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
        document.getElementById(`card${props.cardId}-slider${i}`)
      );
      if (slider) {
        (slider as HTMLInputElement).value = String(props.colorArr[i]);
      }
    }
  }
});
</script>

<style lang="scss" src="./TheCard.scss"></style>
