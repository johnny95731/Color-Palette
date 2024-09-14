<template>
  <slot
    name="activator"
    :isShow="isShow"
    :props="activatorSlotProps"
  />
  <OverlayContainer
    :id="idForContainer"
    role="tooltip"
    type="tooltip"
    :eager="eager"
    hide-scrim
    v-model="isShow"
  >
    <div
      :style="tooltipStyle"
      :class="['tooltip-wrapper', location, props.class]"
      v-bind="activatorSlotProps"
    >
      <slot name="text">
        {{ text }}
      </slot>
    </div>
  </OverlayContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch, toValue, getCurrentInstance, onMounted } from 'vue';
import './TheTooltip.scss';
import OverlayContainer from './OverlayContainer.vue';
import { isNullish, invertBoolean } from '@/utils/helpers';
import type { ModelRef, CSSProperties, Component } from 'vue';
import type { VueClass } from 'types/browser';
import { getComponentId } from '@/utils/browser';

type Props = {
  activator?: `#${string}` | 'parent' | HTMLElement | Component,
  id?: string,
  class?: VueClass,
  eager?: boolean,
  text?: string,
  closeDelay?: string | number,
  openDelay?: string | number,
  location?: 'top' | 'bottom' | 'left' | 'right',
}

const props = withDefaults(defineProps<Props>(), {
  location: 'bottom',
  eager: true,
  openDelay: 100,
  closeDelay: 200,
});


const refreshOtherActivatorsKey = ref<boolean>(false);
const instance = getCurrentInstance();
/** Activators that is not in slots. */
const otherActivators = computed<HTMLElement | null>(() => {
  refreshOtherActivatorsKey.value;
  if (props.activator === 'parent')
    return instance?.parent?.proxy?.$el;
  if (typeof props.activator === 'string')
    return document.querySelector(props.activator);
  if (props.activator instanceof HTMLElement) return props.activator;
  // @ts-expect-error
  return props.activator?.$el;
});
onMounted(async () => {
  invertBoolean(refreshOtherActivatorsKey); // trigger computed
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
  () => [toValue(otherActivators), toValue(idForContainer)] as const,
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
const tooltipStyle = ref<CSSProperties>({});
//** Current activator */
let currentTarget: EventTarget | null = null;
const calcTooltipPos = (): CSSProperties => {
  if (!(currentTarget instanceof Element)) return {};
  const rect = currentTarget.getBoundingClientRect();
  const location = props.location;
  if (location === 'top') {
    return {
      bottom: `${rect.top - 4}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
    };
  }
  if (location === 'bottom') {
    return {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
    };
  }
  if (location === 'left') {
    return {
      top: `${rect.top + rect.height / 2}px`,
      right: `${rect.left - 4}px`,
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
  return {};
};

// Show/Hide events
const isShow = defineModel<boolean>() as ModelRef<boolean>;
let delayTimeoutId: number | void;
const handleShow = (e: MouseEvent) => {
  // Clear timeout
  delayTimeoutId = clearTimeout(delayTimeoutId as number | undefined);
  // Set isShow
  toValue(openDelay_) ?
    delayTimeoutId = setTimeout(invertBoolean, toValue(openDelay_), isShow, true) as unknown as number :
    invertBoolean(isShow, true);
  currentTarget = e.currentTarget;
};
const handleHide = () => {
  // Clear timeout
  isNullish(delayTimeoutId) || (delayTimeoutId = clearTimeout(delayTimeoutId!));
  // Set isShow
  toValue(closeDelay_) ?
    delayTimeoutId = setTimeout(invertBoolean, toValue(closeDelay_), isShow, false) as unknown as number :
    invertBoolean(isShow, false);
};

watch(isShow, (newVal) => {
  if (newVal) tooltipStyle.value = calcTooltipPos();
}, { flush: 'sync' });


// Binding events
watch(otherActivators, (newEl, oldEl) => {
  oldEl?.removeEventListener('mouseenter', handleShow);
  oldEl?.removeEventListener('mouseleave', handleHide);
  newEl?.addEventListener('mouseenter', handleShow);
  newEl?.addEventListener('mouseleave', handleHide);
}, { immediate: true, flush: 'post' });
/** Binding on activator manually by slot-template */
const activatorSlotProps = computed(() => ({
  onMouseenter: handleShow,
  onMouseleave: handleHide,
  'aria-describedby': idForContainer.value
}));

</script>
