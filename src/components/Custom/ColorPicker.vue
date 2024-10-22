<template>
  <div
    ref="containerRef"
    class="color-picker"
  >
    <div
      ref="containerRef"
      class="color-picker__pickers"
    >
      <div
        ref="colorPickerRef"
        class="color-picker__sat-bri"
      >
        <canvas
          v-once
          ref="colorPickerCanvasRef"
          :width="COLOR_PICKER_CANVAS_SIZE.width_"
          :height="COLOR_PICKER_CANVAS_SIZE.height_"
        />
        <div
          class="color-picker__thumb"
          :style="colorPointerStyle"
        />
      </div>
      <div
        ref="huePickerRef"
        class="color-picker__hue"
      >
        <div
          v-once
          class="color-picker__hue-track"
        />
        <div
          class="color-picker__thumb"
          :style="{
            top: huePointerPos,
            backgroundColor: baseColor
          }"
        />
      </div>
    </div>
    <div class="color-picker__edits">
      <label
        class="color-picker__hex-input"
      >
        Hex
        <input
          :name="`color-piker-hex`"
          maxlength="7"
          size="7"
          v-model.lazy="hexColor"
        >
      </label>
      <div class="color-picker__hsb-input">
        <label
          v-for="([key, label], i) in [
            ['hue', '色調'], ['sat', '彩度'], ['bri', '亮度']]"
          :key="key"
          v-memo="[currentColor[i]]"
        >
          {{ label }}
          <input
            :name="`color-piker-${key}`"
            type="number"
            inputmode="decimal"
            min="0"
            :max="HSB_MAX[i]"
            step="any"
            v-model.lazy="currentColor[i]"
          >
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, toValue, watch } from 'vue';
import { useDragableElement } from '@/composables/useDragableElement';
import { rangeMapping, round } from '@/utils/numeric';
import { hex2rgb, hsb2rgb, isValidHex, rgb2hex, rgb2hsb } from '@/utils/colors';
import { isNullish } from '@/utils/helpers';
import { HSB_MAX } from '@/constants/colors';
import { COLOR_PICKER_CANVAS_SIZE } from '@/constants/browser';
import type { MaybeRef, ModelRef } from 'vue';
import type { Position } from '@vueuse/core';

// DOM refs
const containerRef = ref<HTMLDivElement>();
const colorPickerRef = ref<HTMLCanvasElement>();
const colorPickerCanvasRef = ref<HTMLCanvasElement>();
const huePickerRef = ref<HTMLDivElement>();

const currentColor = reactive<number[]>([0, HSB_MAX[1]*0.8, HSB_MAX[2]*0.8]); // hsb color
const setCurrentColor = (
  color: MaybeRef<number[]> | MaybeRef<string>,
  rounding: boolean = true
) => {
  color = toValue(color);
  let hsb = typeof color === 'string' ?
    rgb2hsb(hex2rgb(color)) :
    color;
  if (rounding)
    hsb = hsb.map(val => round(val, 2));
  Object.assign(currentColor, hsb);
};
const hexColor = computed({
  get() {
    return rgb2hex(hsb2rgb(currentColor));
  },
  set(hex: string) {
    if (
      isValidHex(hex) &&
      hex !== hexColor.value // Avoid recursive updating `currentColor`
    ) {
      setCurrentColor(hex);
    }
  }
});
const baseColor = computed<string>(() =>
  rgb2hex(hsb2rgb([currentColor[0], HSB_MAX[1], HSB_MAX[2]]))
);
type ColorPointerStyle = {
  top: `${number}%`,
  left: `${number}%`,
  backgroundColor: string,
}
const colorPointerStyle = computed<ColorPointerStyle>(() => ({
  top: `${HSB_MAX[2] - currentColor[2]}%`,
  left: `${currentColor[1]}%`,
  backgroundColor: rgb2hex(hsb2rgb(currentColor)),
}));
const huePointerPos = computed<`${number}%`>(() =>
  `${rangeMapping(currentColor[0], 0, HSB_MAX[0], 0, 100)}%`
);

