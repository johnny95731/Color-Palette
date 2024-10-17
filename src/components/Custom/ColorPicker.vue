<template>
  <div
    ref="containerRef"
    class="color-picker-container"
  >
    <div
      ref="containerRef"
      class="pickers"
    >
      <div
        class="color-picker"
        @mousedown="startDraggingColor"
      >
        <canvas
          ref="colorPickerCanvasRef"
          :width="width"
          :height="height"
        />
        <div
          class="color-pointer"
          :style="colorPointerStyle"
        />
      </div>
      <div
        class="hue-picker"
        @mousedown="startDraggingHue"
      >
        <div
          ref="hueTrackRef"
          class="hue-track"
        />
        <div
          class="hue-pointer"
          :style="{
            top: huePointerPos,
            backgroundColor: baseColor
          }"
        />
      </div>
    </div>
    <label class="hex-input">
      Hex
      <input
        :name="`color-piker-hex`"
        maxlength="7"
        size="7"
        v-model.lazy="hexColor"
      >
    </label>
    <div class="hsb-inputs">
      <label
        v-for="([key, label], i) in [
          ['hue', '色調'], ['sat', '彩度'], ['bri', '亮度']]"
        :key="key"
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
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, toValue, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { useElementBounding } from '@/composables/useElementBounding';
import { rangeMapping, round } from '@/utils/numeric';
import { hex2rgb, hsb2rgb, isValidHex, rgb2hex, rgb2hsb } from '@/utils/colors';
import { HSB_MAX } from '@/constants/colors';
import { isNullish } from '@/utils/helpers';
import type { MaybeRef, ModelRef } from 'vue';

type Props = {
  width?: number | `${number}`;
  height?: number | `${number}`;
}
const props = withDefaults(defineProps<Props>(), {
  width: 270,
  height: 135,
});

// DOM refs
const containerRef = ref<HTMLDivElement>();
const colorPickerCanvasRef = ref<HTMLCanvasElement>();
const hueTrackRef = ref<HTMLDivElement>();

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
    return rgb2hex(hsb2rgb(toValue(currentColor)));
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
  rgb2hex(hsb2rgb([toValue(currentColor)[0], HSB_MAX[1], HSB_MAX[2]]))
);
type ColorPointerStyle = {
  top: `${number}%`,
  left: `${number}%`,
  backgroundColor: string,
}
const colorPointerStyle = computed<ColorPointerStyle>(() => ({
  top: `${HSB_MAX[2] - toValue(currentColor)[2]}%`,
  left: `${toValue(currentColor)[1]}%`,
  backgroundColor: rgb2hex(hsb2rgb(toValue(currentColor))),
}));
const huePointerPos = computed<`${number}%`>(() =>
  `${rangeMapping(toValue(currentColor)[0], 0, HSB_MAX[0], 0, 100)}%`
);

// canvas background gradient color
const colorCtx = computed(() => colorPickerCanvasRef.value?.getContext('2d'));
function paintGradient() {
  const ctx = toValue(colorCtx);
  if (!ctx) return;
  const { width, height } = props;
  // Reset canvas
  ctx.clearRect(0, 0, +width, +height);
  // fill base color
  ctx.fillStyle = toValue(baseColor);
  ctx.fillRect(0, 0, +width, +height);
  // grandient of saturation and brightness.
  // -saturation
  const grdWhite = ctx.createLinearGradient(0, 0, +width, 0);
  grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
  grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grdWhite;
  ctx.fillRect(0, 0, +width, +height);
  // -brightness
  const grdBlack = ctx.createLinearGradient(0, 0, 0, +height);
  grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
  grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = grdBlack;
  ctx.fillRect(0, 0, +width, +height);
}
onMounted(paintGradient);
watch(baseColor, paintGradient);

