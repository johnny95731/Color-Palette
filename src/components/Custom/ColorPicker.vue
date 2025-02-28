<template>
  <OverlayContainer
    ref="containerRef"
    role="dialog"
    :eager="true"
    transition="slide-y"
    transparent
    :content-class="[
      'color-picker',
      `color-picker--${variant}`
    ]"
    v-model="modelShow"
  >
    <div
      class="color-picker__pickers"
    >
      <div
        class="color-picker__canvas"
      >
        <canvas
          v-once
          ref="canvasPickerRef"
          :width="COLOR_PICKER_CANVAS_SIZE"
          :height="COLOR_PICKER_CANVAS_SIZE"
        />
        <div
          v-if="variant === 'wheel'"
          class="color-picker__mask"
        />
        <div
          class="color-picker__thumb"
          :style="canvasThumbStyle"
          @pointerdown="canvasDraggingStart"
        />
      </div>
      <TheSlider
        v-if="variant !== 'wheel'"
        :showRange="false"
        min="0"
        :max="variant === 'rect' ? HSB_MAX[0] : HSB_MAX[2]"
        :trackerBackground="
          variant === 'rect' ?
            'linear-gradient(to right, #F00, #FF0, #0F0, #0FF, #00F, #F0F, #F00)' :
            'linear-gradient(to right, #000, #fff)'
        "
        :thumbBackground="secondThumbStyle.background"
        :model-value="variant === 'rect' ? currentColor[0] : currentColor[2]"
        @update:modelValue="updaters.slider_"
      />
      <div
        v-else
        ref="secondPickerRef"
        class="color-picker__rect-picker"
        :style="secondPickerStyle"
      >
        <div
          class="color-picker__thumb"
          rectPickerThumeStyle
          :style="secondThumbStyle"
          @pointerdown="sliderDraggingStart"
        />
      </div>
    </div>
    <div class="color-picker__edits">
      <div
        class="color-picker__preview"
        :style="{background: hexColor}"
      />
      <label
        class="color-picker__hex-input"
      >
        Hex
        <input
          name="color-piker-hex"
          maxlength="7"
          size="7"
          v-model.lazy="hexColor"
        >
      </label>
      <div class="color-picker__hsb-inputs">
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
      <div class="color-picker__variants">
        樣式
        <SelectMenu
          :items="['rect', 'rounded', 'wheel']"
          v-model="variant"
        />
      </div>
    </div>
  </OverlayContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, toValue, unref, watch } from 'vue';
import { useDragableElement } from '@/composables/useDragableElement';
import TheSlider from './TheSlider.vue';
import { cartesian2polar, mod, polar2cartesian, rangeMapping, round, toPercent } from '@/utils/numeric';
import { hex2hsb, hsb2hex, isValidHex } from '@/utils/colors';
import { isNullish } from '@/utils/helpers';
import { getPropertyValue } from '@/utils/browser';
import { HSB_MAX } from '@/constants/colors';
import { COLOR_PICKER_CANVAS_SIZE } from '@/constants/browser';
// Types
import type { MaybeRef, ModelRef } from 'vue';
import type { Position } from '@vueuse/core';
import OverlayContainer from './OverlayContainer.vue';
import SelectMenu from './SelectMenu.vue';


const modelShow = defineModel<boolean>('show', { default: false });

const variant = ref<'rect' | 'rounded' | 'wheel'>('wheel');

// DOM refs
const containerRef = ref<InstanceType<typeof OverlayContainer>>();
const canvasPickerRef = ref<HTMLCanvasElement>();
const secondPickerRef = ref<HTMLDivElement>();

// get/set property
/** wheel width/2 in percentage */
const wheelHalfWidth = ref(0);
const updateWheelHalfWidth = () => {
  if (unref(variant) === 'wheel' && canvasPickerRef.value) {
    wheelHalfWidth.value = toPercent(
      getPropertyValue(containerRef.value?.contentRef, '--wheel-width') / (COLOR_PICKER_CANVAS_SIZE * 2),
      2
    );
  } else
    wheelHalfWidth.value = 0;
};

watch(variant, () => updateWheelHalfWidth(), { flush: 'post' });
onMounted(() => {
  containerRef.value!.contentRef!.style
    .setProperty('--canvas-size', `${COLOR_PICKER_CANVAS_SIZE}px`);
  updateWheelHalfWidth();
});


