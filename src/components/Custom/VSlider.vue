<template>
  <div
    class="slider"
    :style="{
      background: trackerBackground,
    }"
    :aria-label="fieldState.ariaLabel_"
    :aria-labelledby="fieldState.ariaLabelledby_"
    role="slider"
    :aria-valuemin="min_"
    :aria-valuemax="max_"
    :aria-valuenow="model"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <div class="field">
      <label
        v-if="fieldState.ariaLabel_"
        :for="fieldState.id_"
      >{{ fieldState.ariaLabel_ }}</label>
      <input
        :id="fieldState.id_"
        :aria-label="fieldState.ariaLabel_"
        :aria-labelledby="fieldState.ariaLabelledby_"
        type="range"
        inputmode="none"
        :min="min_"
        :max="max_"
        :step="step"
        :value="model"
        tabindex="-1"
        @focusin="$el.focus()"
      >
    </div>
    <template v-if="showRange">
      <span class="slider__bound-label">{{ min }}</span>
      <span class="slider__bound-label">{{ max }}</span>
    </template>
    <div
      ref="trackerRef"
      class="slider__tracker"
    >
      <div
        ref="thumbRef"
        class="slider__thumb"
        :style="{
          left: thumbPos,
          background: thumbBackground,
        }"
      />
      <VTooltip
        v-if="props.showVal"
        location="top"
        :activator="thumbRef"
        :text="model"
        :model-value="isShowingLabel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, computed, onUnmounted, unref } from 'vue';
import VTooltip from './VTooltip.vue';
import { useDragableElement } from '@/composables/useDragableElement';
import useInputField from '@/composables/useInputField';
import { clip, countDecimals, round, rangeMapping, isSameFloat } from '@/utils/numeric';
import type { ModelRef } from 'vue';
import type { Position } from '@vueuse/core';

type Props = {
  label?: string,
  // input attrs
  min?: number | `${number}`,
  max?: number | `${number}`,
  /**
   * The value of slider will be restrict to min + n * step for some integer n.
   * If step < 0, it will not apply.
   */
  step?: number | `${number}`,
  showRange?: boolean,
  showVal?: boolean | 'always',
  trackerBackground?: string,
  thumbBackground?: string,
}
const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  showRange: true,
  showVal: true,
});

const trackerRef = ref<HTMLDivElement>();
const thumbRef = ref<HTMLDivElement>();

// Handle form element
const { state_: fieldState, cleanup } = useInputField(props.label, 'slider');
onUnmounted(cleanup);


const min_ = computed(() => isNaN(+props.min) ? 0 : +props.min);
const max_ = computed(() => isNaN(+props.max) ? 100 : +props.max);

// Handle values
const model = defineModel<number>() as ModelRef<number>;
const thumbPos = ref<string>();

/**
 * Convert props.step to number.
 */
const numStep = computed<number>(() => +props.step);

/**
 * Decimals counts of display text.
 */
const decimals = computed<number>(() =>
  unref(numStep) > 0 ? countDecimals(unref(numStep)) : 0
);

/**
 * Rounding the value to satify step.
 */
const roundingValue = (newVal?: number) => {
  newVal ??= unref(model);
  return unref(numStep) <= 0 ?
    newVal :
    round(
      unref(min_) + Math.floor((newVal - unref(min_)) / unref(numStep)) * unref(numStep),
      unref(decimals),
    );
};

/**
 * Rounding the value to satify step and update model.
 */
const updateModel = (newVal?: number) => {
  newVal = roundingValue(newVal);
  if (!isSameFloat(newVal, unref(model))) model.value = newVal;
};

// Init model
(() => {
  model.value = roundingValue(unref(model) ?? (max_.value + unref(min_)) / 2);
})();

// Handle model, `props.min`, and `props.max` changed.
watch(
  () => [props.min, props.max],
  () => {
    updateModel(clip(unref(model), unref(min_), max_.value));
  }, { immediate: true });

// Step increment function. If num < 0, then becomes decrement.
const increment = (num: number = 1) => {
  updateModel(
    clip(unref(model) + num * unref(numStep), unref(min_), max_.value)
  );
};

watch(model, (newVal) => {
  thumbPos.value = `${rangeMapping(newVal, unref(min_), max_.value, 0, 100)}%`;
}, { immediate: true });

// onChange event => Drag or key down.
const { isDragging_ } = (() => {
  const update = (pos: Position) => {
    updateModel(rangeMapping(pos.x, 0, 100, unref(min_), max_.value));
  };
  return useDragableElement(trackerRef, {
    containerElement_: trackerRef,
    onStart_: update,
    onMove_: update,
    initialValue_: {
      x: rangeMapping(unref(model), unref(min_), max_.value, 0, 100),
      y: 0,
    },
    axis_: 'x'
  });
})();
// -Key down
const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key;
  if (key.startsWith('Arrow')) {
    if (['U', 'R'].includes(key[5])) // ArrorUp, ArrorRight
      increment();
    else // ArrorDown, ArrorLeft
      increment(-1);
  }
  else if (key === 'Home') updateModel(unref(min_));
  else if (key === 'End') updateModel(max_.value);
  else if (key === 'PageUp') increment(10);
  else if (key === 'PageDown') increment(-10);
};

// Label/Tooltip
const isShowingLabel = computed(() => {
  if (props.showVal === 'always') return true;
  else return isDragging_.value;
});
</script>

<style lang="scss">
@use "sass:math";
@use "@/assets/variables.scss" as *;

$thumb-size: 14px;
$thumb-radius: math.div($thumb-size, 2);

.slider {
  $root: &;

  touch-action: none;

  position: relative;

  width: 100%;
  height: 5px;
  margin: #{$thumb-radius + 8px} 0 #{$thumb-radius};
  padding: 0 $thumb-radius;
  border-radius: $radius-lg;

  font-size: $font-sm;

  background-color: $color5;

  >input,
  >label {
    pointer-events: none;

    display: block;

    width: 0;
    height: 0;

    opacity: 0;
  }

  &__tracker {
    cursor: pointer;
    user-select: none;

    position: relative;

    width: 100%;
    height: 100%;
  }

  &__thumb {
    @include position(center);

    position: absolute;

    aspect-ratio: 1 / 1;
    height: $thumb-size;
    border: solid 3px white;
    border-radius: 100%;

    background-color: $color5;
    outline: solid 1px $color5;

    @at-root {
      #{$root}:focus-visible #{$root}__thumb {
        outline-width: 2px;
      }

      @supports not selector(:focus-visible) {
        #{$root}:focus #{$root}__thumb {
            outline-width: 2px;
        }
      }
    }
  }

  &__bound-label {
    position: absolute;
    bottom: 100%;
    display: inline-block;
    font-size: $font-sm;

    &:first-of-type{
      left: 0;
    }

    &:last-of-type {
      right: 0;
      left: auto;
    }
  }
}
</style>
