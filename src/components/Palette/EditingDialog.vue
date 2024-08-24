<template>
  <OverlayContainer
    :transparent="true"
    role="dialog"
    :aria-modal="true"
    v-model="modelShow"
  >
    <div
      ref="containerRef"
      :class="$style.editor"
      :style="{
        ...(media.isSmall ? {} :pos)
      }"
      @keydown="stopPropagation($event)"
    >
      <label
        :for="`card${cardIdx}-hex`"
        :style="{backgroundColor: card.hex}"
      >
        {{ card.hex }}
      </label>
      <input
        ref="hexInputRef"
        :id="`card${cardIdx}-hex`"
        :class="$style.hexInput"
        type="text"
        maxlength="7"
        :value="card.hex"
        @change="hexTextEdited($event)"
        @blur="handleHexEditingFinished($event)"
        @keydown="handleHexEditingFinished($event)"
      >
      <SelectMenu
        v-if="colorSpace === 'name'"
        ref="selectRef"
        :class="$style.nameSelect"
        aria-label="CSS named-color選單"
        :options="namedColors.fullNames"
        :contentClass="$style.nameSelectContent"
        :model-value="detail"
      >
        <template #items>
          <TheBtn
            v-once
            v-for="(name, i) in namedColors.fullNames"
            :key="`Option${name}`"
            :text="name"
            :title="name"
            @click="selectName(i);"
          >
            <template #prepend>
              <span
                :style="{
                  backgroundColor: name.replace(/\s/g, ''),
                  zIndex: 1,
                }"
              />
            </template>
          </TheBtn>
        </template>
      </SelectMenu>
      <div :class="$style.sliders">
        <template
          v-for="(val, i) in roundedColor"
          :key="`card${cardIdx}-label${i}`"
        >
          <div>
            {{ `${space.labels[i]}: ${val}` }}
          </div>
          <TheSlider
            :label="space.labels[i]"
            :showRange="false"
            :showVal="false"
            :trackerBackground="gradientGen(roundedColor, i, colorSpace)"
            :thumbBackground="card.hex"
            :min="space.range[i][0]"
            :max="space.range[i][1]"
            :step="1"
            :model-value="val"
            @change="handleSliderChange($event, i)"
            @keydown="onLeaveFocusing($event, i)"
          />
        </template>
      </div>
    </div>
  </OverlayContainer>
</template>

<script setup lang='ts'>
import { computed, nextTick, ref, watch } from 'vue';
import $style from './TheCard.module.scss';
import TheSlider from '@/components/Custom/TheSlider.vue';
import SelectMenu from '@/components/Custom/SelectMenu.vue';
// Utils
import { hexTextEdited, noModifierKey, stopPropagation } from '@/utils/eventHandler';
import {
  hex2rgb, rgb2hex, isValidHex, gradientGen, namedColors,
} from '@/utils/colors';
// Stores
import usePltStore from '@/features/stores/usePltStore';
import media from '@/features/useMedia';
// Types
import type { CardType, ColorSpacesType } from '@/features/types/pltType';
import OverlayContainer from '../Custom/OverlayContainer.vue';
import TheBtn from '../Custom/TheBtn.vue';

type Props = {
  cardIdx: number;
  card: CardType;
  detail: string;
  colorSpace: ColorSpacesType
  roundedColor: number[];
  pos: {'left': string} | {'top': string}
}

const props = defineProps<Props>();
const containerRef = ref<HTMLDivElement>();
const hexInputRef = ref<HTMLDivElement>();

const modelShow = defineModel<boolean>('show', { required: true });

const emits = defineEmits<{
  'tabOffDialog': []
}>();

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

watch(modelShow, async (newVal) => { // focus dialog when open it.
  if (newVal) {
    await nextTick();
    hexInputRef.value?.focus();
  }
});

const onLeaveFocusing = (e: KeyboardEvent, idx: number) => {
  if (idx !== props.roundedColor.length - 1 || e.key !== 'Tab' || !noModifierKey(e)) return;
  modelShow.value = false;
  emits('tabOffDialog');
  e.preventDefault();
};

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

const selectRef = ref<InstanceType<typeof SelectMenu>>();
const selectName = (idx: number) => {
  pltState.editCard({ idx: props.cardIdx, color: namedColors.getRgb(idx) });
};
</script>
