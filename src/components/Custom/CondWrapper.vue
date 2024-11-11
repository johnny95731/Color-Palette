<template>
  <component
    v-if="isWrap"
    v-bind="$attrs"
    :is="tag"
  >
    <slot />
  </component>
  <slot
    v-else
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  tag?: string | Component;
  isWrap?: boolean;
}

withDefaults(defineProps<Props>(), {
  tag: 'div',
  isWrap: true,
});
</script>
