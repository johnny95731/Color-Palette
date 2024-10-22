<template>
  <div
    class="slider"
    :style="{
      background: trackerBackground,
    }"
    role="slider"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="model"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <label
      v-if="labelState && 'aria-label' in labelState"
      :for="idForInput"
    >{{ labelState['aria-label'] }}</label>
    <input
      v-bind="labelState"
      :id="idForInput"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="model"
      tabindex="-1"
      @focusin="trackerRef?.focus()"
    >
    <template v-if="showRange">
      <span class="slider__bound-label">{{ min }}</span>
      <span class="slider__bound-label">{{ max }}</span>
    </template>
    <div
      v-bind="labelState"
      ref="trackerRef"
      class="slider__tracker"
    >
      <div
        ref="thumbRef"
        class="slider__thumb"
        :style="{
          left: style.left,
          background: thumbBackground,
        }"
      />
      <TheTooltip
        v-if="props.tooltip"
        location="top"
        :activator="thumbRef"
        :text="model"
        :model-value="isShowLabel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from 'vue';
import { Position, toValue } from '@vueuse/core';
import { getComponentId } from '@/utils/browser';
import { clip, countDecimals, round, rangeMapping, isSameFloat } from '@/utils/numeric';
import type { ModelRef } from 'vue';
import { useDragableElement } from '@/composables/useDragableElement';
import TheTooltip from './TheTooltip.vue';

type Props = {
  inputId?: string,
  label?: string,
  // input attrs
  min?: number,
  max?: number,
  /**
   * The value of slider will be restrict to min + n * step for some integer n.
   * If step < 0, it will not apply.
   */
  step?: number | `${number}`,
  showRange?: boolean,
  showVal?: boolean,
  trackerBackground?: string,
  thumbBackground?: string,
  tooltip?: boolean | 'always'
}
const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  showRange: true,
  showVal: true,
  tooltip: true,
});

const trackerRef = ref<HTMLDivElement>();
const thumbRef = ref<HTMLDivElement>();

// Handle form element
/**
 * Create Id for input
 */
const idForInput = computed<string>(() =>
  props.inputId ?? getComponentId('slider')
);
/**
 * Aria label for <input /> and role="slider" tag.
 */
const labelState = computed(() => {
  if (!props.label) return;
  return props.label?.startsWith('#') ? {
    'aria-labelledby': props.label.slice(1)
  } : {
    'aria-label': props.label
  };
});
onMounted(() => {
  if (!props.label?.startsWith('#')) return;
  const element = document.getElementById(props.label.slice(1)) as HTMLLabelElement | null;
  if (element) element.htmlFor = toValue(idForInput);
});
// Update label HTMLFor if it is an ID.
watch(() => [props.label, toValue(idForInput)], (newVal, oldVal) => {
  const isLabelSame = newVal[0] === oldVal[0];
  const isIdSame = newVal[1] === oldVal[1];
  if (!isLabelSame) {
    [oldVal[0], newVal[0]].forEach((label, i) => {
      if (label && label.startsWith('#')) {
        // Old props.label refer to an element. Remove HTMLFor attribute.
        // New props.label refer to an element. Add HTMLFor attribute.
        const element = document.getElementById(label.slice(1)) as HTMLLabelElement | null;
        if (element) {
          i === 0 ? element.removeAttribute('for') : element.htmlFor = newVal[1] as string;
        }
      }
    });
  }
  if (!isIdSame && newVal[0]?.startsWith('#')) {
    // Update HTMLFor for label if props.label refer to an element and input ID changed
    const element = document.getElementById(newVal[0].slice(1)) as HTMLLabelElement | null;
    if (element) element.htmlFor = newVal[1] as string;
  }
});

// Handle values
const model = defineModel<number>() as ModelRef<number>;

/**
 * Convert props.step to number.
 */
const numStep = computed<number>(() => +props.step);

/**
 * Decimals counts of display text.
 */
const decimals = computed<number>(() =>
  toValue(numStep) > 0 ? countDecimals(toValue(numStep)) : 0
);

/**
 * Rounding the value to satify step.
 */
const roundingValue = (newVal?: number) => {
  newVal ??= toValue(model);
  return toValue(numStep) <= 0 ?
    newVal :
    round(
      props.min + Math.floor((newVal - props.min) / toValue(numStep)) * toValue(numStep),
      toValue(decimals),
    );
};

/**
 * Rounding the value to satify step and update model.
 */
function updateModel(newVal?: number) {
  newVal = roundingValue(newVal);
  if (!isSameFloat(newVal, toValue(model))) model.value = newVal;
}

// Init model
(() => {
  model.value = roundingValue(model.value ?? (props.max + props.min) / 2);
})();

// Handle model, `props.min`, and `props.max` changed.
watch(
  () => [props.min, props.max],
  () => {
    updateModel(clip(toValue(model), props.min, props.max));
  }, { immediate: true });

// Step increment function. If num < 0, then becomes decrement.
const increment = (num: number = 1) => {
  updateModel(
    clip(toValue(model) + num * toValue(numStep), props.min, props.max)
  );
};

// onChange event => Drag or key down.
const { isDragging, style } = (() => {
  const update = (pos: Position) => {
    const val = rangeMapping(pos.x, 0, 100, props.min, props.max);
    updateModel(val);
  };
  return useDragableElement(trackerRef, {
    containerElement: trackerRef,
    onStart: update,
    onMove: update,
    initialValue: {
      x: rangeMapping(model.value, props.min, props.max, 0, 100),
      y: 0,
    },
    axis: 'x'
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
  else if (key === 'Home') updateModel(props.min);
  else if (key === 'End') updateModel(props.max);
  else if (key === 'PageUp') increment(10);
  else if (key === 'PageDown') increment(-10);
};

// Label/Tooltip
const isShowLabel = computed(() => {
  if (props.tooltip === 'always') return true;
  else return isDragging.value;
});

defineExpose({
  inputId: idForInput
});
</script>

<style lang="scss">
@use "sass:math";
@use "@/assets/commons.module.scss" as *;

$thumb-size: 14px;
$thumb-radius: math.div($thumb-size, 2);
.slider {
  // Layout
  position: relative;
  margin: #{$thumb-radius + 4px} 0px #{$thumb-radius + 8px};
  // Shape
  height: 5px;
  width: 100%;
  padding: 0px $thumb-radius;
  border-radius: $radius-lg;

  font-size: $font-sm;
  background-color: $color5;
  touch-action: none;
  >input,
  >label {
    display: block;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }
  &__tracker {
    position: relative;
    // shape
    height: 100%;
    width: 100%;

    cursor: pointer;
    user-select: none;
    &:focus-visible .slider-thumb {
      outline-width: 2px;
    }
    @supports not selector(:focus-visible) {
      &:focus .slider-thumb {
          outline-width: 2px;
      }
    }
    &:hover .slider-tooltip {
      display: block;
    }
  }

  &__thumb {
    @extend %center;

    height: $thumb-size;
    aspect-ratio: 1 / 1;
    border: solid 3px white;
    outline: solid 1px $color5;
    border-radius: 100%;
    background-color: $color5;
    cursor: pointer;
  }

  &__bound-label {
    display: inline-block;
    position: absolute;
    bottom: 100%;
    font-size: $font-sm;
    &:first-of-type{
      left: 0;
    }
    &:last-of-type {
      left: auto;
      right: 0;
    }
  }
}
</style>
