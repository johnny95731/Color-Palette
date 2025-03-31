<template>
  <input
    :class="[
      'hex-inputter',
      fontSize === 'lg' && 'hex-inputter--text-lg'
    ]"
    :maxlength="maxLength"
    :size="size"
    :value="model"
    @input="textInputed($event)"
    @change="handleHexEditingFinished($event)"
    @paste="handlePaste($event)"
  >
</template>

<script setup lang="ts">
import { unref } from 'vue';
import { isValidHex, removeNonHex } from '@/utils/colorModels/hex';

type Props = {
  maxLength?: number | `${number}`,
  size?: number | `${number}`,
  fontSize?: 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  maxLength: 7,
  size: 6,
  fontSize: 'md'
});

const [model, modifiers] = defineModel<string>();

const textInputed = (e: Event) => {
  if (!modifiers.lazy) {
    const target = e!.currentTarget as HTMLInputElement;
    const text = removeNonHex(target.value);
    model.value = `#${text.toUpperCase()}`;
    target.value = model.value;
  }
};

/**
 * Finish Hex editing when input is blurred or press 'Enter'
 */
const handleHexEditingFinished = (e: Event) => {
  const text = (e.currentTarget as HTMLInputElement).value;
  if (text !== unref(model) && isValidHex(text)) {
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

  &--text-lg {
    font-size: $font-lg;
  }
}
</style>
