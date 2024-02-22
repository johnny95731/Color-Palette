<template>
<div :class="$style.sliderWrapper">
  <div :class="$style.tracker" ref="trackerRef" tabindex="0"
    :style="{
      background: trackerBackground,
    }"
    @mousedown="handleDrag"
    @touchstart="handleDrag"
    @keydown="handleKeyDown"
  >
    <template v-if="showRange">
      <span :class="$style.limit">{{min}}</span>
      <span :class="$style.limit">{{max}}</span>
    </template>
    <div :class="$style.point"
      :style="{
        left: `${pos}px`,
        background: pointBackground,
      }"
    >
      <div v-if="showVal"
        :class="$style.tooltip" ref="tooltipRef"
        :style="{
          display: isDragging ? 'block' : '',
        }"
      >{{
        currentVal
      }}</div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import {onMounted, watchEffect, ref, useCssModule} from 'vue';
import {clip, round, rangeMapping} from '@/utils/helpers';

type Props = {
  min: number;
  max: number;
  defaultValue?: number;
  value?: number;
  digit?: number;
  step?: number;
  showRange?: boolean;
  showVal?: boolean;
  trackerBackground?: string;
  pointBackground?: string;
  onChange?: (val: number) => void;
}
const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  digit: 3,
  showRange: true,
  showVal: true,
});
const $style = useCssModule();

const emit = defineEmits(['change']);

const pointRadius = Number($style['point-size'].slice(0, -2)) / 2;

const trackerRef = ref<HTMLDivElement>();
const tooltipRef = ref<HTMLDivElement>();
const isDragging = ref<boolean>(false);

const currentVal = ref<number>((() => {
  const val = props.defaultValue !== undefined ?
  props.defaultValue :
      (props.value !== undefined ?
          props.value :
          (props.max + props.min) / 2
      );
  return clip(val, props.min, props.max);
})());
const pos = ref<number>(pointRadius);

function updateValue(newVal: number, newPos?: number) {
  if (currentVal.value !== newVal) {
    try {
      emit('change', newVal);
    // eslint-disable-next-line
    } catch {}
  }
  if (newPos === undefined) {
    const rect = trackerRef.value?.getBoundingClientRect() as DOMRect;
    if (!rect) return;
    newPos = round(rangeMapping(
        newVal, props.min, props.max,
        pointRadius, rect.width - pointRadius,
    ));
  }
  pos.value = newPos as number;
  currentVal.value = newVal;
}

onMounted(() => {
  updateValue(currentVal.value);
});

// Handle prop `value`, `min`, and `max` changed.
watchEffect(() => {
  const newVal = round(
      clip(
        props.value !== undefined ? props.value : currentVal.value,
        props.min,
        props.max,
      ),
      props.digit,
  );
  if (newVal === currentVal.value) return;
  updateValue(newVal);
});

// Step increment function. If num < 0, then becomes decrement.
const increment = (num: number = 1) => {
  const unitVal = props.step ? props.step : 10**(-props.digit);
  const newVal = round(
      clip(currentVal.value + num * unitVal, props.min, props.max),
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
  if (!e.type.endsWith('move')) { // touch start / mouse down
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
  const pointPos = clip(
      clientX - rect.left, pointRadius, rect.width - pointRadius,
  );
  const valBias = rangeMapping(
      pointPos, pointRadius, rect.width - pointRadius,
      0, props.max - props.min,
  );
  let val: number;
  if (props.step) {
    val = round(
        props.min + Math.floor(valBias / props.step) * props.step,
        props.digit,
    );
  } else val = round(props.min + valBias, props.digit);
  updateValue(val, pointPos);
};

// -Mouse up / Touch end.
const handleDragEnd = () => isDragging.value = false;

onMounted(() => {
  window.addEventListener('mousemove', handleDrag);
  window.addEventListener('touchmove', handleDrag);
  window.addEventListener('mouseup', handleDragEnd);
  window.addEventListener('touchend', handleDragEnd);
  return () => {
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('touchmove', handleDrag);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchend', handleDragEnd);
  };
});
// -Key down
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key == 'ArrowRight') increment();
  else if (e.key === 'ArrowLeft') increment(-1);
};
// end: onChange event
</script>

<style lang="scss" scoped module>
$point-size: 14px;
:export {
  point-size: $point-size;
}
.sliderWrapper {
  position: relative;
  height: 22px;
  width: 100%;
  font-size: var(--font-sm);
  background-color: transparent;
}

.tracker {
  // position
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  // shape
  height: 6px;
  width: 100%;
  border-radius: $radius-lg;

  background-color: $color5;
  cursor: pointer;
  user-select: none;
  &:hover .tooltip {
    display: block;
  }
}

.point {
  @extend %center;
  height: $point-size;
  aspect-ratio: 1 / 1;
  border-radius: 100%;
  border: solid 3px white;
  outline: solid 1px $color5;
  box-sizing: border-box;
  background-color: $color5;
}

.limit {
  display: inline-block;
  position: absolute;
  bottom: 100%;
  font-size: var(--font-sm);
  &:first-of-type{
    left: 0;
  }
  &:last-of-type {
    left: auto;
    right: 0;
  }
}

.tooltip { // Tooltip
  display: none;
  // position
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translate(-50%, -9px);
  // shape
  min-width: 10px;
  padding: 3px 8px;
  border-radius: $radius-md;

  font-size: var(--font-sm);
  text-align: center;
  color: $color1;
  background-color: $color5;
  cursor: default;
  user-select: all;
  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translate(-50%);
    width: 0;
    height: 0;
    border-width: 5px 6px;
    border-style: solid;
    border-color: $color5 transparent transparent transparent;
  }
}
</style>