const currentColor = reactive<number[]>([0, HSB_MAX[1], HSB_MAX[2]]); // hsb color
const setCurrentColor = (
  color: MaybeRef<number[] | string>,
  rounding: boolean = true
) => {
  color = unref(color);
  let hsb = typeof color === 'string' ?
    hex2hsb(color) :
    color;
  if (rounding)
    hsb = hsb.map(val => round(val, 2));
  Object.assign(currentColor, hsb);
};
/** `currentColor` in (rgb) hex code. */
const hexColor = computed({
  get() {
    return hsb2hex(currentColor);
  },
  set(hex: string) {
    if (
      hex !== hexColor.value && // Avoid updating `currentColor` recursively.
      isValidHex(hex)
    ) {
      setCurrentColor(hex);
    }
  }
});
/** Color with maximum saturation and brightness. */
const pureColor = computed<string>(() =>
  hsb2hex([currentColor[0], HSB_MAX[1], HSB_MAX[2]])
);

type ColorThumbStyle = {
  top: string,
  left: string,
  background: string,
}
const canvasThumbStyle = reactive<ColorThumbStyle>({
  top: '0',
  left: '0',
  background: '',
});
const secondPickerStyle = computed(() => ({
  background: `linear-gradient(0deg, #000, #0000), linear-gradient(90deg, #ffff, #fff0), ${pureColor.value}`
}));
const secondThumbStyle = ref<Partial<ColorThumbStyle>>({});

const updaters = computed(() => {
  if (unref(variant) === 'rect')
    return {
      canvas_: (pos: Position) => {
        currentColor[1] = rangeMapping(pos.x, 0, 100, 0, HSB_MAX[1], 2);
        // top is 100% brightness
        currentColor[2] = rangeMapping(pos.y, 0, 100, HSB_MAX[2], 0, 2);
      },
      canvasThumbStyle_: () => ({
        top: (HSB_MAX[2] - currentColor[2]) + '%',
        left: currentColor[1] + '%',
        background: hsb2hex(currentColor),
      }),
      slider_: (newVal: number) => {
        currentColor[0] = round(newVal, 2);
      },
      secondThumbStyle_: () =>({
        background: pureColor.value,
      })
    };
  else if (unref(variant) === 'rounded')
    return {
      canvas_: (pos: Position) => {
        const { deg, radius } = cartesian2polar(
          rangeMapping(pos.y, 0, 100, -1, 1, 4),
          rangeMapping(pos.x, 0, 100, -1, 1, 4)
        );
        currentColor[0] = mod(deg + 90, 360); // rotate
        currentColor[1] = rangeMapping(radius, 0, 1, 0, HSB_MAX[1], 2);
      },
      canvasThumbStyle_: () => {
        const { x, y } = polar2cartesian(currentColor[1], currentColor[0] - 90, 2); // 0deg at top
        return {
          top: rangeMapping(y, -HSB_MAX[1], HSB_MAX[1], 0, 100, 1) + '%',
          left: rangeMapping(x, -HSB_MAX[1], HSB_MAX[1], 0, 100, 1) + '%',
          background: hsb2hex(currentColor),
        };
      },
      slider_: (newVal: number) => {
        currentColor[2] = round(newVal, 2);
      },
      secondThumbStyle_: () => ({
        background: hsb2hex([0, 0, currentColor[2]]),
      }),
    };
  else // wheel
    return {
      canvas_: (pos: Position) => {
        const { deg } = cartesian2polar(
          rangeMapping(pos.y, 0, 100, -1, 1, 4),
          rangeMapping(pos.x, 0, 100, -1, 1, 4),
          2
        );
        currentColor[0] = mod(deg + 90, 360);
      },
      canvasThumbStyle_: () => {
        const { x, y } = polar2cartesian(50 - wheelHalfWidth.value, currentColor[0] - 90); // 0deg at top
        return {
          top: (y + 50) + '%',
          left: (x + 50) + '%',
          background: pureColor.value
        };
      },
      secondPicker_: (pos: Position) => {
        currentColor[1] = rangeMapping(pos.x, 0, 100, 0, HSB_MAX[1], 2);
        // top is 100% brightness
        currentColor[2] = rangeMapping(pos.y, 0, 100, HSB_MAX[2], 0, 2);
      },
      secondThumbStyle_: () => ({
        left: rangeMapping(currentColor[1], 0, HSB_MAX[1], 0, 100, 2) + '%',
        top: rangeMapping(currentColor[2], 0, HSB_MAX[2], 100, 0, 2) + '%',
        background: hexColor.value
      }),
    };
});

