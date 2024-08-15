<template>
  <Teleport to="#overlay-container">
    <Transition name="transition">
      <div
        v-if="eager || model"
        v-show="model"
        ref="containerRef"
        class="overlay"
        v-bind="$attrs"
        :role="role"
        :aria-modal="ariaModal || undefined"
      >
        <div
          v-if="!hideScrim"
          ref="scrimRef"
          class="overlay-scrim"
          :style="{
            backgroundColor: transparent ? 'transparent' : undefined
          }"
          @click="$emit('click', $event);$emit('update:model-value', !model)"
        />
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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
});

const containerRef = ref();
const scrimRef = ref();

const model = defineModel<boolean>();

defineEmits<{
  click: [ev: MouseEvent]
  'update:model-value': [newVal: boolean]
}>();

defineExpose({
  container: containerRef,
  scrim: props.hideScrim ? null : scrimRef,
});

defineOptions({
  inheritAttrs: false
});
</script>

<style src="./OverlayContainer.scss" />
