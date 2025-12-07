<template>
  <slot
    name="activator"
    :isOpened="isOpened"
    :props="activatorProps"
    :handleClick="handleClick"
  />
  <OverlayContainer
    ref="tooltipRef"
    :id="idForContainer"
    class="tooltip"
    :transition="transition"
    role="tooltip"
    type="tooltip"
    :eager="eager"
    hide-scrim
    :content-style="tooltipStyle"
    v-model="isOpened"
  >
    <div v-bind="$attrs">
      <slot name="text">
        {{ text }}
      </slot>
    </div>
  </OverlayContainer>
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import {
  computed,
  ref,
  watch,
  getCurrentInstance,
  onMounted,
  unref,
} from 'vue';

import { useElementBounding } from '@/composables/useElementBounding';
import { getComponentId } from '@/utils/browser';
import { isNullish, invertBoolean } from '@/utils/helpers';

import OverlayContainer from './OverlayContainer.vue';

import type { CSSProperties, Component } from 'vue';


export type Props = {
  activator?: string | 'parent' | 'DomParent' | HTMLElement | Component
  id?: string
  eager?: boolean
  text?: string | number
  transition?: string
  openOnHover?: boolean
  closeDelay?: string | number
  openDelay?: string | number
  openOnClick?: boolean
  clickOpenDuration?: string | number
  location?: 'top' | 'bottom' | 'left' | 'right'
};

const props = withDefaults(defineProps<Props>(), {
  location: 'bottom',
  eager: true,
  transition: 'fade-out',
  openOnHover: true,
  openDelay: 300,
  closeDelay: 200,
  openOnClick: false,
  clickOpenDuration: 700,
});

const tooltipRef = ref<InstanceType<typeof OverlayContainer>>();

const refreshActivatorElKey = ref<boolean>(false);
const instance = getCurrentInstance();
/** Activators that is not in slots. */
const activatorEl = computed<HTMLElement | null>(() => {
  // eslint-disable-next-line
  refreshActivatorElKey.value;
  if (props.activator === 'parent') return instance?.parent?.proxy?.$el;
  if (props.activator === 'DomParent') {
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

const idForContainer = computed<string>(
  () => props.id ?? getComponentId('tooltip'),
);
const removeAttributes = (el: HTMLElement | null) => {
  el?.removeAttribute('aria-describedby');
};
const addAttributes = (el: HTMLElement | null, id: string) => {
  el?.setAttribute('aria-describedby', id);
};

watch(
  () => [unref(activatorEl), unref(idForContainer)] as const,
  (newEl, oldEl) => {
    if (oldEl) removeAttributes(oldEl[0]);
    addAttributes(newEl[0], newEl[1]);
  },
  { immediate: true, flush: 'post' },
);

const openDelay_ = computed<number>(() =>
  Number.isNaN(+props.openDelay) ? 100 : +props.openDelay,
);
const closeDelay_ = computed<number>(() =>
  Number.isNaN(+props.closeDelay) ? 200 : +props.closeDelay,
);
const clickOpenDuration_ = computed<number>(() =>
  isNaN(+props.clickOpenDuration) ? 700 : +props.clickOpenDuration,
);

// Tooltip position
//* * Current activator */
const currentTarget = ref<HTMLElement | null>(null);
const { rect_ } = useElementBounding(currentTarget);
const tooltipStyle = computed<CSSProperties>(() => {
  if (!(unref(currentTarget) instanceof Element)) return {};
  const location = props.location;
  if (location === 'left') {
    return {
      top: `${rect_.top + rect_.height / 2}px`,
      right: `${document.body.clientWidth - (rect_.left - 4)}px`,
      transform: 'translateY(-50%)',
    };
  }
  else if (location === 'right') {
    return {
      top: `${rect_.top + rect_.height / 2}px`,
      left: `${rect_.right + 4}px`,
      transform: 'translateY(-50%)',
    };
  }
  else if (location === 'top') {
    return {
      bottom: `${document.body.clientHeight - (rect_.top - 4)}px`,
      left: `${rect_.left + rect_.width / 2}px`,
      transform: 'translateX(-50%)',
    };
  }
  else if (location === 'bottom') {
    return {
      top: `${rect_.bottom + 4}px`,
      left: `${rect_.left + rect_.width / 2}px`,
      transform: 'translateX(-50%)',
    };
  }
  else return {};
});

// Show/Hide events
const isOpened = defineModel<boolean>();
// TODO: 開啟dialog內的tooltip時，關閉dialog後會導致tooltip無法正常開啟。
let delayTimeoutId: number | void;
const handleShow = (e: MouseEvent) => {
  if (!props.openOnHover && e.type === 'mouseenter') return;
  // Clear timeout
  delayTimeoutId = clearTimeout(delayTimeoutId as number | undefined);
  // Set `isOpened`
  if (unref(openDelay_))
    delayTimeoutId = window.setTimeout(
      invertBoolean,
      unref(openDelay_),
      isOpened,
      true,
    );
  else invertBoolean(isOpened, true);
  // To get activator position.
  currentTarget.value = e.currentTarget as HTMLElement;
};
const handleHide = (e: MouseEvent) => {
  if (!props.openOnHover && e?.type === 'mouseleave') return;
  // Clear timeout
  if (!isNullish(delayTimeoutId))
    delayTimeoutId = clearTimeout(delayTimeoutId!);
  // Set `isOpened`
  if (unref(closeDelay_))
    delayTimeoutId = window.setTimeout(
      invertBoolean,
      unref(closeDelay_),
      isOpened,
      false,
    );
  else invertBoolean(isOpened, false);
};

let clickTimeout: number | void;
const handleClick = (e: MouseEvent) => {
  if (!props.openOnClick) return;
  if (clickTimeout)
    clickTimeout = window.clearTimeout(clickTimeout as number | undefined);
  invertBoolean(isOpened, true);
  // To get activator position.
  currentTarget.value = e.currentTarget as HTMLElement;
  clickTimeout = window.setTimeout(
    invertBoolean,
    unref(clickOpenDuration_) + unref(closeDelay_),
    isOpened,
    false,
  );
};

// Binding events
useEventListener(activatorEl, 'mouseenter', handleShow);
useEventListener(activatorEl, 'mouseleave', handleHide);
useEventListener(activatorEl, 'click', handleClick);
const activatorProps = computed(() => ({
  'onMouseenter': handleShow,
  'onMouseleave': handleHide,
  'onClick': handleClick,
  'aria-describedby': unref(idForContainer),
}));
</script>

<style lang="scss">
@use "@/assets/variables.scss" as *;

.tooltip .overlay__content {
  padding: 8px 12px;
  border-radius: $radius-md;

  color: #fff;
  text-wrap: nowrap;

  background: #000b;
}
</style>
