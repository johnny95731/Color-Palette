<template>
  <component
    :is="href ? 'a' : 'button'"
    :type="href ? undefined : type"
    :class="[
      'btn',
      icon && 'btn--icon',
      ripple && 'ripple'
    ]"
    :aria-label="text"
    :href="href"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
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
  </component>
</template>

<script setup lang="ts">
import TheIcon from '@/components/Custom/TheIcon.vue';

type Props = {
  type?: 'button' | 'submit' | 'reset',
  text?: string,
  variant?: 'std' | 'flat',
  icon?: string,
  prependIcon?: string,
  href?: string,
  appendIcon?: string,
  ripple?: boolean
}
withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'std',
  ripple: true,
});
</script>

<style lang="scss">
@use "@/assets/variables.scss" as *;

$trans-duration: 120ms;

.btn {
  user-select: none;

  position: relative;

  overflow: hidden;
  display: grid;
  grid-template-areas: "prepend content append";
  grid-template-columns: max-content auto max-content;
  gap: 4px;
  align-items: center;
  justify-content: center;

  padding: 4px 8px;
  border: none;
  border-radius: $radius-lg;

  font-size: $font-md;
  font-weight: $font-weight-medium;
  line-height: normal;
  color: inherit;
  text-align: center;
  vertical-align: middle;

  background-color: inherit;


  &:hover,
  &:focus-visible {
    > &__overlay {
      opacity: var(--overlay-hover-opacity);
    }
  }

  @supports not selector(:focus-visible) {
    &:focus {
      & > &__overlay{
        opacity: var(--overlay-hover-opacity);
      }
    }
  }
}

.btn--icon {
  aspect-ratio: 1 / 1;
}

.btn__overlay {
  @include overlay;

  opacity: 0;
  background-color: currentcolor;
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
