<template>
  <i
    :class="[
      getIcon(type)
    ]"
    :aria-hidden="ariaHidden"
  />
</template>

<script setup lang='ts'>
import { getIcon } from '@/utils/icons';

type Prop = {
  type: string;
  ariaHidden?: boolean | `${boolean}`
}

withDefaults(defineProps<Prop>(), {
  ariaHidden: true
});
</script>
