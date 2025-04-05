<template>
  <component
    :is="href ? 'a' : 'button'"
    :type="href ? undefined : type"
    :class="[
      'btn',
      icon && 'btn--icon',
      ripple && 'ripple',
      disabled && 'btn--disabled',
    ]"
    :aria-label="ariaLabel"
    :href="href"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    :disabled="href ? undefined : disabled"
  >
    <VTooltip
      v-if="tooltip"
      v-bind="tooltip_"
      activator="parent"
    />
    <div
      v-if="variant !== 'flat'"
      class="btn__overlay"
    />
    <div
      v-if="$slots.prepend || prependIcon"
      class="btn__prepend"
    >
      <slot name="prepend">
        <VIcon
          v-if="prependIcon"
          :icon="prependIcon"
        />
      </slot>
    </div>
    <div
      v-if="$slots.default || icon || text"
      class="btn__content"
    >
      <slot>
        <VIcon
          v-if="icon"
          :icon="icon"
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
        <VIcon
          v-if="appendIcon"
          :icon="appendIcon"
        />
      </slot>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VIcon from '@/components/Custom/VIcon.vue';
import VTooltip from './VTooltip.vue';
import type { Props as TooltipProps } from './VTooltip.vue';

export type Props = {
  type?: 'button' | 'submit' | 'reset',
  text?: string,
  ariaLabel?: string,
  tooltip?: string | boolean | Exclude<TooltipProps, 'activator'>,
  variant?: 'std' | 'flat',
  icon?: string,
  prependIcon?: string,
  href?: string,
  appendIcon?: string,
  ripple?: boolean,
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'std',
  ripple: true,
});

const tooltip_ = computed(() => {
  if (!props.tooltip) return {};
  else if (typeof props.tooltip === 'string' || props.tooltip === true) {
    return {
      location: 'bottom',
      text: props.tooltip === true ? props.ariaLabel ?? props.text : props.tooltip
    } satisfies TooltipProps;
  } else {
    return props.tooltip;
  }
});
</script>

<style lang="scss">
@use "@/assets/variables.scss" as *;

$trans-duration: 120ms;

.btn {
  $root: &;

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
    > #{$root}__overlay {
      opacity: var(--overlay-hover-opacity);
    }
  }

  @supports not selector(:focus-visible) {
    &:focus {
      #{$root} > #{$root}__overlay{
        opacity: var(--overlay-hover-opacity);
      }
    }
  }

  &--disabled {
    cursor: not-allowed;

    > #{$root}__overlay {
      opacity: var(--overlay-hover-opacity);
    }
  }
}

.btn--icon {
  aspect-ratio: 1 / 1;
  border-radius: $radius-rounded;
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
