<template>
  <OverlayContainer
    :content-class="$style.genDialog"
    role="dialog"
    :eager="true"
    transition="slide-y"
    transparent
    v-model="isShowing"
  >
    <header
      v-once
      :class="$style.header"
    >
      <h2>調和調色盤</h2>
      <VBtn
        icon="x-lg"
        aria-label="關閉"
        @click="isShowing = false"
      />
    </header>
    <div
      :class="$style.content"
    >
      <div
        v-memo="palette"
        :class="$style.palette"
      >
        <VTooltip
          location="top"
          text="Copied"
          :openOnHover="false"
          openOnClick
          :eager="false"
        >
          <template #activator="{handleClick}">
            <VBtn
              v-for="(hex, i) in palette"
              :key="i"
              :style="{
                background: hex
              }"
              :ripple="false"
              @click="copyHex(i);handleClick($event)"
            />
          </template>
        </VTooltip>
      </div>
      <VBtn
        v-memo="[palette[0]]"
        :style="{
          color: rgb2gray(hex2rgb(palette[0])) > 127 ? '#000' : '#FFF',
          background: palette[0],
        }"
        prepend-icon="eyedropper"
        text="開啟color picker"
        @click="showColorPicker = !showColorPicker"
      />
      <ColorPicker
        v-model="currentColor"
        v-model:show="showColorPicker"
      />
      <div>
        調和方法
        <SelectMenu
          :items="HARMONY_METHODS"
          v-model:index="harmonyArgs.method"
        />
      </div>
      <!-- shades, tints, and tones. -->
      <div
        v-if="1 <= harmonyArgs.method && harmonyArgs.method <= 3"
        v-memo="[harmonyArgs]"
        :class="$style.numbers"
      >
        <label for="harmony-num">數量</label>
        <input
          id="harmony-num"
          name="harmony-num"
          type="number"
          :min="MIN_NUM_OF_CARDS"
          :max="MAX_NUM_OF_CARDS"
          v-model.lazy.number="harmonyArgs.num"
        >
      </div>
      <div
        v-once
        class="spacer"
      />
      <div
        :class="$style.buttons"
      >
        <label>
          <input
            type="checkbox"
            name="preview"
            v-model="isPreview"
          >
          預覽
        </label>
        <VBtn
          v-once
          @click="comfirm"
          text="確定"
        />
      </div>
    </div>
  </OverlayContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, unref } from 'vue';
import $style from './HarmonyGenerator.module.scss';
// components
import SelectMenu from '../Custom/SelectMenu.vue';
import ColorPicker from '../Custom/ColorPicker.vue';
import OverlayContainer from '../Custom/OverlayContainer.vue';
import VBtn from '../Custom/VBtn.vue';
import VTooltip from '../Custom/VTooltip.vue';
// utils and constants
import { HARMONY_METHODS, HSB_MAX } from '@/constants/colors';
import { getHarmonize, hex2rgb, hsb2rgb, rgb2gray, rgb2hex } from '@/utils/colors';
import { invertBoolean, map } from '@/utils/helpers';
import { copyText } from '@/utils/browser';
import { MAX_NUM_OF_CARDS, MIN_NUM_OF_CARDS } from '@/constants/pltStore';
// stores
import usePltStore from '@/features/usePltStore';
// types
import type{ ModelRef } from 'vue';

const isShowing = defineModel<boolean>() as ModelRef<boolean>;

const showColorPicker = ref(false);

// palette and color picker
const pltState = usePltStore();

const currentColor = ref<number[]>([0, HSB_MAX[1], HSB_MAX[2]]); // hsb color
const harmonyArgs = reactive<{
  method: number,
  num: number,
}>({
  method: 0,
  num: 6,
});

const palette = computed<string[]>(() => {
  const generator = getHarmonize(HARMONY_METHODS[harmonyArgs.method]);
  return map(
    generator([...unref(currentColor)], harmonyArgs.num),
    hsb => rgb2hex(hsb2rgb(hsb))
  );
});

const copyHex = (idx: number) => {
  copyText(unref(palette)[idx]);
};

const isPreview = ref(true);
/**
 * Preview the palette (will restore when dialog is closed).
 */
const preview = () => {
  pltState.setPlt_(
    unref(isPreview) ? unref(palette) : unref(originalPalette)
  );
};
watch(() => [unref(isPreview), unref(palette)],
  preview
);
/** Overwrite current palette and close. (will not restore when dialog is closed) */
const comfirm = () => {
  pltState.setPlt_(unref(palette));
  // Overwrite `originalPalette`. Because close dialog will restore palette from
  // `originalPalette`.
  saveOrininal();
  invertBoolean(isShowing);
};

const originalPalette = ref<number[][]>([[]]);
/**
 * Save original palette.
 * To restore palette when close dialog.
 */
const saveOrininal = () => {
  originalPalette.value = map(pltState.cards_, card => card.color_);
};
watch(isShowing, (newVal) => {
  if (newVal) {
    saveOrininal();
    preview();
  } else
    pltState.setPlt_(unref(originalPalette)); // restore palette from `originalPalette`
}, { immediate: true });
</script>
