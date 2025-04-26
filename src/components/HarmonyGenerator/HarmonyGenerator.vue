<template>
  <VDialog
    :overlay-props="{
      contentClass: $style.genDialog
    }"
    title="調和調色盤"
    v-model="isOpened"
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
          <button
            v-for="(hex, i) in palette"
            :key="i"
            type="button"
            :style="{
              background: hex
            }"
            :aria-label="`color ${hex}`"
            @click="copyHex(i);handleClick($event)"
          >
            <div class="btn__overlay" />
          </button>
        </template>
      </VTooltip>
    </div>
    <VBtn
      v-memo="[palette[0]]"
      :style="{
        color: isLight(palette[0]) ? '#000' : '#FFF',
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
        v-model:idx="harmonyArgs.method_"
      />
    </div>
    <!-- shades, tints, and tones. -->
    <div
      v-if="harmonyArgs.method_ < 3"
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
        v-model.lazy.number="harmonyArgs.num_"
      >
    </div>
    <template #actions>
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
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, unref } from 'vue';
import $style from './HarmonyGenerator.module.scss';
// components
import SelectMenu from '../Custom/SelectMenu.vue';
import ColorPicker from '../Custom/ColorPicker.vue';
import VDialog from '../Custom/VDialog.vue';
import VBtn from '../Custom/VBtn.vue';
import VTooltip from '../Custom/VTooltip.vue';
// utils
import { harmonize, HARMONY_METHODS, isLight, map, rgb2hex } from '@johnny95731/color-utils';
import { invertBoolean } from '@/utils/helpers';
import { copyText } from '@/utils/browser';
// stores
import usePltStore, { MAX_NUM_OF_CARDS, MIN_NUM_OF_CARDS } from '@/stores/usePltStore';
// types
import type { ModelRef } from 'vue';

const isOpened = defineModel<boolean>() as ModelRef<boolean>;

const showColorPicker = ref(false);

// palette and color picker
const pltState = usePltStore();

/**
 * HSB color
 */
const currentColor = ref<number[]>([0, 100, 100]);
const harmonyArgs = reactive<{
  method_: number,
  num_: number,
}>({
  method_: 3,
  num_: 6,
});

const palette = computed<string[]>(() => {
  return map(
    harmonize(unref(currentColor), harmonyArgs.method_, harmonyArgs.num_),
    rgb => rgb2hex(rgb)
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
watch(() => [unref(isPreview), unref(palette)], preview);
/** Overwrite current palette and close. (will not restore when dialog is closed) */
const comfirm = () => {
  pltState.setPlt_(unref(palette));
  // Overwrite `originalPalette`. Because close dialog will restore palette from
  // `originalPalette`.
  saveOrininal();
  invertBoolean(isOpened);
};

const originalPalette = ref<number[][]>([[]]);
/**
 * Save original palette.
 * To restore palette when close dialog.
 */
const saveOrininal = () => {
  originalPalette.value = map(pltState.cards_, card => card.color_);
};
watch(isOpened, (newVal) => {
  if (newVal) {
    saveOrininal();
    preview();
  } else
    pltState.setPlt_(unref(originalPalette)); // restore palette from `originalPalette`
}, { immediate: true });
</script>