// canvas background gradient color
/** Gradients that are not depend on `currentColor` */
const canvasGrads: {
  /** White to transparent. Left to right. */
  white_?: CanvasGradient,
  /** Transparent to black. Top to bottom. */
  black_?: CanvasGradient,
  /** Hue conic gradient. 0 deg (red) on top. */
  hue_?: CanvasGradient,
} = {};
onMounted(() => {
  const ctx = canvasPickerRef.value?.getContext('2d');
  if (!ctx) return;
  //
  const grdWhite = ctx.createLinearGradient(0, 0, COLOR_PICKER_CANVAS_SIZE, 0);
  grdWhite.addColorStop(0, '#fff');
  grdWhite.addColorStop(1, '#fff0');
  canvasGrads.white_ = grdWhite;
  const grdBlack = ctx.createLinearGradient(0, 0, 0, COLOR_PICKER_CANVAS_SIZE);
  grdBlack.addColorStop(0, '#0000');
  grdBlack.addColorStop(1, '#000');
  canvasGrads.black_ = grdBlack;
  // Hue
  const hueGrad = ctx.createConicGradient(
    -Math.PI/2, COLOR_PICKER_CANVAS_SIZE/2, COLOR_PICKER_CANVAS_SIZE/2
  );
  const hexes = [
    '#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00'
  ] as const;
  hexes.forEach((hex, i)=>hueGrad.addColorStop(i / (hexes.length - 1), hex));
  canvasGrads.hue_ = hueGrad;
});

const clearCanvas = () => {
  const ctx = canvasPickerRef.value?.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, COLOR_PICKER_CANVAS_SIZE, COLOR_PICKER_CANVAS_SIZE);
};
const fillStyle = (
  style: MaybeRef<string | CanvasGradient | CanvasPattern>
) => {
  const ctx = canvasPickerRef.value?.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = unref(style);
  ctx.fillRect(0, 0, COLOR_PICKER_CANVAS_SIZE, COLOR_PICKER_CANVAS_SIZE);
};

const repainCanvas = computed(() => {
  const ctx = canvasPickerRef.value?.getContext('2d');
  if (!ctx) return;
  if (unref(variant) === 'rect')
    return () => {
      clearCanvas();
      // fill base color
      fillStyle(pureColor);
      // grandient of saturation and brightness.
      // -saturation
      fillStyle(canvasGrads.white_!);
      // -brightness
      fillStyle(canvasGrads.black_!);
    };
  else if (unref(variant) === 'rounded')
    return () => {
      clearCanvas();
      // Hue gradient
      fillStyle(canvasGrads.hue_!);
      // Brightness mask.
      fillStyle(
        '#000000' +
        rangeMapping(currentColor[2], 0, HSB_MAX[2], 255, 0, 0).toString(16)
      );
      // Saturation gradient
      const center = COLOR_PICKER_CANVAS_SIZE / 2;
      const satGrad = ctx.createRadialGradient(
        center, center, 0, center, center, center
      );
      const grayHex = hsb2hex([0, 0, currentColor[2]]);
      satGrad.addColorStop(0, grayHex);
      satGrad.addColorStop(1, grayHex+'00');
      fillStyle(satGrad);
    };
  else {
    clearCanvas();
    // Hue gradient
    fillStyle(canvasGrads.hue_!);
    return null;
  }
});
const updateColorPicker = () => {
  Object.assign(canvasThumbStyle, updaters.value.canvasThumbStyle_());
  secondThumbStyle.value = updaters.value.secondThumbStyle_();
  repainCanvas.value?.();
};
watch(
  () => [unref(variant), currentColor],
  updateColorPicker,
  { deep: true, flush: 'post' }
);
onMounted(updateColorPicker);

// Canvas event
const canvasDraggingStart = toValue(() => {
  const update = (pos: Position) => {
    updaters.value.canvas_(pos);
  };
  const { start } = useDragableElement(canvasPickerRef, {
    containerElement: canvasPickerRef,
    onStart: update,
    onMove: update,
  });
  return start;
});

