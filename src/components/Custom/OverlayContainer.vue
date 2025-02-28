<template>
  <Teleport to="#overlay-container">
    <div
      v-if="eager || model || isActive"
      v-show="model || isActive"
      v-bind="$attrs"
      :class="[
        'overlay',
        `overlay--${type}`,
        model && 'overlay--active'
      ]"
      :style="{
        zIndex
      }"
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
import { inject, ModelRef, onMounted, provide, ref, unref, watch } from 'vue';
import { invertBoolean } from '@/utils/helpers';
import { useElementBounding } from '@/composables/useElementBounding';
import { OVERLAY_SYMBOL } from '@/constants/browser';
import type { CSSProperties } from 'vue';
import type { VueClass } from 'types/browser';
import { calcOverlayZIndex } from '@/utils/browser';

export type Props = {
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
  if (unref(model) && e.key === 'Escape') {
    invertBoolean(model, false);
  }
};

const { mousedown_, clickOutside_ } = (() => {
  const isClickOutside = (e: PointerEvent | MouseEvent) => (
    !(
      rect.top <= e.clientY && e.clientY <= rect.bottom &&
    rect.left <= e.clientX && e.clientX <= rect.right
    )
  );
  let pointerdownOutside: boolean = false;
  return {
    mousedown_: (e: PointerEvent) => {
      pointerdownOutside = isClickOutside(e);
    },
    clickOutside_: (e: MouseEvent) => {
      if (pointerdownOutside && isClickOutside(e) && !unref(openedChild)) {
        model.value = false;
      }
      pointerdownOutside = false;
    },
  };
})();

// Control show and hide
const model = defineModel<boolean>() as ModelRef<boolean>;
// Container can not be closed before content transition end.
// Need another state to delay closing container.
const isActive = ref(false);
/** Has opened child. */
const openedChild = ref(0);

type OverlayProvided = {
  zIndex?: number,
  /**
   * A submenu is opened.
   */
  register: () => void,
  /**
   * A submenu is closed.
   */
  unregister: () => void,
};

const parent = inject<OverlayProvided | null>(OVERLAY_SYMBOL, null);
let zIndex = calcOverlayZIndex(props.type, parent?.zIndex);
provide<OverlayProvided>(OVERLAY_SYMBOL, {
  zIndex,
  register() {
    openedChild.value++;
  },
  unregister() {
    openedChild.value--;
  },
});


// Events when dom show/hide.
const handleAfterEnter = () => {
  if (props.type !== 'menu' && props.type !== 'tooltip') {
    addEventListener('pointerdown', mousedown_, true);
    addEventListener('click', clickOutside_, true);
  }
  if (props.escEvent)
    addEventListener('keydown', handleKeydown);
  emit('transitionEnd');
};
const handleAfterLeave = () => {
  isActive.value = false;
  removeEventListener('pointerdown', mousedown_, true);
  removeEventListener('click', clickOutside_, true);
  removeEventListener('keydown', handleKeydown, true);
  emit('transitionEnd');
};

watch(model, (newVal) => {
  if (newVal) {
    isActive.value = true;
    parent?.register();
  } else {
    parent?.unregister();
  }
}, { flush: 'post' });
// flush: 'post' to maker container updated first when eager is false
onMounted(() => {
  // Trigger transition is dialog is open
  isActive.value = model.value;
});


defineOptions({
  inheritAttrs: false
});

defineExpose({
  contentRef
});
</script>

<style lang="scss">
@use '@/assets/variables.scss' as *;

.overlay {
  @include overlay(fixed);

  $root: &;

  pointer-events: none;
  z-index: 999;
  display: flex;

  &__content {
    pointer-events: auto;
    z-index: 1;
    box-shadow: 0 5px 15px rgba(0 0 0 / 35%);
  }

  &__scrim {
    @include overlay(fixed);

    pointer-events: auto;
    background-color: #0007;
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
    pointer-events: none;
    position: fixed;
  }
}
</style>
