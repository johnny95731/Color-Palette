<template>
  <Teleport to="#overlay-container">
    <div
      v-if="eager || model || isActive"
      v-show="model || isActive"
      :class="[
        'overlay',
        type
      ]"
      v-bind="$attrs"
      :role="role"
      :aria-modal="ariaModal || undefined"
      aria-live="polite"
    >
      <Transition
        name="fade-out"
      >
        <div
          v-if="!hideScrim"
          v-show="isActive && model"
          class="overlay__scrim"
          :style="{
            backgroundColor: transparent ? 'transparent' : undefined,
          }"
          @click="isActive = false"
        />
      </Transition>
      <Transition
        :name="transition"
        @after-enter="$emit('transitionEnd');"
        @after-leave="handleTransition"
      >
        <div
          v-show="isActive && model"
          class="overlay__content"
          v-bind="{class: contentClass}"
        >
          <slot />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ModelRef, ref, watch } from 'vue';
import { toValue } from '@vueuse/core';
import { invertBoolean } from '@/utils/helpers';
import type { VueClass } from 'types/browser';

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
  type?: 'menu' | 'dialog' | 'offcanvas'
  ariaModal?: boolean,
  transition?: string,
  contentClass?: VueClass
  /**
   * Adding listener to closing overlay when pressing Escape.
   */
  escEvent?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  eager: false,
  type: 'dialog',
  ariaModal: false,
  escEvent: true,
});

const emit = defineEmits<{
  'update:modelValue': [newVal: boolean],
  'transitionEnd': [],
}>();

const handleTransition = () => {
  model.value = false;
  emit('transitionEnd');
};

const handleKeydown = (e: KeyboardEvent) => {
  if (toValue(model) && e.key === 'Escape') {
    invertBoolean(model, false);
  }
};

// Container must close after content transition end.
// Need another state to delay closing container.
const isActive = ref(false);
const model = defineModel<boolean>() as ModelRef<boolean>; // Control `isActive` and trigger transition;

watch(model, (newVal) => {
  if (newVal) { // Open dialog when model is true
    isActive.value = true;
    if (props.escEvent)
      addEventListener('keydown', handleKeydown);
    return;
  } else if (!props.transition) {
    isActive.value = false;
  }
  removeEventListener('keydown', handleKeydown);
}, { immediate: true, flush: 'post' });
// flush: 'post' to maker container updated first when eager is false

defineOptions({
  inheritAttrs: false
});
</script>

<style src="./OverlayContainer.scss" />
