<template>
  <component
    v-if="isWrap"
    v-bind="$attrs"
    :is="tag"
  >
    <slot />
  </component>
  <slot v-else />
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  tag: string | Component;
  isWrap: boolean;
}

defineProps<Props>();
</script>
