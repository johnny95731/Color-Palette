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
      :style="containerStyle"
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
        @input="hexTextEdited($event)"
        @blur="handleHexEditingFinished($event)"
        @keydown.enter="handleHexEditingFinished($event)"
      >
      <SelectMenu
        v-if="colorSpace === 'name'"
        ref="selectRef"
        :class="$style.nameSelect"
        aria-label="CSS named-color選單"
        :options="unzipedNameList"
        :contentClass="$style.nameSelectContent"
        :model-value="detail"
      >
        <template #items>
          <TheBtn
            v-once
            v-for="(name, i) in unzipedNameList"
            :key="`Option${name}`"
            :text="name"
            :title="name"
            @click="selectName(unzipedNameList[i]);"
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
          v-for="([min, max], i) in space.range"
          :key="`card${cardIdx}-label${i}`"
        >
          <div>
            {{ `${space.labels[i]}: ${model[i]}` }}
          </div>
          <TheSlider
            :label="space.labels[i]"
            :showRange="false"
            :showVal="false"
            :trackerBackground="gradientGen(model, i, colorSpace)"
            :thumbBackground="card.hex"
            :min="min"
            :max="max"
            :model-value="model[i]"
            @update:model-value="handleSliderChange($event, i)"
            @keydown="i === model.length - 1 && onLeaveFocusing($event)"
          />
        </template>
      </div>
    </div>
  </OverlayContainer>
</template>

<script setup lang='ts'>
import { computed, ref, shallowReactive, watch } from 'vue';
import { toValue } from '@vueuse/core';
import $style from './TheCard.module.scss';
import OverlayContainer from '../Custom/OverlayContainer.vue';
import TheBtn from '../Custom/TheBtn.vue';
import TheSlider from '@/components/Custom/TheSlider.vue';
import SelectMenu from '@/components/Custom/SelectMenu.vue';
// Utils
import { hexTextEdited, isTabKey } from '@/utils/browser';
import {
  hex2rgb, rgb2hex, isValidHex, gradientGen, unzipedNameList, getNamedColorRgb,
} from '@/utils/colors';
import { useElementBounding } from '@/utils/composables/useElementBounding';
// Stores
import usePltStore from '@/features/stores/usePltStore';
import media from '@/utils/composables/useMedia';
// Types
import type { CSSProperties } from 'vue';
import type { CardType } from 'types/pltStore';
import type { ColorSpacesType } from 'types/colors';

type Props = {
  cardIdx: number;
  card: CardType;
  detail: string;
  colorSpace: ColorSpacesType
  pos: string
}

const props = defineProps<Props>();
const containerRef = ref<HTMLDivElement>();
const hexInputRef = ref<HTMLDivElement>();

const modelShow = defineModel<boolean>('show', { required: true });
const model = defineModel<number[]>({ required: true });

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

const { rect } = useElementBounding(containerRef, { filter: ['width'] });
const containerStyle = shallowReactive<
  Pick<CSSProperties, 'left' | 'transform' | 'right'>
>({});
watch(() => [toValue(modelShow), props.pos], ([newVal], [oldVal]) => {
  if (!newVal) return;
  newVal !== oldVal && toValue(hexInputRef)?.focus();

  let style: typeof containerStyle = { ...containerStyle };
  if (media.isSmall) {
    style = {
      transform: undefined,
      left: '50%',
      right: undefined
    };
  } else {
    const center = +props.pos.replace('px', '');
    const outOfWindow = {
      l: center - rect.width / 2 < media.bound[0],
      r: center + rect.width / 2 > media.bound[1],
    };
    style = {
      transform: outOfWindow.l || outOfWindow.r ? 'none' : undefined,
      left: outOfWindow.l ? '0' : outOfWindow.r ? 'auto' : props.pos,
      right: outOfWindow.r ? '0' : undefined
    };
  }
  Object.assign(containerStyle, style);
}, { flush: 'post' });

const onLeaveFocusing = (e: KeyboardEvent) => {
  if (isTabKey(e)) {
    e.preventDefault();
    modelShow.value = false;
    emits('tabOffDialog');
  }
};

/**
 * Finish Hex editing when input is blurred or press 'Enter'
 */
const handleHexEditingFinished = function(e: FocusEvent | KeyboardEvent) {
  const textInput = e.currentTarget as HTMLInputElement;
  const text = textInput.value;
  if (text !== props.card.hex && isValidHex(text)) {
    const newRGB = hex2rgb(text);
    if (!newRGB) return;
    const newColorArr = toValue(space).converter(newRGB);
    model.value = newColorArr;
    if (text.length === 4) { // # and 3 hex character.
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
  model.value = newColorArr;
  // Set hex to hex input.
  const textInput = (
    document.getElementById(`card${props.cardIdx}-hex`) as HTMLInputElement
  );
  const rgb = toValue(space).inverter(newColorArr);
  textInput.value = rgb2hex(rgb);
};

const selectRef = ref<InstanceType<typeof SelectMenu>>();
const selectName = (name: string) => {
  pltState.editCard(
    props.cardIdx,
    getNamedColorRgb(name.replaceAll(' ', ''))
  );
};
</script>
