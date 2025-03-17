<template>
  <OverlayContainer
    ref="overlayRef"
    v-bind="overlayProps_"
    v-model="isOpened"
  >
    <header
      v-memo="[title]"
      class="dialog__header"
    >
      <h2 v-if="title">
        {{ title }}
      </h2>
      <div class="spacer" />
      <VBtn
        ref="closeBtnRef"
        icon="x-lg"
        aria-label="close"
        @click="isOpened = false"
      />
    </header>
    <div
      v-if="tabs"
      class="dialog__tabs"
    >
      <VBtn
        v-memo="[tabIdx]"
        v-for="(opt, i) in tabs"
        :key="`tab-${i}`"
        :ref="el => tabRefs[i] = el as InstanceType<typeof VBtn>"
        :class="[
          'dialog__tab',
          i === tabIdx && 'dialog__tab--selected'
        ]"
        :text="opt"
        @click="tabIdx = i"
      />
    </div>
    <slot name="content">
      <component
        ref="contentRef"
        :is="contentTag"
        :class="['dialog__content', contentClass]"
      >
        <slot />
      </component>
    </slot>
    <div
      v-if="$slots.actions"
      class="dialog__actions"
    >
      <slot name="actions" />
    </div>
  </OverlayContainer>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import OverlayContainer from '@/components/Custom/OverlayContainer.vue';
import VBtn from '@/components/Custom/VBtn.vue';
import { V_DIALOG_OVERLAY_PROPS } from '@/utils/browser';
import type { ModelRef } from 'vue';
import type { Props as OverlayProps } from '@/components/Custom/OverlayContainer.vue';
import type { VueClass } from '@/utils/browser';

type Props = {
  overlayProps?: Omit<OverlayProps, 'type'>
  title?: string,
  tabs?: readonly string[];
  contentTag?: string
  contentClass?: VueClass
}

const props = withDefaults(defineProps<Props>(), {
  contentTag: 'div'
});

const overlayProps_ = computed(() => {
  const contentClass = [
    'dialog',
    props.overlayProps?.contentClass
  ];
  return {
    ...V_DIALOG_OVERLAY_PROPS,
    ...props.overlayProps,
    contentClass
  };
});

const isOpened = defineModel<boolean>();

const overlayRef = ref<InstanceType<typeof OverlayContainer>>();
const contentRef = ref<HTMLElement>();

const tabRefs = ref<InstanceType<typeof VBtn>[]>([]);
const tabIdx = defineModel<number>('tabIdx') as ModelRef<number>;;
tabIdx.value ??= 0;

const closeBtnRef = ref<InstanceType<typeof VBtn>>();

watch(isOpened, async (newVal) => {
  await nextTick();
  if (newVal) {
    (closeBtnRef.value?.$el as HTMLButtonElement).focus();
  }
});

defineExpose({
  tabRefs,
  overlayContentRef: computed(() => overlayRef.value?.contentRef),
  contentRef,
});
</script>

<style lang="scss">
@use "@/assets/variables.scss" as *;

.dialog {
  $root: &;

  overflow: hidden;
  display: flex;
  flex-direction: column;

  border-radius: $radius-lg;

  background-color: $color1;


  &__header {
    display: flex;
    flex: 0 0;
    align-items: center;

    width: 100%;

    background-color: $color5;

    >h2 {
      user-select: none;

      margin: 0;
      padding: 8px 12px;

      font-size: $font-lg;
      font-weight: $font-weight-bold;
      color: $color2;
      text-align: center;
    }

    .btn {
      padding: 4px;
      color: #fff;
    }
  }

  &__tabs {
    display: inline-flex;
    flex: 0 0;
    width: 100%;
    background-color: $color5;
  }


  &__tab {
    padding: 4px 8px;
    border-radius: $radius-sm $radius-sm 0 0;

    font-size: $font-sm;
    font-weight: $font-weight-medium;
    color: white;

    background-color: $color4;

    &--selected {
      font-weight: $font-weight-bold;
      color: $color5;
      background-color: $color1;
    }
  }

  &__content {
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: stretch;

    width: 100%;
    height: 100%;
    padding: 8px 4px;
  }

  &__actions {
    display: flex;
    flex: 0 0;
    gap: 4px;
    align-items: center;
    justify-content: flex-end;

    width: 100%;
    height: 100%;
    padding: 0 12px 12px;

    background-color: $color2;

    > button, > a {
      padding: 3px 12px;
      border-radius: $radius-md;
      font-weight: $font-weight-medium;
    }
  }
}
</style>
