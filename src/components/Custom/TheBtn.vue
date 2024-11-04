<template>
  <button
    type="button"
    :class="[
      'btn',
      icon && 'btn--icon',
      ripple && 'ripple'
    ]"
    :aria-label="text"
  >
    <div
      v-if="variant !== 'flat'"
      class="btn__overlay"
    />
    <div
      v-if="$slots.prepend || prependIcon"
      class="btn__prepend"
    >
      <slot name="prepend">
        <TheIcon
          v-if="prependIcon"
          :type="prependIcon"
        />
      </slot>
    </div>
    <div
      v-if="$slots.default || icon || text"
      class="btn__content"
    >
      <slot>
        <TheIcon
          v-if="icon"
          :type="icon"
        />
        <template v-else>
          {{ text }}
        </template>
      </slot>
    </div>
    <div
      v-if="$slots.append || appendIcon"
      class="btn__append"
    >
      <slot name="append">
        <TheIcon
          v-if="appendIcon"
          :type="appendIcon"
        />
      </slot>
    </div>
  </button>
</template>

<script setup lang="ts">
import TheIcon from '@/components/Custom/TheIcon.vue';

type Props = {
  text?: string,
  variant?: 'std' | 'flat',
  icon?: string,
  prependIcon?: string,
  appendIcon?: string,
  ripple?: boolean
}
withDefaults(defineProps<Props>(), {
  variant: 'std',
  ripple: true,
});
</script>

<style lang="scss">
@use "@/assets/commons.module.scss" as *;

$transDuration: 120ms;
.btn {
  // layout
  position: relative;
  display: grid;
  align-items: center;
  justify-content: center;
  grid-template-areas: "prepend content append";
  grid-template-columns: max-content auto max-content;
  gap: 4px;
  text-align: center;
  // shape;
  border: none;
  border-radius: $radius-lg;
  padding: 4px 8px;
  overflow: hidden;
  // style
  background-color: inherit;
  color: inherit;
  font-size: $font-md;
  font-weight: 600;
  line-height: normal;
  vertical-align: middle;

  user-select: none;

  &:hover,
  &:focus-visible {
    > .btn__overlay {
      opacity: var(--overlay-hover-opacity);
    }
  }
  @supports not selector(:focus-visible) {
    &:focus {
      & > .btn__overlay{
        opacity: var(--overlay-hover-opacity);
      }
    }
  }
}

.btn.btn--icon {
  aspect-ratio: 1 / 1;
}

.btn__overlay {
  @include overlay;
  background-color: currentColor;
  opacity: 0;
}

.btn__content,
.btn__prepend,
.btn__append {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn__prepend {
  grid-area: prepend;
}

.btn__content {
  grid-area: content;
  line-height: 1.25;
}

.btn__append {
  grid-area: append;
}

:root {
  --overlay-hover-opacity: 0.14;
}
</style>
