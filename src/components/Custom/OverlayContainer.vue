<template>
  <Teleport to="#overlay-container">
    <div
      v-if="eager || isActive"
      v-show="isActive"
      ref="containerRef"
      class="overlay"
      v-bind="$attrs"
      :role="role"
      :aria-modal="ariaModal || undefined"
    >
      <Transition
        name="fade-out"
      >
        <div
          v-if="!hideScrim && model"
          ref="scrimRef"
          class="overlay-scrim"
          :style="{
            backgroundColor: transparent ? 'transparent' : undefined,
          }"
          @click="handleClickScrim"
        />
      </Transition>
      <Transition
        v-if="transition"
        :name="transition"
        @after-enter="$emit('transitionEnd')"
        @after-leave="isActive=false;isClosing = true;$emit('transitionEnd')"
      >
        <slot v-if="model" />
      </Transition>
      <slot v-if="!transition || isClosing" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useWindowEventRegister } from '@/utils/composables/useWindowEventRegister';
import { invertBoolean } from '@/utils/helpers';
import { toValue } from '@vueuse/core';
import { ModelRef, ref, watch } from 'vue';

type Props = {
  /**
   * Forces the component’s content to render when it mounts.
   */
  eager?: boolean,
  /**
   * Transparent background
   */
  transparent?: boolean,
  hideScrim?: boolean,
  role?: string,
  ariaModal?: boolean,
  transition?: string,
  /**
   * Add listener to closing overlay when pressing Escape.
   */
  escEvent?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  eager: false,
  ariaModal: false,
});

const containerRef = ref();
const scrimRef = ref();

const isActive = ref(false); // Dialog show/hide state
const model = defineModel<boolean>() as ModelRef<boolean>; // Control `isActive` and trigger transition;
const isClosing = ref(true); // For rendering content when eager

let keydownListener: void | (() => void);
watch(model, (newVal) => {
  if (newVal) { // Open dialog when model is true
    isActive.value = true;
    isClosing.value = false;
    if (props.escEvent)
      keydownListener = useWindowEventRegister(
        'keydown', handleKeydown, { once: true });
  } else if (!props.transition) {
    isActive.value = false;
    isClosing.value = true;
    keydownListener &&= keydownListener();
  }
}, { immediate: true });

defineEmits<{
  'update:modelValue': [newVal: boolean],
  'transitionEnd': [],
}>();

const handleKeydown = (e: KeyboardEvent) => {
  if (toValue(model) && e.key === 'Escape') {
    invertBoolean(model, false);
  }
};

const handleClickScrim = () => {
  invertBoolean(model, false);
};

defineOptions({
  inheritAttrs: false
});
</script>

<style src="./OverlayContainer.scss" />
