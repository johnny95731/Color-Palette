<template>
  <div
    ref="cardContainerRef"
    :class="[
      $style.cardContainer,
      order.isFirst_ && $style.first,
      order.isLast_ && $style.last,
    ]"
    :style="cardStyle"
    @transitionend="$emit('transitionend')"
  >
    <div
      :class="$style.toolContainer"
      :style="showToolbar"
      role="toolbar"
      :aria-label="`卡片${cardIdx}工具列`"
    >
      <CondWrapper
        tag="div"
        :is-wrap="media.isSmall_"
      >
        <VBtn
          icon="x-lg"
          :style="closeIconStyle"
          aria-label="移除"
          :ripple="false"
          @click="$emit('remove')"
        />
        <VBtn
          v-memo="[card.isLock_]"
          :icon="isLock.icon"
          :aria-label="isLock.label"
          :ripple="false"
          @click="pltState.setIsLock_(cardIdx)"
        />
        <VBtn
          :icon="isFavIcon.icon"
          :aria-label="isFavIcon.label"
          :ripple="false"
          @click="favState.favColorsChanged_(card.hex_);"
        />
      </CondWrapper>
      <CondWrapper
        tag="div"
        :is-wrap="media.isSmall_"
      >
        <VBtn
          v-once
          icon="arrows"
          style="touch-action: none;cursor: grab;"
          aria-label="拖動"
          :ripple="false"
          @pointerdown="$emit('dragging', $event)"
        />
        <VBtn
          v-once
          icon="arrow-clockwise"
          aria-label="刷新"
          :ripple="false"
          @click="pltState.refreshCard_(cardIdx)"
        />
        <VBtn
          v-once
          icon="sliders"
          aria-label="調整"
          aria-haspopup="dialog"
          :ripple="false"
          @click="pltState.setEditingIdx_(cardIdx)"
        />
      </CondWrapper>
    </div>
    <div
      :class="$style.textDisplay"
    >
      <VTooltip
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
              copyText(card.hex_.slice(1));
              handleClick($event)
            "
          >
            <VIcon
              v-once
              type="copy"
            />
            <VBtn
              ref="hexTextRef"
              :ripple="false"
              :text="card.hex_"
            />
          </div>
          <div
            :class="$style.detailText"
            @click="
              copyText(detail);
              handleClick($event)
            "
          >
            <VIcon
              v-once
              type="copy"
            />
            <VBtn
              :ripple="false"
              :text="detail"
            />
          </div>
        </template>
      </VTooltip>
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
        :style="{backgroundColor: card.hex_}"
      >
        {{ card.hex_ }}
      </label>
      <input
        v-memo="[card.hex_]"
        ref="hexInputRef"
        :id="`card${cardIdx}-hex`"
        :class="$style.hexInput"
        type="text"
        maxlength="7"
        :value="card.hex_"
        @input="hexTextEdited($event)"
        @change="handleHexEditingFinished($event)"
      >
      <SelectMenu
        v-if="pltState.isInNamedSpace_"
        :class="$style.nameSelect"
        aria-label="CSS named-color選單"
        :items="unzipedNameList"
        :contentClass="$style.nameSelectContent"
        :model-value="detail"
      >
        <template #items="{props: optionProps}">
          <!-- v-once cause vscode vue extension crashed -->
          <button
            v-once
            v-for="(name, i) in unzipedNameList"
            :key="`Option${name}`"
            v-bind="optionProps[i]"
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
          <VSlider
            :label="space.labels[i]"
            :showRange="false"
            :showVal="false"
            :trackerBackground="gradientGen(roundedColor, i, pltState.colorSpace_)"
            :thumbBackground="card.hex_"
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
import { computed, nextTick, ref, shallowReactive, unref, watch } from 'vue';
import { asyncComputed, toValue } from '@vueuse/core';
import $style from './VCard.module.scss';
// Components
import VTooltip from '../Custom/VTooltip.vue';
import VBtn from '@/components/Custom/VBtn.vue';
import VIcon from '../Custom/VIcon.vue';
import SelectMenu from '../Custom/SelectMenu.vue';
import VSlider from '../Custom/VSlider.vue';
import OverlayContainer from '../Custom/OverlayContainer.vue';
import CondWrapper from '../Custom/CondWrapper.vue';
// Utils
import { map } from '@/utils/helpers';
import { round, toPercent } from '@/utils/numeric';
import { rgb2gray, gradientGen, getColorFunction } from '@/utils/colors';
import { copyText, hexTextEdited, isTabKey } from '@/utils/browser';
import { getClosestNamed, getNamedColorRgb, unzipCssNamed, unzipedNameList } from '@/utils/colorModels/named';
import { hex2rgb, isValidHex } from '@/utils/colorModels/hex';
// Stores
import usePltStore from '@/stores/usePltStore';
import useFavStore from '@/stores/useFavStore';
import useSettingStore from '@/stores/useSettingStore';
import media from '@/composables/useMedia';
// Types
import type { CSSProperties } from 'vue';
import type { Card } from '@/stores/usePltStore';

