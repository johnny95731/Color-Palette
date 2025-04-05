<template>
  <i
    :class="[
      getIcon(icon)
    ]"
    :aria-hidden="ariaHidden"
  />
</template>

<script setup lang='ts'>
import { getIcon } from '@/utils/icons';

type Prop = {
  icon: string;
  ariaHidden?: boolean | `${boolean}`
}

withDefaults(defineProps<Prop>(), {
  ariaHidden: true
});
</script>
