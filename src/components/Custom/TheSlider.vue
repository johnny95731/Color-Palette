<template>
  <div
    class="slider-wrapper"
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
    <div
      v-bind="labelState"
      ref="trackerRef"
      class="slider-tracker"
      :style="{
        background: trackerBackground,
      }"
      tabindex="0"
      role="slider"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="model"
      @mousedown="handleDrag"
      @touchstart="handleDrag"
      @keydown="handleKeyDown"
    >
      <template v-if="showRange">
        <span class="slider-limit-label">{{ min }}</span>
        <span class="slider-limit-label">{{ max }}</span>
      </template>
      <div
        class="slider-thumb"
        :style="{
          left: `${pos}%`,
          background: thumbBackground,
        }"
      >
        <div
          v-if="showVal"
          class="slider-tooltip"
          ref="tooltipRef"
          :style="{
            display: isDragging ? 'block' : undefined,
          }"
        >
          {{
            model
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from 'vue';
import { getComponentId } from '@/utils/helpers';
import { clip, round, rangeMapping } from '@/utils/numeric';

type Props = {
  inputId?: string,
  label?: string,
  // input attrs
  min?: number;
  max?: number;
  step?: number;

  digit?: number;
  showRange?: boolean;
  showVal?: boolean;
  trackerBackground?: string;
  thumbBackground?: string;
}
const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  digit: 3,
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
  if (element) element.htmlFor = idForInput.value;
});
// Update label HTMLFor if it is an ID.
watch(() => [props.label, idForInput.value], (newVal, oldVal) => {
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


// Handle values
const model = defineModel<number>({ required: true });
model.value ??=  (props.max + props.min) / 2;

defineEmits<{
  'update:modelValue': [newVal: number]
}>();

const pos = ref<number>(0); // thumb position

const unitValue = computed(() => props.step ?? 10**(-props.digit));
const updateThumbPos = (newPos?: number) => {
  const rect = trackerRef.value?.getBoundingClientRect();
  pos.value = newPos ??
    rect ?
    round(rangeMapping(
      model.value, props.min, props.max,
      0, 100,
    ), 2) :
    pos.value;
};
function updateValue(newVal: number, newPos?: number) {
  model.value = newVal;
  updateThumbPos(newPos);
}

onMounted(() => {
  updateThumbPos();
});

// Handle model, `props.min`, and `props.max` changed.
watch(
  () => [props.min, props.max],
  () => {
    const newVal = round(
      clip(
        model.value,
        props.min,
        props.max,
      ),
      props.digit,
    );
    if (newVal !== model.value) updateValue(newVal);
  });

// Step increment function. If num < 0, then becomes decrement.
const increment = (num: number = 1) => {
  const newVal = round(
    clip(model.value + num * unitValue.value, props.min, props.max),
    props.digit,
  );
  updateValue(newVal);
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
    if (tooltipRef.value === e.target) return; // Prevent dragging tooltip.
    isDragging.value = true;
  } else if (!isDragging.value) return;
  const rect = trackerRef.value?.getBoundingClientRect() as DOMRect;
  // Get cursor position.
  const clientX = (
    (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX
  );
  // Evaluate value.
  const thumbPos = rangeMapping(
    clip(clientX - rect.left, 0, rect.width),
    0, rect.width,
    0, 100,
  );
  const valBias = rangeMapping(
    thumbPos, 0, 100,
    0, props.max - props.min,
  );
  let val: number;
  if (props.step) {
    val = round(
      props.min + Math.floor(valBias / props.step) * props.step,
      props.digit,
    );
  } else val = round(props.min + valBias, props.digit);
  updateValue(val, thumbPos);
  if (isStartingDragging) {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('touchmove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd, { once: true });
    window.addEventListener('touchend', handleDragEnd, { once: true });
  }
};

// -Mouse up / Touch end.
const handleDragEnd = () => {
  isDragging.value = false;
  window.removeEventListener('mousemove', handleDrag);
  window.removeEventListener('touchmove', handleDrag);
};

// -Key down
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key == 'ArrowRight') increment();
  else if (e.key === 'ArrowLeft') increment(-1);
};
// end: onChange event

defineExpose({
  inputId: idForInput
});
</script>

<style src="./TheSlider.scss" />
