<template>
  <div
    class="slider-container"
    :style="{
      background: trackerBackground,
    }"
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
      <span class="slider-limit-label">{{ min }}</span>
      <span class="slider-limit-label">{{ max }}</span>
    </template>
    <div
      v-bind="labelState"
      ref="trackerRef"
      class="slider-tracker"
      tabindex="0"
      role="slider"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="model"
      @mousedown="handleDrag"
      @touchstart="handleDrag"
      @keydown="handleKeyDown"
    >
      <div
        class="slider-thumb"
        :style="{
          left: `${pos}%`,
          background: thumbBackground,
        }"
      />
      <div
        v-if="showVal"
        class="slider-tooltip"
        ref="tooltipRef"
        :style="{
          display: isDragging ? 'block' : undefined,
          left: `${pos}%`,
        }"
      >
        {{
          model
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from 'vue';
import { toValue } from '@vueuse/core';
import { getComponentId } from '@/utils/helpers';
import { clip, countDecimals, round, rangeMapping, isSameFloat } from '@/utils/numeric';
import { useElementBounding } from '@/utils/composables/useElementBounding';

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
}
const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  showRange: true,
  showVal: true,
});

const trackerRef = ref<HTMLDivElement>();
const tooltipRef = ref<HTMLDivElement>();
const isDragging = ref<boolean>(false);

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
  if (!isIdSame && newVal[0] && newVal[0].startsWith('#')) {
    // Update HTMLFor for label if props.label refer to an element and input ID changed
    const element = document.getElementById(newVal[0].slice(1)) as HTMLLabelElement | null;
    if (element) element.htmlFor = newVal[1] as string;
  }
});

/**
 * Bounding rect of tracker.
 */
const { rect: trackerRect } = useElementBounding(
  trackerRef, { filter: ['width', 'left'] }
);

// Handle values
const model = defineModel<number>({ required: true });
model.value ??=  (props.max + props.min) / 2;

defineEmits<{
  'update:modelValue': [newVal: number]
}>();

const pos = ref<number>(0); // thumb position

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
 * Update thumb position. If newPos is not given, it will be computed by model.
 */
const updateThumbPos = () => {
  pos.value = round(
    rangeMapping(toValue(model), props.min, props.max, 0, 100),
    3
  );
};

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
  isSameFloat(newVal, toValue(model)) || (model.value = newVal);
}

watch(model, (newVal, oldVal) => {
  if (oldVal == null || !isSameFloat(newVal, oldVal))
    updateThumbPos();
}, { immediate: true });

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
// -Mouse down / Touch start.
// -Mouse move / Touch move.
const handleDrag = (
  e: MouseEvent | TouchEvent,
) => {
  const isStartingDragging = !e.type.endsWith('move');
  if (isStartingDragging) { // touch start / mouse down
    (e.currentTarget as HTMLDivElement).focus();
    if (toValue(tooltipRef) === e.target) return; // Prevent dragging tooltip.
    isDragging.value = true;
  } else if (!toValue(isDragging)) return;
  // Get cursor position.
  const clientX = (
    (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX
  );
  // Evaluate value.
  const val = rangeMapping(
    clip(clientX - trackerRect.left, 0, trackerRect.width),
    0, trackerRect.width,
    props.min, props.max,
  );
  updateModel(val);
  if (isStartingDragging) {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('touchmove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
  }
};

// -Mouse up / Touch end.
const handleDragEnd = () => {
  isDragging.value = false;
  window.removeEventListener('mousemove', handleDrag);
  window.removeEventListener('touchmove', handleDrag);
  window.removeEventListener('mouseup', handleDragEnd);
  window.removeEventListener('touchend', handleDragEnd);
};

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

defineExpose({
  inputId: idForInput
});
</script>

<style src="./TheSlider.scss" />
