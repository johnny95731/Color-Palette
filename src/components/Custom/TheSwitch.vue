<template>
  <div
    class="switch"
  >
    <input
      class="field"
      ref="inputRef"
      v-bind="labelState"
      :id="idForInput"
      type="checkbox"
      :value="value"
      :checked="model"
      v-model="model"
      @focus="switchRef?.focus();"
    >
    <div
      ref="switchRef"
      v-bind="labelState"
      class="switch__slider"
      tabindex="0"
      role="switch"
      :aria-checked="model"
      :value="value"
      @click="handleClick"
      @keydown="handleKeyDown"
    />
    <label
      v-if="labelState['aria-label']"
      :class="[hideLabel && 'field']"
      :for="idForInput"
      @click.prevent="handleClick();switchRef?.focus()"
    >{{ labelState['aria-label'] }}</label>
  </div>
</template>

<script setup lang="ts">
import {
  ModelRef,
  computed, onMounted, ref, watch,
} from 'vue';
import { toValue } from '@vueuse/core';
import { invertBoolean } from '@/utils/helpers';
import { getComponentId } from '@/utils/browser';

type Props = {
  inputId?: string,
  label?: string,
  hideLabel?: boolean;

  value?: string;
}

const props = withDefaults(defineProps<Props>(), {
});

const inputRef = ref<HTMLInputElement>();
const switchRef = ref<HTMLDivElement>();


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
  if (!props.label) return {};
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
const model = defineModel<boolean>() as ModelRef<boolean>;

function handleClick() {
  invertBoolean(model);
}
function handleKeyDown(e: KeyboardEvent) {
  const key = e.key.toLowerCase();
  if (key === ' ') {
    invertBoolean(model);
  }
}

</script>

<style lang="scss">
@use "sass:map";
@use "@/assets/variables.scss" as *;


$switch-md: ("h": 20px, "w": 35px);
.switch {
  $root: &;
  display: flex;
  align-items: center;
  label {
    display: inline-block;
    margin-left: 4px;
    color: $color5;
    cursor: pointer;
  }

  $slider-margin: 4px;
  &__slider {
    display: inline-block;
    position: relative;
    height: map.get($switch-md, "h");
    width: map.get($switch-md, "w");
    border-radius: $radius-lg;
    background-color: #ccc;
    transition: .4s;
    cursor: pointer;

    &::before { // thumb
      content: "";
      position: absolute;
      top: $slider-margin;
      bottom: $slider-margin;
      left: $slider-margin;
      aspect-ratio: 1 / 1;
      border-radius: 100%;
      background-color: white;
      transition: transform .4s;
    }

    &:focus-visible::before,
    &:hover::before {
      box-shadow: 0px 0px 4px 8px #0002;
    }
    @supports not selector(:focus-visible) {
      &:focus::before {
        box-shadow: 0px 0px 4px 8px #0002;
      }
    }

    @at-root #{$root}:has(input:checked) & {
      background-color: rgb(0, 200, 0);
      &::before {
        // distance betewwn left: $slider-margin; and right: $slider-margin; is
        //   dist = map.get($switch-md, "w") - 2 * $slider-margin
        // thumb diameter, diam = map.get($switch-md, "h") - 2 * $slider-margin
        // translate = dist - diam = map.get($switch-md, "w") - map.get($switch-md, "h")
        transform: translate(map.get($switch-md, "w") - map.get($switch-md, "h"))
      }
    }
  }
}

</style>
