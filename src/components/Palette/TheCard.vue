<template>
  <div
    ref="cardContainerRef"
    :class="[
      $style.cardContainer,
      cardIdx === 0 && $style.first,
      cardIdx === pltState.numOfCards-1 && $style.last,
    ]"
    :style="cardStyle"
    @transitionend="$emit('transitionend')"
  >
    <div
      :class="$style.toolContainer"
      :style="showToolbar"
      role="toolbar"
      :aria-label="`卡片${cardIdx}工具列`"
      @keydown.stop
    >
      <CondWrapper
        tag="div"
        :is-wrap="media.isSmall"
      >
        <TheBtn
          icon="x-lg"
          :style="closeIconStyle"
          aria-label="移除"
          :ripple="false"
          @click="$emit('remove')"
        />
        <TheBtn
          v-memo="[card.isLock]"
          :icon="isLock.icon"
          :aria-label="isLock.label"
          :ripple="false"
          @click="pltState.setIsLock(cardIdx)"
        />
        <TheBtn
          :icon="isFavIcon.icon"
          :aria-label="isFavIcon.label"
          :ripple="false"
          @click="favState.favColorsChanged(card.hex);"
        />
      </CondWrapper>
      <CondWrapper
        tag="div"
        :is-wrap="media.isSmall"
      >
        <TheBtn
          v-once
          icon="arrows"
          style="cursor: grab;touch-action: none;"
          aria-label="拖動"
          :ripple="false"
          @pointerdown="$emit('dragging', $event)"
        />
        <TheBtn
          v-once
          icon="arrow-clockwise"
          aria-label="刷新"
          :ripple="false"
          @click="pltState.refreshCard(cardIdx)"
        />
        <TheBtn
          v-once
          icon="sliders"
          aria-label="調整"
          aria-haspopup="dialog"
          :ripple="false"
          @click="pltState.setEditingIdx(cardIdx)"
        />
      </CondWrapper>
    </div>
    <div
      :class="$style.textDisplay"
    >
      <TheTooltip
        location="top"
        text="Copied"
        :openOnHover="false"
        openOnClick
        :eager="false"
      >
        <template #activator="{handleClick}">
          <div
            :class="$style.hexText"
            @click="
              copyText(card.hex.slice(1));
              handleClick($event)
            "
          >
            <TheIcon
              v-once
              type="copy"
            />
            <TheBtn
              ref="hexTextRef"
              :ripple="false"
              :text="card.hex"
            />
          </div>
          <div
            :class="$style.detailText"
            @click="
              copyText(detail);
              handleClick($event)
            "
          >
            <TheIcon
              v-once
              type="copy"
            />
            <TheBtn
              :ripple="false"
              :text="detail"
            />
          </div>
        </template>
      </TheTooltip>
    </div>
    <!-- Editor -->
    <OverlayContainer
      :transparent="true"
      role="dialog"
      :aria-modal="true"
      :contentClass="$style.editor"
      :contentStyle="containerStyle"
      :eager="false"
      v-model="showEditor"
    >
      <label
        :for="`card${cardIdx}-hex`"
        :style="{backgroundColor: card.hex}"
      >
        {{ card.hex }}
      </label>
      <input
        v-memo="[card.hex]"
        ref="hexInputRef"
        :id="`card${cardIdx}-hex`"
        :class="$style.hexInput"
        type="text"
        maxlength="7"
        :value="card.hex"
        @input="hexTextEdited($event)"
        @change="handleHexEditingFinished($event)"
      >
      <SelectMenu
        v-if="pltState.colorSpace === 'name'"
        :class="$style.nameSelect"
        aria-label="CSS named-color選單"
        :items="unzipedNameList"
        :contentClass="$style.nameSelectContent"
        :model-value="detail"
      >
        <template #items="{props: optionProps}">
          <!-- v-once cause vscode vue extension crashed -->
          <button
            v-memo="[]"
            v-for="(name, i) in unzipedNameList"
            :key="`Option${name}`"
            v-bind="optionProps"
            :style="{
              backgroundColor: name.replace(/\s/g, ''),
            }"
            :title="name"
            type="button"
            @click="selectName(unzipedNameList[i]);"
          />
        </template>
      </SelectMenu>
      <div
        :class="$style.sliders"
      >
        <template
          v-for="([min, max], i) in space.range"
          :key="`card${cardIdx}-label${i}`"
        >
          <div>
            {{ `${space.labels[i]}: ${roundedColor[i]}` }}
          </div>
          <TheSlider
            :label="space.labels[i]"
            :showRange="false"
            :showVal="false"
            :trackerBackground="gradientGen(roundedColor, i, pltState.colorSpace)"
            :thumbBackground="card.hex"
            :min="min"
            :max="max"
            :model-value="roundedColor[i]"
            @update:model-value="handleSliderChange($event, i)"
            @keydown="i === roundedColor.length - 1 && handleLeaveFocusing($event)"
          />
        </template>
      </div>
    </OverlayContainer>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, shallowReactive, watch } from 'vue';
