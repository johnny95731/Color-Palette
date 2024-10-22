<template>
  <OverlayContainer
    :id="idForContainer"
    :transition="transition"
    role="tooltip"
    type="tooltip"
    :eager="eager"
    hide-scrim
    v-model="isShow"
  >
    <div
      :style="tooltipStyle"
      :class="['tooltip-wrapper', location, props.class]"
      @mouseenter="handleShow"
      @mouseleave="handleHide"
    >
      <slot name="text">
        {{ text }}
      </slot>
    </div>
  </OverlayContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch, toValue, getCurrentInstance, onMounted } from 'vue';
import { useEventListener } from '@vueuse/core';
import OverlayContainer from './OverlayContainer.vue';
import { useElementBounding } from '@/composables/useElementBounding';
import { isNullish, invertBoolean } from '@/utils/helpers';
import { getComponentId } from '@/utils/browser';
import type { CSSProperties, Component } from 'vue';
import type { VueClass } from 'types/browser';

type Props = {
  activator?: `#${string}` | 'parent' | HTMLElement | Component,
  id?: string,
  class?: VueClass,
  eager?: boolean,
  text?: string | number,
  transition?: string,
  closeDelay?: string | number,
  openDelay?: string | number,
  location?: 'top' | 'bottom' | 'left' | 'right',
}

const props = withDefaults(defineProps<Props>(), {
  location: 'bottom',
  eager: true,
  transition: 'fade-out',
  openDelay: 100,
  closeDelay: 200,
});


const refreshActivatorElKey = ref<boolean>(false);
const instance = getCurrentInstance();
/** Activators that is not in slots. */
const activatorEl = computed<HTMLElement | null>(() => {
  refreshActivatorElKey.value;
  if (props.activator === 'parent')
    return instance?.parent?.proxy?.$el;
  if (typeof props.activator === 'string')
    return document.querySelector(props.activator);
  if (props.activator instanceof HTMLElement) return props.activator;
  // @ts-expect-error
  return props.activator?.$el;
});
onMounted(() => {
  invertBoolean(refreshActivatorElKey); // trigger computed
});

const idForContainer = computed<string>(() =>
  props.id ?? getComponentId('tooltip')
);
const removeAttributes = (el: HTMLElement | null) => {
  el?.removeAttribute('aria-describedby');
};
const addAttributes = (el: HTMLElement | null, id: string) => {
  el?.setAttribute('aria-describedby', id);
};

watch(
  () => [toValue(activatorEl), toValue(idForContainer)] as const,
  (newEl, oldEl) => {
    if (oldEl)
      removeAttributes(oldEl[0]);
    addAttributes(newEl[0], newEl[1]);
  }, { immediate: true, flush: 'post' });


const openDelay_ = computed<number>(() =>
  Number.isNaN(+props.openDelay) ? 0 : +props.openDelay
);
const closeDelay_ = computed<number>(() =>
  Number.isNaN(+props.closeDelay) ? 0 : +props.closeDelay
);

// Tooltip position
//** Current activator */
const currentTarget = ref<HTMLElement | null>(null);
const { rect } = useElementBounding(currentTarget);
const tooltipStyle = computed<CSSProperties>(() => {
  if (!(currentTarget.value instanceof Element)) return {};
  const location = props.location;
  if (location === 'left') {
    return {
      top: `${rect.top + rect.height / 2}px`,
      right: `${window.innerWidth - (rect.left - 4)}px`,
      transform: 'translateY(-50%)',
    };
  }
  if (location === 'right') {
    return {
      top: `${rect.top + rect.height / 2}px`,
      left: `${rect.right + 4}px`,
      transform: 'translateY(-50%)',
    };
  }
  if (location === 'top') {
    return {
      bottom: `${window.innerHeight - (rect.top - 4)}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
    };
  }
  else { // 'bottom'
    return {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
    };
  }
});

// Show/Hide events
const isShow = defineModel<boolean>();
let delayTimeoutId: number | void;
const handleShow = (e: MouseEvent) => {
  // Clear timeout
  delayTimeoutId = clearTimeout(delayTimeoutId as number | undefined);
  // Set isShow
  toValue(openDelay_) ?
    delayTimeoutId = setTimeout(invertBoolean, toValue(openDelay_), isShow, true) as unknown as number :
    invertBoolean(isShow, true);
  if (e.currentTarget instanceof HTMLElement)
    currentTarget.value = e.currentTarget;
};
const handleHide = () => {
  // Clear timeout
  isNullish(delayTimeoutId) || (delayTimeoutId = clearTimeout(delayTimeoutId!));
  // Set isShow
  toValue(closeDelay_) ?
    delayTimeoutId = setTimeout(invertBoolean, toValue(closeDelay_), isShow, false) as unknown as number :
    invertBoolean(isShow, false);
};

// Binding events
useEventListener(activatorEl, 'mouseenter', handleShow);
useEventListener(activatorEl, 'mouseleave', handleHide);
</script>

<style src="./TheTooltip.scss" />