// canvas background gradient color
const colorCtx = computed(() => colorPickerCanvasRef.value?.getContext('2d'));
function paintGradient() {
  const ctx = toValue(colorCtx);
  if (!ctx) return;
  // Reset canvas
  ctx.clearRect(0, 0, 270, 135);
  // fill base color
  ctx.fillStyle = toValue(baseColor);
  ctx.fillRect(0, 0, +COLOR_PICKER_CANVAS_SIZE.width_, +COLOR_PICKER_CANVAS_SIZE.height_);
  // grandient of saturation and brightness.
  // -saturation
  const grdWhite = ctx.createLinearGradient(0, 0, +COLOR_PICKER_CANVAS_SIZE.width_, 0);
  grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
  grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grdWhite;
  ctx.fillRect(0, 0, +COLOR_PICKER_CANVAS_SIZE.width_, +COLOR_PICKER_CANVAS_SIZE.height_);
  // -brightness
  const grdBlack = ctx.createLinearGradient(0, 0, 0, +COLOR_PICKER_CANVAS_SIZE.height_);
  grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
  grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = grdBlack;
  ctx.fillRect(0, 0, +COLOR_PICKER_CANVAS_SIZE.width_, +COLOR_PICKER_CANVAS_SIZE.height_);
}
onMounted(paintGradient);
watch(baseColor, paintGradient);

// Canvas event
(() => {
  const update = (pos: Position) => {
    currentColor[1] = rangeMapping(pos.x, 0, 100, 0, HSB_MAX[1], 2);
    // top is 100% brightness
    currentColor[2] = rangeMapping(pos.y, 0, 100, HSB_MAX[2], 0, 2);
  };
  useDragableElement(colorPickerRef, {
    containerElement: colorPickerRef,
    onStart: update,
    onMove: update,
  });
})();

// Hue events
(() => {
  const update = (pos: Position) => {
    const ratio = rangeMapping(pos.y, 0, 100, 0, HSB_MAX[0], 2);
    currentColor[0] = ratio;
  };
  useDragableElement(huePickerRef, {
    containerElement: huePickerRef,
    onStart: update,
    onMove: update,
    axis: 'y'
  });
})();

// models
const modelColor = defineModel<number[]>('hsb') as ModelRef<number[]>; // hsb color
const modelHex = defineModel<string>() as ModelRef<string>;
// -init model
(() => {
  const nullish = {
    color: isNullish(toValue(modelColor)),
    hex: isNullish(toValue(modelHex))
  };
  if (!nullish.color && nullish.hex) // only hsb is given
    setCurrentColor(modelColor, false);
  else if (nullish.color && !nullish.hex) // only hex is given
    setCurrentColor(modelHex, false);
})();
// Binding currentColor and models
watch(currentColor, (newVal) => {
  modelColor.value = newVal;
  modelHex.value = toValue(colorPointerStyle).backgroundColor;
}, { deep: true, immediate: true });
watch(modelColor, (newVal) =>
  setCurrentColor(newVal),
{ deep: true });
watch(modelHex, (newVal) => {
  if (newVal !== toValue(hexColor)) // Avoid recursive updating `currentColor`
    setCurrentColor(newVal);
});
</script>

<style lang="scss">
@use "sass:math";
@use "@/assets/commons.module.scss" as *;

$tracker-width: 10px;
$thumb-border: 3px;
$thumb-diam: $tracker-width + 2 * $thumb-border;
$input-bg: #ddd;

.color-picker {
  $root: &; // grandparent
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  padding: 12px 16px;
  &__pickers {
    line-height: 0;
    touch-action: none;
    > * {
      display: inline-block;
      position: relative;
      cursor: pointer;
    }
  }
  &__thumb {
    // position
    position: absolute;
    transform: translate(-50%, -50%);
    // size
    aspect-ratio: 1 / 1;

    border: $thumb-border solid #fff;
    border-radius: 50%;
    outline: 1px solid #000;
  }
  &__sat-bri {
    margin-right: 8px;
    border-radius: $radius-sm;
    overflow: hidden;
    #{$root}__thumb {
      height: #{12px + 2 * $thumb-border};
    }
  }
  &__hue {
    margin-left: 8px;
    height: calc(100% - $thumb-diam);
    margin: math.div($thumb-diam, 2) 0;
    width: $tracker-width;
    &-track {
      position: absolute;
      inset: 0;
      border-radius: $radius-sm;
      background: linear-gradient(to bottom, #FF0000 0%, #FFFF00 17%, #00FF00 34%, #00FFFF 50%, #0000FF 67%, #FF00FF 85%, #FF0000 100%);
    }
    #{$root}__thumb {
      left: 50%;
      height: $thumb-diam;
    }
  }
  &__edits {
    padding: 0 8px;
    > * + * {
      margin-top: 6px;
    }
    input {
      padding: 2px 8px;
      border-radius: $radius-sm;
      background-color: $input-bg;
    }
  }
  &__hex-input {
    width: 100%;
    input {
      margin-left: 4px;
    }
  }
  &__hsb-input {
    display: flex;
    gap: 8px;
    width: 100%;
    input {
      margin-top: 4px;
      width: 100%;
    }
  }
}
</style>
