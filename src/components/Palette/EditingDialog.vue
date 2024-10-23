<template>
  <OverlayContainer
    ref="containerRef"
    :transparent="true"
    role="dialog"
    :aria-modal="true"
    :contentClass="$style.editor"
    :contentStyle="containerStyle"
    v-model="modelShow"
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
        <!-- v-once cause vscode vue extension crashed -->
        <TheBtn
          v-memo="[]"
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
          @keydown="i === model.length - 1 && handleLeaveFocusing($event)"
        />
      </template>
    </div>
  </OverlayContainer>
</template>

<script setup lang="ts">
import { computed, ref, shallowReactive, watch, nextTick } from 'vue';
import { toValue } from '@vueuse/core';
import $style from './TheCard.module.scss';
import OverlayContainer from '../Custom/OverlayContainer.vue';
import TheBtn from '../Custom/TheBtn.vue';
import TheSlider from '@/components/Custom/TheSlider.vue';
import SelectMenu from '@/components/Custom/SelectMenu.vue';
// Utils
import { hexTextEdited, isTabKey } from '@/utils/browser';
import {
  hex2rgb, isValidHex, gradientGen, unzipedNameList, getNamedColorRgb,
} from '@/utils/colors';
import { useElementBounding } from '@/composables/useElementBounding';
// Stores
import usePltStore from '@/features/stores/usePltStore';
import media from '@/composables/useMedia';
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

const emits = defineEmits<{
  'tabOffDialog': []
}>();

const modelShow = defineModel<boolean>('show', { required: true });
// Dialog position
const containerRef = ref<InstanceType<typeof OverlayContainer>>();
const contendRef = computed(() => toValue(containerRef)?.contentRef);
const hexInputRef = ref<HTMLInputElement>();
const { rect } = useElementBounding(contendRef, { filter: ['width'] });
const containerStyle = shallowReactive<
  Pick<CSSProperties, 'left' | 'right' | 'transform'>
>({});
watch(() => [toValue(modelShow), props.pos], async ([newShow, newPos]) => {
  if (!newShow) return;
  // Dialog position
  let style: typeof containerStyle = { // At center of the screen.
    transform: undefined,
    left: '50%',
    right: undefined
  };
  if (!media.isSmall) {
    const center = +(newPos as string).replace('px', '');
    const outOfWindow = {
      l: center - rect.width / 2 < media.bound[0],
      r: center + rect.width / 2 > media.bound[1],
    };
    style = {
      transform: outOfWindow.l || outOfWindow.r ? 'none' : undefined,
      left: outOfWindow.l ? '0' : outOfWindow.r ? 'auto' : newPos as string,
      right: outOfWindow.r ? '0' : undefined
    };
  }
  Object.assign(containerStyle, style);
  // Focus on input
  await nextTick();
  toValue(hexInputRef)!.focus();
});

const handleLeaveFocusing = (e: KeyboardEvent) => {
  if (isTabKey(e)) {
    e.preventDefault();
    modelShow.value = false;
    emits('tabOffDialog');
  }
};

// Handle values
const model = defineModel<number[]>({ required: true });
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
  const text = (e.currentTarget as HTMLInputElement).value;
  if (text !== props.card.hex && isValidHex(text)) {
    const newColor = toValue(space).converter(hex2rgb(text));
    model.value = newColor;
  }
};

const selectRef = ref<InstanceType<typeof SelectMenu>>();
const selectName = (name: string) => {
  pltState.editCard(
    props.cardIdx,
    getNamedColorRgb(name.replaceAll(' ', ''))
  );
};

/**
 * Slider changed event.
 */
const handleSliderChange = function(newVal: number, idx: number) {
  const newColor = [...props.card.color];
  newColor[idx] = newVal;
  model.value = newColor;
};
</script>
