<template>
  <i
    :class="[
      'icon',
      getIcon(type)
    ]"
    @click="onClick ? onClick($event) : $emit('click', $event)"
  />
</template>

<script setup lang='ts'>
import { getIcon } from '@/utils/icons';
import type { IconType } from '@/utils/icons';
import './TheIcon.scss';

type Prop = {
  type: IconType;
  onClick?: (e?: MouseEvent) => any
}

defineProps<Prop>();
defineEmits<{
  (e: 'click', val?: MouseEvent): void
}>();
</script>
