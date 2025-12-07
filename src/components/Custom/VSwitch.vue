<template>
  <div
    class="switch"
  >
    <div class="field">
      <label
        v-if="fieldState.ariaLabel_"
        :for="fieldState.id_"
        @click.prevent="handleClick();switchRef?.focus()"
      >{{ fieldState.ariaLabel_ }}</label>
      <input
        :id="fieldState.id_"
        :aria-label="fieldState.ariaLabel_"
        :aria-labelledby="fieldState.ariaLabelledby_"
        type="checkbox"
        inputmode="none"
        :checked="model"
        @focus="switchRef?.focus();"
      >
    </div>
    <div
      ref="switchRef"
      class="switch__slider"
      tabindex="0"
      role="switch"
      :aria-checked="model"
      :aria-labelledby="fieldState.ariaLabel_"
      @click="handleClick"
      @keydown="handleKeyDown"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

import useInputField from '@/composables/useInputField';
import { invertBoolean } from '@/utils/helpers';

import type { ModelRef } from 'vue';


type Props = {
  label?: string
};

const props = withDefaults(defineProps<Props>(), {
});

const switchRef = ref<HTMLDivElement>();

// Handle form element
const { state_: fieldState, cleanup } = useInputField(props.label, 'switch');
onUnmounted(cleanup);


// Handle values
const model = defineModel<boolean>() as ModelRef<boolean>;

const handleClick = () => {
  invertBoolean(model);
};
const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  if (key === ' ') {
    invertBoolean(model);
  }
};
</script>

<style lang="scss">
@use "sass:map";
@use "@/assets/variables.scss" as *;

$switch-md: ("h": 20px, "w": 35px);

.switch {
  $root: &;
  $slider-margin: 4px;

  display: flex;
  align-items: center;

  label {
    cursor: pointer;
    display: inline-block;
    margin-left: 4px;
    color: $color5;
  }

  &__slider {
    cursor: pointer;

    position: relative;

    display: inline-block;

    width: map.get($switch-md, "w");
    height: map.get($switch-md, "h");
    border-radius: $radius-lg;

    background-color: #ccc;

    transition: .4s;

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
      box-shadow: 0 0 4px 8px #0002;
    }

    @supports not selector(:focus-visible) {
      &:focus::before {
        box-shadow: 0 0 4px 8px #0002;
      }
    }

    @at-root #{$root}:has(input:checked) & {
      background-color: rgb(0 200 0);

      &::before {
        // distance betewwn left: $slider-margin; and right: $slider-margin; is
        //   dist = map.get($switch-md, "w") - 2 * $slider-margin
        // thumb diameter, diam = map.get($switch-md, "h") - 2 * $slider-margin
        // translate = dist - diam
        //           = map.get($switch-md, "w") - map.get($switch-md, "h")
        transform:
         translate(map.get($switch-md, "w") - map.get($switch-md, "h"))
      }
    }
  }
}

</style>
