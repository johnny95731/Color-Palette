<template>
  <div
    ref="containerRef"
    class="editor"
    @keydown="stopPropagation($event)"
  >
    <div :style="{backgroundColor: props.card.hex}" />
    <input
      type="text"
      maxlength="7"
      class="hexInput"
      :value="card.hex"
      :id="`card${props.cardIdx}-hex`"
      @change="hexTextEdited($event)"
      @blur="handleHexEditingFinished($event)"
      @keydown="handleHexEditingFinished($event)"
    >
    <SelectMenu
      v-if="colorSpace === 'name'"
      ref="selectRef"
      :options="namedColors.fullNames"
      titleClass="nameSelectTitle"
      contentClass="nameSelectContent"
      :model-value="detail"
    >
      <template #items>
        <li
          v-once
          v-for="(name, i) in namedColors.fullNames"
          :key="`Option${name}`"
          @click="selectName(i);"
        >
          <button>
            <span
              :style="{
                backgroundColor: name.replace(/\s/g, '')
              }"
            />{{ name }}
          </button>
        </li>
      </template>
    </SelectMenu>
    <div class="sliders">
      <template
        v-for="(val, i) in props.roundedColor"
        :key="`card${props.cardId}-label${i}`"
      >
        <label v-text="`${space.labels[i]}: ${val}`" />
        <TheSlider
          :showRange="false"
          :showVal="false"
          :trackerBackground="gradientGen(props.roundedColor, i, colorSpace)"
          :pointBackground="card.hex"
          :min="space.range[i][0]"
          :max="space.range[i][1]"
          :step="1"
          :value="val"
          @change="(newVal: number) => handleSliderChange(newVal, i)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, inject, watchEffect, ref, watch } from 'vue';
import TheSlider from '../Custom/TheSlider.vue';
import SelectMenu from '../Custom/SelectMenu.vue';
// Utils
import { hexTextEdited, stopPropagation } from '@/utils/eventHandler';
import {
  hex2rgb, rgb2hex, isValidHex, gradientGen, namedColors,
} from '@/utils/colors';
// Stores
import usePltStore from '@/features/stores/usePltStore';
// Types
import type { CardType, ColorSpacesType } from '@/features/types/pltType';
import type { MediaContextType } from '@/features/types/mediaType.ts';

type Props = {
  cardIdx: number;
  card: CardType;
  detail: string;
  colorSpace: ColorSpacesType
  roundedColor: number[];
}

const props = defineProps<Props>();
const containerRef = ref<HTMLDivElement>();

const pltState = usePltStore();
const space = computed(() => {
  const infos = pltState.spaceInfos;
  return {
    ...infos,
    range: infos.range.map((vals) =>
      typeof vals === 'number' ?
        [0, vals] :
        [...vals]
    )
  };
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
    pltState.editCard({ idx: props.cardIdx, color: newRGB });
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
  pltState.editCard({ idx: props.cardIdx, color: newColorArr });
  // Set hex to hex input.
  const textInput = (
    document.getElementById(`card${props.cardIdx}-hex`) as HTMLInputElement
  );
  const rgb = space.value.inverter(newColorArr);
  textInput.value = rgb2hex(rgb);
};

// Check container is out of window or not.
const media = inject('media') as MediaContextType;
watch(
  () => media.windowSize,
  () => {
    const { endPos, resetPos } = (
      media.isSmall ?
        {
          endPos: 'bottom',
          resetPos: ['left', 'right'],
        } as const:
        {
          endPos: 'right',
          resetPos: ['top', 'bottom'],
        } as const
    );
    const container = containerRef.value;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    // Reset style
    container.style[resetPos[0]] = '';
    container.style[resetPos[1]] = '';
    if (media.isSmall) return;
    // Adjust pos if container is out of window.
    if (rect[media.pos] <= media.bound[0]) {
      container.style.transform = 'none';
      container.style[media.pos] = '0';
    } else if ((rect[endPos]) >= media.bound[1]) {
      container.style.transform = 'none';
      container.style[media.pos] = 'auto';
      container.style[endPos] = '0';
    } else {
      container.style.transform = '';
      container.style[media.pos] = '';
      container.style[endPos] = '';
    }
  });
// Check container is out of window or not.

// Change slider value when color space changed.
watchEffect(() => {
  if (pltState.editingIdx === props.cardIdx) {
    let slider;
    for (let i = 0; i < 4; i++) {
      slider = (
        document.getElementById(`card${props.cardIdx}-slider${i}`)
      );
      if (slider) {
        (slider as HTMLInputElement).value = String(props.roundedColor[i]);
      }
    }
  }
});

const selectRef = ref<InstanceType<typeof SelectMenu>>();
const selectName = (idx: number) => {
  pltState.editCard({ idx: props.cardIdx, color: namedColors.getRgb(idx) });
};
</script>

<style lang="scss" src="./TheCard.scss" />
