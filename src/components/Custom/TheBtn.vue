<template>
  <button
    type="button"
    :class="[
      'btn', icon && 'icon'
    ]"
    :aria-label="text"
  >
    <div
      v-if="variant !== 'flat'"
      class="btn__overlay"
    />
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
        />
        <template v-else>
          {{ text }}
        </template>
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
  variant?: 'std' | 'flat',
  icon?: IconType,
  prependIcon?: IconType,
  appendIcon?: IconType,
  contents?: readonly string[] | {
    name: string,
    val: string,
  }[];
}
withDefaults(defineProps<Props>(), {
  variant: 'std',
});
</script>

<style src="./TheBtn.scss" />