// Canvas event
const startDraggingColor = (() => {
  let isDragging = false;
  let cleanups: (() => void)[] = [];
  const { rect: domRect, update: updateDOM } = useElementBounding(colorPickerCanvasRef);

  const update = (e: MouseEvent) => {
    const ratioX = round(rangeMapping(e.clientX, domRect.left, domRect.right, 0, HSB_MAX[1]), 2);
    toValue(currentColor)[1] = ratioX;
    const ratioY = round(rangeMapping(e.clientY, domRect.top, domRect.bottom, HSB_MAX[2], 0), 2);
    toValue(currentColor)[2] = ratioY; // top is 100% brightness
  };
  // Dragging events
  function start(e: MouseEvent) {
    e.preventDefault();
    cleanups = [
      useEventListener('mousemove', move, { capture: true }),
      useEventListener('mouseup', end, { capture: true }),
    ];
    updateDOM();
    update(e);
    isDragging = true;
  }
  function move(e: MouseEvent) {
    if (!isDragging) return;
    update(e);
    return false;
  }
  function end() {
    isDragging = false;
    cleanups.forEach(fn => fn());
  }
  return start;
})();

// Hue events
const startDraggingHue = (() => {
  let isDragging = false;
  let cleanups: (() => void)[] = [];
  const { rect: domRect, update: updateDOM } = useElementBounding(
    hueTrackRef, { filter: ['top', 'bottom'] }
  );
  const update = (e: MouseEvent) => {
    const ratio = round(rangeMapping(e.clientY, domRect.top, domRect.bottom, 0, HSB_MAX[0]), 2);
    toValue(currentColor)[0] = ratio;
  };
  // Dragging events
  function start(e: MouseEvent) {
    e.preventDefault();
    cleanups = [
      useEventListener('mousemove', move, { capture: true }),
      useEventListener('mouseup', end, { capture: true }),
    ];
    updateDOM();
    update(e);
    isDragging = true;
  }
  function move(e: MouseEvent) {
    if (!isDragging) return;
    update(e);
    return false;
  }
  function end() {
    isDragging = false;
    cleanups.forEach(fn => fn());
  }
  return start;
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
  if (nullish.color && !nullish.hex) // only hex is given
    setCurrentColor(modelHex, false);
  else if (!nullish.color && nullish.hex) // only hsb is given
    setCurrentColor(modelColor, false);
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

$pointer-border: 3px;
$tracker-width: 10px;
$pointer-diam: $tracker-width + 2 * $pointer-border;
@mixin pointer {
  // position
  position: absolute;
  top: 0;
  transform: translate(-50%, -50%);
  // size
  aspect-ratio: 1 / 1;

  border: $pointer-border solid #fff;
  border-radius: 50%;
  outline: 1px solid #000;
}

.color-picker-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 320px;
  padding: 12px 16px;
  .pickers {
    line-height: 0;
    > * {
      display: inline-block;
      position: relative;
      cursor: pointer;
    }
    .color-picker {
      margin-right: 8px;
      border-radius: $radius-sm;
      overflow: hidden;
      .color-pointer {
        @include pointer;
        height: #{12px + 2 * $pointer-border};
      }
    }
    .hue-picker {
      margin-left: 8px;
      height: calc(100% - $pointer-diam);
      margin: math.div($pointer-diam, 2) 0;
      width: $tracker-width;
      .hue-track {
        position: absolute;
        inset: 0;
        border-radius: $radius-sm;
        background: linear-gradient(to bottom, #FF0000 0%, #FFFF00 17%, #00FF00 34%, #00FFFF 50%, #0000FF 67%, #FF00FF 85%, #FF0000 100%);
      }
      .hue-pointer {
        @include pointer;
        left: 50%;
        height: $pointer-diam;
      }
    }
  }
  $input-bg: #ddd;
  .hex-input {
    display: block;
    padding: 0 8px;
    width: 100%;
    input {
      margin-left: 4px;
      padding: 2px 8px;
      border-radius: $radius-md;
      background-color: $input-bg;
    }
  }
  .hsb-inputs {
    display: flex;
    gap: 8px;
    padding: 0 8px;
    width: 100%;
    label {
      flex: 1 1 30%;
    }
    input {
      width: 100%;
      padding: 2px 8px;
      border-radius: $radius-sm;
      background-color: $input-bg;
    }
  }
}
</style>
