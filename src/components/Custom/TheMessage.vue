<template>
  <OverlayContainer
    hideScrim
  >
    {{ text }}{{ activatorEl }}
  </OverlayContainer>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, toValue, watch } from 'vue';
import OverlayContainer from './OverlayContainer.vue';
import type { Component } from 'vue';
import { invertBoolean } from '@/utils/helpers';
import { useEventListener } from '@vueuse/core';

type Props = {
  activator?: `#${string}` | 'parent' | 'parentDOM' | HTMLElement | Component,

  text?: string,
  /**
   * Message
   */
  duration?: number | `${number}`
  openDelay?: string | number,
}
const props = withDefaults(defineProps<Props>(), {
  openDelay: 100,
  duration: 300,
});

const refreshActivatorElKey = ref<boolean>(false);
const instance = getCurrentInstance();
/** Activators that is not in slots. */
const activatorEl = computed<HTMLElement | null>(() => {
  refreshActivatorElKey.value;
  if (props.activator === 'parent')
    return instance?.parent?.proxy?.$el;
  if (props.activator === 'parentDOM') {
    return instance?.proxy?.$el.previousElementSibling;
  }
  if (typeof props.activator === 'string')
    return document.querySelector(props.activator);
  if (props.activator instanceof HTMLElement) return props.activator;
  // @ts-expect-error
  return props.activator?.$el;
});
onMounted(() => {
  invertBoolean(refreshActivatorElKey); // trigger computed
});

const openDelay_ = computed<number>(() =>
  Number.isNaN(+props.openDelay) ? 0 : +props.openDelay
);
const currentTarget = ref<HTMLElement | null>(null);
let delayTimeoutId: number | void;
const handleShow = (e: MouseEvent) => {
  // Clear timeout
  delayTimeoutId = clearTimeout(delayTimeoutId as number | undefined);
  // Set isShow
  toValue(openDelay_) ?
    delayTimeoutId = setTimeout(invertBoolean, toValue(openDelay_), isShow, true) as unknown as number :
    invertBoolean(isShow, true);
  currentTarget.value = e.currentTarget as HTMLElement;
};

// Binding events
useEventListener(activatorEl, 'click', handleShow);

const isShow = defineModel<boolean>();

watch(isShow, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      isShow.value = false;
    }, +props.duration);
  }
});

</script>
