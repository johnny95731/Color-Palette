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
      <TheBtn
        icon="close"
        aria-label="close"
        @click="isShowing = false"
      />
    </header>
    <div :class="$style.content">
      <div :class="$style.palette">
        <div
          v-for="(hex) in palette"
          :key="hex"
          :style="{
            background: hex
          }"
        />
      </div>
      <ColorPicker v-model:hsb="currentColor" />
      <SelectMenu
        :options="HARMONY_METHODS"
        v-model:index="harmonyArgs.method"
      />
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
      <div class="spacer" />
      <div
        :class="$style.buttons"
      >
        <TheBtn
          @click="preview"
        >
          預覽
        </TheBtn>
        <TheBtn
          @click="comfirm"
        >
          確定
        </TheBtn>
      </div>
    </div>
  </OverlayContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { toValue } from '@vueuse/core';
// components
import SelectMenu from '../Custom/SelectMenu.vue';
import ColorPicker from '../Custom/ColorPicker.vue';
import OverlayContainer from '../Custom/OverlayContainer.vue';
import TheBtn from '../Custom/TheBtn.vue';
// utils and constants
import { HARMONY_METHODS, HSB_MAX } from '@/constants/colors';
import { getHarmonize, hsb2rgb, rgb2hex } from '@/utils/colors';
import { invertBoolean } from '@/utils/helpers';
import { MAX_NUM_OF_CARDS, MIN_NUM_OF_CARDS } from '@/constants/pltStore';
// stores
import usePltStore from '@/features/stores/usePltStore';
// types
import type{ ModelRef } from 'vue';

const isShowing = defineModel<boolean>() as ModelRef<boolean>;

const pltState = usePltStore();
const originalPalette = ref<number[][]>([[]]);
/**
 * Save original palette.
 * To restore palette when close dialog.
 */
const saveOrininal = () => {
  originalPalette.value = pltState.cards.map(card => card.color);
};
watch(isShowing, () => {
  if (toValue(isShowing))
    saveOrininal();
  else
    pltState.setPlt(toValue(originalPalette)); // restore palette from `originalPalette`
}, { immediate: true });

const currentColor = ref<number[]>([0, HSB_MAX[1]*0.85, HSB_MAX[2]*0.85]); // hsb color
const harmonyArgs = reactive<{
  method: number,
  num: number,
}>({
  method: 0,
  num: 6,
});

const palette = computed<string[]>(() => {
  const generator = getHarmonize(HARMONY_METHODS[harmonyArgs.method]);
  return generator([...toValue(currentColor)], harmonyArgs.num)
    .map(hsb => rgb2hex(hsb2rgb(hsb)));
});

/**
 * Preview the palette (will restore when dialog is closed).
 */
const preview = () => pltState.setPlt(toValue(palette));
/** Overwrite current palette and close. (will not restore when dialog is closed) */
const comfirm = () => {
  preview();
  // Overwrite `originalPalette`. Because close dialog will restore palette from
  // `originalPalette`.
  saveOrininal();
  invertBoolean(isShowing);
};
</script>

<style lang="scss" module>
@use "@/assets/commons.module.scss" as *;

.genDialog {
  display: flex;
  flex-direction: column;
  // shape
  height: 450px;
  max-height: 100dvh;
  width: 100%;
  max-width: 320px;
  border-radius: $radius-lg;
  background-color: $color5;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 34px;
  width: 100%;
  >h2 {
    // shape
    padding: 0px 10px 0px;
    margin: 0;
    // color and text
    color: $color2;
    text-align: center;
    font-size: $font-lg;
    font-weight: $bold-weight;
    user-select: none;
  }
  :global(.btn) {
    padding: 4px;
    color: #fff;
  }
}

.content {
  flex: 1 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px 16px;
  background-color: $color1;
}

.palette {
  height: 30px;
  width: max-content;
  overflow: hidden;
  div {
    display: inline-block;
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
  }
  div + div {
    margin-left: 4px;
  }
}

.numbers {
  width: 100%;
  padding: 8px 8px;
  input {
    margin-left: 4px;
    padding: 2px 8px;
    border-radius: $radius-md;
    background-color: #ddd;
  }
}

.buttons {
  align-self: flex-end;
  display: flex;
  gap: 8px;
  margin-right: 4px;
}
</style>
