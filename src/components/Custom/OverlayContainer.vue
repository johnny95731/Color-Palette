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
      @keydown="handleKeydown"
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
import { ref, watch } from 'vue';

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
}

const props = withDefaults(defineProps<Props>(), {
  eager: false,
  ariaModal: false,
  duration: 200,
});

const containerRef = ref();
const scrimRef = ref();

const isActive = ref(false); // Dialog state
const model = defineModel<boolean>(); // Control `isActive` and trigger transition;
const isClosing = ref(true); // For rendering content when eager

watch(model, (newVal) => {
  if (newVal) { // Open dialog when model is true
    isActive.value = true;
    isClosing.value = false;
  } else if (!props.transition) {
    isActive.value = false;
    isClosing.value = true;
  }
});

const emit = defineEmits<{
  click: [ev: MouseEvent]
  'update:modelValue': [newVal: boolean]
  'transitionEnd': []
}>();

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    model.value = false;
  }
};

const handleClickScrim = (e: MouseEvent) => {
  emit('click', e);
  model.value = false;
};

defineExpose({
  container: containerRef,
  scrim: props.hideScrim ? null : scrimRef,
});

defineOptions({
  inheritAttrs: false
});
</script>

<style src="./OverlayContainer.scss" />
