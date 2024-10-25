<template>
  <Teleport to="#overlay-container">
    <div
      v-if="eager || model || isActive"
      v-show="model || isActive"
      :class="[
        'overlay',
        `overlay--${type}`,
        model && 'overlay--active'
      ]"
      v-bind="$attrs"
      :role="role"
      :aria-modal="ariaModal || undefined"
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
        />
      </Transition>
      <Transition
        :name="transition"
        @after-enter="handleAfterEnter"
        @after-leave="handleAfterLeave"
      >
        <div
          ref="contentRef"
          v-show="isActive && model"
          class="overlay__content"
          v-bind="{
            class: contentClass,
            style: contentStyle,
          }"
        >
          <slot />
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ModelRef, onMounted, ref, watch } from 'vue';
import { toValue } from '@vueuse/core';
import { invertBoolean } from '@/utils/helpers';
import type { CSSProperties } from 'vue';
import type { VueClass } from 'types/browser';
import { useElementBounding } from '@/composables/useElementBounding';

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
  type?: 'menu' | 'dialog' | 'offcanvas' | 'tooltip'
  ariaModal?: boolean,
  transition?: string,
  contentClass?: VueClass
  contentStyle?: CSSProperties
  /**
   * Adding listener to closing overlay when pressing Escape.
   */
  escEvent?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  type: 'dialog',
  escEvent: true,
});

const contentRef = ref<HTMLDivElement>();
const { rect } = useElementBounding(contentRef);

const emit = defineEmits<{
  'update:modelValue': [newVal: boolean],
  'transitionEnd': [],
}>();

const handleKeydown = (e: KeyboardEvent) => {
  if (toValue(model) && e.key === 'Escape') {
    invertBoolean(model, false);
  }
};

const clickOutside = (e: MouseEvent) => {
  if (
    // toValue(contentRef) && !toValue(contentRef)!.contains(e.target)
    // .contains() can not avoid closing when clicking tooltips
    !(
      rect.top <= e.clientY && e.clientY <= rect.bottom &&
      rect.left <= e.clientX && e.clientX <= rect.right
    )
  ) {
    model.value = false;
  }
};

// Control show and hide
const model = defineModel<boolean>() as ModelRef<boolean>;
// Container can not be closed before content transition end.
// Need another state to delay closing container.
const isActive = ref(false);

// Events when dom show/hide.
const handleAfterEnter = () => {
  if (props.type !== 'menu')
    addEventListener('click', clickOutside);
  if (props.escEvent)
    addEventListener('keydown', handleKeydown);
  emit('transitionEnd');
};
const handleAfterLeave = () => {
  isActive.value = false;
  removeEventListener('click', clickOutside);
  removeEventListener('keydown', handleKeydown);
  emit('transitionEnd');
};

watch(model, (newVal) => {
  if (newVal) { // Open dialog when model is true
    isActive.value = true;
  }
}, { flush: 'post' });
onMounted(() => {
  if (model.value) isActive.value = true;
});
// flush: 'post' to maker container updated first when eager is false

defineOptions({
  inheritAttrs: false
});

defineExpose({
  contentRef
});
</script>

<style lang="scss">
@use '@/assets/commons.module.scss' as *;

.overlay {
  $root: &;
  @include overlay(fixed);
  display: flex;
  z-index: 999;
  pointer-events: none;
  > .overlay__content {
    pointer-events: auto;
    z-index: 1;
  }

  &__scrim {
    @include overlay(fixed);
    background-color: #0007;
    pointer-events: auto;
  }

  &--dialog {
    align-items: center;
    justify-content: center;
  }

  &--offcanvas {
    align-items: stretch;
    justify-content: right;
  }

  &--tooltip > &__content{
    position: fixed;
    pointer-events: none;
  }
}
</style>
