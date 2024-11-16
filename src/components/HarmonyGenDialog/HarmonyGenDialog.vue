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
        <TheBtn
          v-for="(hex, i) in palette"
          :key="i"
          :style="{
            background: hex
          }"
          :ripple="false"
          @click="copyHex(i)"
        />
      </div>
      <TheBtn
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
        <TheBtn
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
// components
import SelectMenu from '../Custom/SelectMenu.vue';
import ColorPicker from '../Custom/ColorPicker.vue';
import OverlayContainer from '../Custom/OverlayContainer.vue';
import TheBtn from '../Custom/TheBtn.vue';
// utils and constants
import { HARMONY_METHODS, HSB_MAX } from '@/constants/colors';
import { getHarmonize, hex2rgb, hsb2rgb, rgb2gray, rgb2hex } from '@/utils/colors';
import { invertBoolean } from '@/utils/helpers';
import { MAX_NUM_OF_CARDS, MIN_NUM_OF_CARDS } from '@/constants/pltStore';
// stores
import usePltStore from '@/features/stores/usePltStore';
// types
import type{ ModelRef } from 'vue';
import { copyText } from '@/utils/browser';

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
  return generator([...unref(currentColor)], harmonyArgs.num)
    .map(hsb => rgb2hex(hsb2rgb(hsb)));
});

const copyHex = (idx: number) => {
  copyText(unref(palette)[idx]);
};

const isPreview = ref(true);
/**
 * Preview the palette (will restore when dialog is closed).
 */
const preview = () => {
  pltState.setPlt(
    unref(isPreview) ? unref(palette) : unref(originalPalette)
  );
};
watch(() => [unref(isPreview), unref(palette)],
  preview
);
/** Overwrite current palette and close. (will not restore when dialog is closed) */
const comfirm = () => {
  pltState.setPlt(unref(palette));
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
  originalPalette.value = pltState.cards.map(card => card.color);
};
watch(isShowing, (newVal) => {
  if (newVal) {
    saveOrininal();
    preview();
  } else
    pltState.setPlt(unref(originalPalette)); // restore palette from `originalPalette`
}, { immediate: true });
</script>

<style lang="scss" module>
@use "@/assets/variables.scss" as *;

.genDialog {
  display: flex;
  flex-direction: column;
  // shape
  height: 340px;
  border-radius: $radius-lg;
  background-color: $color1;
  overflow: hidden;
}

.header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 34px;
  width: 100%;
  overflow: auto;
  background-color: $color5;
  >h2 {
    // shape
    padding: 0px 10px 0px;
    margin: 0;
    // color and text
    color: $color2;
    text-align: center;
    font-size: $font-lg;
    font-weight: $font-weight-bold;
    user-select: none;
  }
  :global(.btn) {
    padding: 4px;
    color: #fff;
  }
}

.content {
  flex: 1 1 0;
  height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 12px 8px;
  > *:not([class]) > * {
    margin-top: 8px;
  }
  > * + * {
    margin-top: 12px;
  }
}

$color-div-size: 25px;
$color-div-margin: 4px;
.palette {
  height: 30px;
  min-width: #{$color-div-size * 8 + $color-div-margin * 7}; // 8 = maximum card num
  text-align: center;
  :global(.btn) {
    display: inline-block;
    height: $color-div-size;
    aspect-ratio: 1;
    border-radius: $radius-rounded;
  }
  * + * {
    margin-left: $color-div-margin;
  }
}

.numbers {
  width: 100%;
  input {
    width: 100%;
    padding: 2px 0 2px 8px;
    border-radius: $radius-md;
    background-color: #ddd;
  }
}

.buttons {
  flex: 0 0 auto;
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 4px;
  font-size: $font-md;
}
</style>
