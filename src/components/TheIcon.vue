<template>
  <i
    :class="[
      getIcon(type)
    ]"
  />
</template>

<script setup lang='ts'>
import { getIcon } from '@/utils/icons';
import type { IconType } from '@/utils/icons';

type Prop = {
  type: IconType;
}

defineProps<Prop>();
</script>