import { asyncComputed, toValue } from '@vueuse/core';
import $style from './TheCard.module.scss';
// Components
import TheBtn from '@/components/Custom/TheBtn.vue';
import TheIcon from '../Custom/TheIcon.vue';
import SelectMenu from '../Custom/SelectMenu.vue';
import TheSlider from '../Custom/TheSlider.vue';
import OverlayContainer from '../Custom/OverlayContainer.vue';
import CondWrapper from '../Custom/CondWrapper.vue';
// Utils
import { round, toPercent } from '@/utils/numeric';
import { rgb2gray, getClosestNamed, hex2rgb, unzipCssNamed, unzipedNameList, gradientGen, getNamedColorRgb, isValidHex } from '@/utils/colors';
import { copyText, hexTextEdited, isTabKey } from '@/utils/browser';
// Stores
import usePltStore from '@/features/stores/usePltStore';
import useFavStore from '@/features/stores/useFavStore';
import media from '@/composables/useMedia';
// Types
import type { CSSProperties } from 'vue';
import type { CardType } from '@/features/types/pltStore';
import TheTooltip from '../Custom/TheTooltip.vue';

const cardContainerRef = ref<HTMLElement>();
const hexTextRef = ref<InstanceType<typeof TheBtn>>();

type Props = {
  cardIdx: number;
  card: CardType;
};
const props = defineProps<Props>();

defineEmits<{
  (e: 'transitionend'): void,
  (e: 'remove'): void,
  (e: 'dragging', val: PointerEvent): void
}>();

const pltState = usePltStore();
const space = computed(() => {
  const infos = pltState.spaceInfos;
  return {
    ...infos,
    range: infos.range.map((vals) =>
      Array.isArray(vals) ?
        [...vals] :
        [0, vals]
    )
  };
});

const isLight = computed(() => rgb2gray(hex2rgb(props.card.hex)) > 127);

const roundedColor = computed({
  get() {
    return props.card.color.map((val) => round(val));
  },
  set(newColorArr: number[]) {
    pltState.editCard(props.cardIdx, newColorArr);
  }
});

// Toolbar
// States / Consts
const favState = useFavStore();
const isFav = computed(() => {
  return favState.colors.includes(props.card.hex);
});
const showToolbar = computed(() => {
  return {
    opacity: pltState.isPending ? '0' : undefined
  };
});

const closeIconStyle = computed<CSSProperties | undefined>(() => {
  return pltState.numOfCards === 2 ?
    {
      opacity: '0',
      cursor: 'default',
    } : undefined;
});
const isLock = computed(() => (
  props.card.isLock ?
    { icon: 'lock-fill', label: '解鎖刷新' } as const :
    { icon: 'unlock-fill', label: '鎖定刷新' } as const
));
const isFavIcon = computed(() => (
  toValue(isFav) ?
    { icon: 'star-fill', label: '移出書籤' } as const :
    { icon: 'star', label: '加入書籤' } as const
));


const showEditor = computed({
  get() {
    return pltState.editingIdx === props.cardIdx;
  },
  set() {
    pltState.setEditingIdx(props.cardIdx);
  }
});

const closestNamed = asyncComputed<string | undefined>(
  () => pltState.colorSpace === 'name' ?
    getClosestNamed(props.card.color) :
    undefined,
  'white'
);
const detail = computed(() => {
  return pltState.colorSpace === 'name' ?
    unzipCssNamed(closestNamed.value as string) :
    `${pltState.colorSpace}(${toValue(roundedColor).toString()})`;
});

const cardStyle = computed<CSSProperties>(() => {
  return {
    color: isLight.value ? '#000' : '#fff',
    backgroundColor: props.card.hex,
  };
});


// Editor position
const hexInputRef = ref<HTMLInputElement>();
const containerStyle = shallowReactive<Pick<CSSProperties, 'left' | 'right'>>({});
watch(showEditor, async (newShow) => {
  if (newShow) {
    // Dialog position
    let left: string | undefined, right: string | undefined;
    if (!media.isSmall) {
      // dialogWidth = 150px, 75 = 150 / 2
      const halfDialogWidth =  75 / media.windowSize[1]; // to percent
      const center = (props.cardIdx + 0.5) / pltState.numOfCards;
      if (center - halfDialogWidth < 0) { // left pos of dialog is out of viewport
        left = '0';
      } else if (center + halfDialogWidth > 1) {
        // right pos of dialog is out of viewport
        left = 'auto';
        right = '0';
      } else {
        left = `${toPercent(center - halfDialogWidth)}%`;
      }
    }
    Object.assign(containerStyle, { left, right });
    // Focus on input after opening dialog
    await nextTick();
    hexInputRef.value?.focus();
  } else {
    hexTextRef.value?.$el.focus();
  }
});

const handleLeaveFocusing = (e: KeyboardEvent) => {
  if (isTabKey(e)) {
    e.preventDefault();
    showEditor.value = false;
  }
};
// Editor value
/**
 * Finish Hex editing when input is blurred or press 'Enter'
 */
const handleHexEditingFinished = function(e: Event) {
  const text = (e.currentTarget as HTMLInputElement).value;
  if (text !== props.card.hex && isValidHex(text)) {
    const newColor = space.value.converter(hex2rgb(text));
    roundedColor.value = newColor;
  }
};

const selectName = (name: string) => pltState.editCard(
  props.cardIdx,
  getNamedColorRgb(name.replaceAll(' ', ''))
);

/**
 * Slider changed event.
 */
const handleSliderChange = function(newVal: number, idx: number) {
  const newColor = [...props.card.color];
  newColor[idx] = newVal;
  roundedColor.value = newColor;
};
</script>