const cardContainerRef = ref<HTMLElement>();
const hexTextRef = ref<InstanceType<typeof VBtn>>();

type Props = {
  cardIdx: number;
};
const props = defineProps<Props>();

defineEmits<{
  (e: 'transitionend'): void,
  (e: 'remove'): void,
  (e: 'dragging', val: PointerEvent): void
}>();

const pltState = usePltStore();

const order = computed(() => ({
  isFirst_: props.cardIdx === 0,
  isLast_: props.cardIdx === pltState.numOfCards_ - 1
}));

const card = computed<Card>(() => pltState.cards_[props.cardIdx]);

const space = computed(() => {
  const infos = pltState.spaceInfos_;
  return {
    ...infos,
    range: map(infos.range, (vals) =>
      Array.isArray(vals) ?
        [...vals] :
        [0, vals]
    )
  };
});

const isLight = computed(() => rgb2gray(hex2rgb(unref(card).hex_)) > 127);

const roundedColor = computed({
  get() {
    return map(unref(card).color_, (val) => round(val));
  },
  set(newColorArr: number[]) {
    pltState.editCard_(props.cardIdx, newColorArr);
  }
});

// Toolbar
// States / Consts
const favState = useFavStore();
const isFav = computed(() => {
  return favState.colors_.includes(unref(card).hex_);
});
const showToolbar = computed(() => {
  return {
    opacity: pltState.isPending_ ? '0' : undefined
  };
});

const closeIconStyle = computed<CSSProperties | undefined>(() => {
  return pltState.numOfCards_ === 2 ?
    {
      opacity: '0',
      cursor: 'default',
    } : undefined;
});
const isLock = computed(() => (
  unref(card).isLock_ ?
    { icon: 'lock-fill', label: '解鎖刷新' } as const :
    { icon: 'unlock-fill', label: '鎖定刷新' } as const
));
const isFavIcon = computed(() => (
  unref(isFav) ?
    { icon: 'star-fill', label: '移出書籤' } as const :
    { icon: 'star', label: '加入書籤' } as const
));


const showEditor = computed({
  get() {
    return pltState.editingIdx_ === props.cardIdx;
  },
  set() {
    pltState.setEditingIdx_(props.cardIdx);
  }
});

const settingState = useSettingStore();
const detail = asyncComputed<string>(
  () => {
    return pltState.isInNamedSpace_ ?
      getClosestNamed(unref(card).color_)
        .then(str => unzipCssNamed(str)) :
      getColorFunction(roundedColor.value, pltState.colorSpace_);
  },
  'white'
);

const cardStyle = computed<CSSProperties>(() => {
  return {
    color: isLight.value ? '#000' : '#fff',
    ...(settingState.paletteDisplay === 'block' && { background: toValue(card).hex_ })
  };
});


// Editor position
const hexInputRef = ref<HTMLInputElement>();
const containerStyle = shallowReactive<Pick<CSSProperties, 'left' | 'right'>>({});
watch(showEditor, async (newShow) => {
  if (newShow) {
    // Dialog position
    let left: string | undefined, right: string | undefined;
    if (!media.isSmall_) {
      // dialogWidth = 150px, 75 = 150 / 2
      const halfDialogWidth =  75 / document.body.offsetWidth; // to percent
      const center = (props.cardIdx + 0.5) / pltState.numOfCards_;
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
const handleHexEditingFinished = (e: Event) => {
  const text = (e.currentTarget as HTMLInputElement).value;
  if (text !== unref(card).hex_ && isValidHex(text)) {
    const newColor = space.value.converter(hex2rgb(text));
    roundedColor.value = newColor;
  }
};

const selectName = (name: string) => pltState.editCard_(
  props.cardIdx,
  getNamedColorRgb(name.replaceAll(' ', ''))
);

/**
 * Slider changed event.
 */
const handleSliderChange = (newVal: number, idx: number) => {
  const newColor = [...unref(card).color_];
  newColor[idx] = newVal;
  roundedColor.value = newColor;
};
</script>
