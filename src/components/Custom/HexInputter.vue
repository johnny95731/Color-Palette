<template>
  <input
    :class="[
      'hex-inputter',
      fontSize === 'lg' && 'hex-inputter--text-lg'
    ]"
    :maxlength="maxLength"
    :size="size"
    :autocomplete="autocomplete"
    :pattern="pattern"
    :value="model"
    @input="handleInput"
    @change="handleChange"
    @paste="handlePaste"
  >
</template>

<script setup lang="ts">
import { isValidHex } from '@johnny95731/color-utils';
import { unref } from 'vue';

import { removeNonHex } from '@/utils/colors';


type Props = {
  autocomplete?: string
  maxLength?: number | `${number}`
  size?: number | `${number}`
  pattern?: string
  fontSize?: 'md' | 'lg'
};

withDefaults(defineProps<Props>(), {
  autocomplete: 'off',
  maxLength: 9,
  size: 6,
  pattern: '#?([0-9A-Fa-f]{3,4}){1,2}',
  fontSize: 'md',
});

const [model, modifiers] = defineModel({
  type: String,
  default: '#000000',
});

const handleInput = (e: Event) => {
  const target = e!.currentTarget as HTMLInputElement;
  const text = `#${removeNonHex(target.value).toUpperCase()}`;
  target.value = text;
  if (!modifiers.lazy) {
    model.value = text;
  }
};

/**
 * Finish Hex editing when input is blurred or press 'Enter'
 */
const handleChange = (e: Event) => {
  const text = (e.currentTarget as HTMLInputElement).value;
  if (text !== unref(model)) {
    model.value = text;
  }
};

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const text = e.clipboardData?.getData('text');
  if (text && isValidHex(text)) {
    model.value = text;
  }
};
</script>

<style lang="scss">
@use "@/assets/variables.scss" as *;

.hex-inputter {
  padding: 2px 8px;
  border-radius: $radius-sm;
  font-size: $font-md;

  &:invalid {
    outline: 2px solid red;
  }

  &--text-lg {
    font-size: $font-lg;
  }
}
</style>