// Slider events
const sliderDraggingStart = toValue(() => {
  const update = (pos: Position) => {
    updaters.value.secondPicker_!(pos);
  };
  const { start } = useDragableElement(secondPickerRef, {
    containerElement: secondPickerRef,
    onStart: update,
    onMove: update,
  });
  return start;
});


// models
const modelColor = defineModel<number[]>() as ModelRef<number[]>;

// -init model
(() => {
  if (!isNullish(unref(modelColor)))
    setCurrentColor(modelColor, false);
})();

// Binding currentColor and models
watch(currentColor, (newVal) => {
  modelColor.value = newVal;
}, { immediate: true });
watch(modelColor, (newVal) =>
  setCurrentColor(newVal),
{ deep: true });
</script>

<style lang="scss">
@use "sass:math";
@use "@/assets/variables.scss" as *;

// shape vars
$padding-x: 16px;
$padding-y: 12px;

// picker vars
$thumb-border: 2px;
$tracker-width: 10px;
$thumb-diam: 14px;
$wheel-width: $thumb-diam + 4px;

.color-picker {
  $root: &;

  --canvas-size: 170px;

  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  width: calc(var(--canvas-size) + 32px);
  padding: 8px 16px 20px;
  border-radius: $radius-lg;

  background: $color1;

  &__pickers {
    position: relative;
  }

  &__thumb {
    position: absolute;
    top: 0;
    transform: translate(-50%, -50%);

    width: $thumb-diam;
    height: $thumb-diam;
    border: $thumb-border solid #fff;
    border-radius: $radius-rounded;

    outline: 1px solid $color5;
  }

  &__canvas {
    touch-action: none;
    cursor: pointer;
    user-select: none;

    position: relative;

    line-height: 0;

    canvas {
      overflow: hidden;
      border-radius: 8px;
    }
  }

  &__mask {
    position: absolute;
    inset: 0;
    background: $color1;
  }

  &__edits {
    display: grid;
    grid-template-columns: 40px 1fr;
    grid-template-rows: 30px;
    row-gap: 8px;
    align-items: center;

    width: 100%;
    padding: 0 8px;

    input {
      margin-top: 4px;
      padding: 2px 0 2px 8px;
      border-radius: 6px;
    }
  }

  &__preview {
    grid-column: 1;
    grid-row: 1;

    aspect-ratio: 1;
    height: 30px;
    border-radius: $radius-rounded;
  }

  &__hex-input {
    display: inline-block;
    grid-column: 2;
    grid-row: 1;
    width: 100%;

    input {
      margin-left: 4px;
    }
  }

  &__hsb-inputs {
    display: flex;
    grid-column: 1 / 3;
    gap: 8px;

    input {
      width: 100%;
      margin-top: 4px;
    }
  }

  &__variants {
    grid-column: 1 / 3;
  }


  &--rounded, &--wheel {
    #{$root}__canvas {
      canvas {
        border-radius: $radius-rounded;
      }
    }
  }

  &--wheel {
    --wheel-width: #{$wheel-width};

    gap: 31px;

    #{$root}__mask {
      cursor: default;
      inset: $wheel-width;
      border-radius: $radius-rounded;
    }

    #{$root}__rect-picker {
      // Find `inset` property of inner rect:
      //   inset = (--canvas-size - rect width) / 2
      // Let r = --canvas-size / 2, w = $wheel-width. Then,
      //    rect width = cos(45deg) * (r - 2 * w - $thumb-diam - 2 *empty space)
      // By simple calculation,
      //  (r - cos(45deg) * (r - 2 * w)) / 2
      //     = (1 - cos(45deg)) / 2 * r + cos(45deg) * w
      // Multiplying `cos(45deg)` since the vertices are the coloset points
      // between bore of wheel and rect (square).
      $one-cos45: round(math.div(1 - math.cos(45deg), 2), 3);
      $cos45: round(math.cos(45deg), 3);
      $thumb-radius: $thumb-diam * 0.5;
      $space: 4px;

      touch-action: none;
      cursor: pointer;
      user-select: none;

      position: absolute;
      inset: calc(
        $one-cos45 * var(--canvas-size) + #{
          $cos45 * ($wheel-width + $thumb-radius + $space)
        }
      );

      border-radius: 6px;
    }
  }
}
</style>
