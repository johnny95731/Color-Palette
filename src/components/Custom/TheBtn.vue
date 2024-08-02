<template>
  <button
    type="button"
    class="btn"
    :aria-label="text"
  >
    <div class="btn__overlay" />
    <div
      v-if="$slots.prepend || prependIcon"
      class="btn__prepend"
    >
      <slot name="prepend">
        <TheIcon
          v-if="prependIcon"
          :type="prependIcon"
        />
      </slot>
    </div>
    <div class="btn__content">
      <slot>
        <TheIcon
          v-if="icon"
          :type="icon"
        />{{ text }}
      </slot>
    </div>
    <div
      v-if="$slots.append || appendIcon"
      class="btn__append"
    >
      <slot name="append">
        <TheIcon
          v-if="appendIcon"
          :type="appendIcon"
        />
      </slot>
    </div>
  </button>
</template>

<script setup lang="ts">
import TheIcon from '@/components/TheIcon.vue';
// Types
import type { IconType } from '@/utils/icons';

type Props = {
  text?: string,
  icon?: IconType,
  prependIcon?: IconType,
  appendIcon?: IconType,
  contents?: readonly string[] | {
    name: string,
    val: string,
  }[];
}
defineProps<Props>();
</script>

<style src="./TheBtn.scss" />
