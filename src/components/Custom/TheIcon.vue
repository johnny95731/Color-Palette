<template>
  <i
    :class="[
      getIcon(type)
    ]"
  />
</template>

<script setup lang='ts'>
import { getIcon } from '@/utils/icons';

type Prop = {
  type: string;
}

defineProps<Prop>();
</script>
