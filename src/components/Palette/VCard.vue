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
      :style="{
        ...(pltState.isPending_ && {
          opacity: 0,
          pointerEvents: 'none'
        })
      }"
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
              icon="copy"
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
              icon="copy"
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
      <HexInputter
        ref="hexInputRef"
        :id="`card${cardIdx}-hex`"
        :style="pltState.isInNamedSpace_ || {
          marginBottom: '8px'
        }"
        :model-value="card.hex_"
        @change="handleHexEditingFinished($event)"
      />
      <SelectMenu
        v-if="pltState.isInNamedSpace_"
        :class="$style.nameSelect"
        aria-label="CSS named-color選單"
        :items="nameColorList"
        :contentClass="$style.nameSelectContent"
        :model-value="detail"
      >
        <template #items="{props: optionProps}">
          <!-- v-once cause vscode vue extension crashed -->
          <button
            v-once
            v-for="(name, i) in nameColorList"
            :key="`Option${name}`"
            v-bind="optionProps[i]"
            :style="{
              backgroundColor: name.replace(/\s/g, ''),
            }"
            :title="name"
            type="button"
            @click="selectName(nameColorList[i]);"
          />
        </template>
      </SelectMenu>
      <div>
        <template
          v-for="([min, max], i) in pltState.editingDialogInfo_.displayedRange_"
          :key="`card${cardIdx}-label${i}`"
        >
          <div
            style="margin-bottom: -4px"
          >
            {{ sliderLabels[i] }}
          </div>
          <VSlider
            :label="pltState.editingDialogInfo_.labels_[i]"
            :showRange="false"
            :showVal="false"
            :trackerBackground="gradientGen(card.color_, i, pltState.colorSpace_)"
            :thumbBackground="card.hex_"
            :min="min"
            :max="max"
            step="0.1"
            :model-value="sliderVals[i]"
            @update:model-value="handleSliderChange($event, i)"
          />
        </template>
        <div style="margin-bottom: -4px">
          {{ sliderLabels[pltState.editingDialogInfo_.len_] }}
        </div>
        <VSlider
          label="Alpha"
          :showRange="false"
          :showVal="false"
          :trackerBackground="gradientGen(card.color_, pltState.editingDialogInfo_.len_, pltState.colorSpace_)"
          :thumbBackground="card.hex_"
          min="0"
          max="100"
          step="0.1"
          :model-value="sliderVals[pltState.editingDialogInfo_.len_]"
          @update:model-value="handleSliderChange($event, pltState.editingDialogInfo_.len_)"
          @keydown="handleLeaveFocusing($event)"
        />
      </div>
    </OverlayContainer>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, shallowReactive, unref, watch } from 'vue';
import { asyncComputed } from '@vueuse/core';
import $style from './VCard.module.scss';
// Components
import VTooltip from '../Custom/VTooltip.vue';
import VBtn from '@/components/Custom/VBtn.vue';
import VIcon from '../Custom/VIcon.vue';
import SelectMenu from '../Custom/SelectMenu.vue';
import VSlider from '../Custom/VSlider.vue';
import OverlayContainer from '../Custom/OverlayContainer.vue';
import CondWrapper from '../Custom/CondWrapper.vue';
import HexInputter from '../Custom/HexInputter.vue';
// Utils
import { rgb2named, named2rgb, hex2rgb, isValidHex, map, getCssColor, round, isLight } from '@johnny95731/color-utils';
import { toPercent } from '@/utils/numeric';
import { gradientGen, nameColorList } from '@/utils/colors';
import { copyText, isTabKey } from '@/utils/browser';
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

const sliderVals = computed({
  get() {
    const { max_, len_ } = pltState.editingDialogInfo_;
    return map(unref(card).color_, (val, i) => {
      if (i === len_) return toPercent(val, 1);
      if (max_[i] === 360) return round(val, 1);
      return toPercent(val / max_[i], 1);
    });
  },
  set(newColor: number[]) {
    pltState.editCard_(props.cardIdx, newColor);
  }
});

const sliderLabels = computed<string[]>(() => {
  const { max_, labels_, len_ } = pltState.editingDialogInfo_;
  const vals = unref(sliderVals);
  return map(len_ + 1, i => {
    if (i < len_)
      return `${labels_[i]}: ${vals[i]}${max_[i] === 360 ? 'deg' : '%'}`;
    else
      return `Alpha: ${vals[i]}%`;
  });
});

// Toolbar
const favState = useFavStore();

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
  favState.isFavColor_(unref(card).hex_) ?
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
      rgb2named(unref(card).color_) :
      getCssColor(
        unref(card).color_,
        pltState.colorSpace_,
        {
          sep_: settingState.colorFunctioonSep_,
          place_: 1
        }
      ).toLowerCase();
  },
  'white'
);

const cardStyle = computed<CSSProperties>(() => {
  const hex = unref(card).hex_;
  return {
    color: isLight(hex) ? '#000' : '#fff',
    ...(settingState.paletteDisplay === 'block' && { backgroundColor: hex })
  };
});


// Editor position
const hexInputRef = ref<InstanceType<typeof HexInputter>>();
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
    unref(hexInputRef)?.$el.focus();
  } else {
    unref(hexTextRef)?.$el.focus();
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
    sliderVals.value = pltState.colorSpace_.fromRgb_(hex2rgb(text));
  }
};

const selectName = (name: string) => pltState.editCard_(
  props.cardIdx,
  named2rgb(name.replaceAll(' ', ''))
);

/**
 * Slider changed event.
 */
const handleSliderChange = (newVal: number | undefined, idx: number) => {
  const { max_, len_ } = pltState.editingDialogInfo_;
  const newColor = [...unref(card).color_];
  newColor[idx] = (
    idx === len_ ?
      newVal! / 100 :
      max_[idx] === 360 ?
        newVal! :
        newVal! / 100 * max_[idx]
  );
  sliderVals.value = newColor;
};
</script>
