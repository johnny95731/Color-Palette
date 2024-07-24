<template>
  <div
    ref="containerRef"
    :class="[
      styles.selectMenu,
      isOpened && styles.active
    ]"
    tabIndex="-1"
    @click="handleBtnClick"
    @focusout="handleBtnClick($event, false)"
  >
    <TheBtn
      :class="[
        styles.menuTitle, titleClass
      ]"
      type="button"
      aria-haspopup="menu"
      :aria-expanded="isOpened || undefined"
      :label="showValue ? (modelValue ?? currentVal) : (title ?? 'menu')"
      @keydown="handleKeyPress"
    >
      <template #append>
        <TheIcon
          type="caretDown"
          :class="styles.triangle"
        />
      </template>
    </TheBtn>
    <div
      ref="contentRef"
      :class="[
        props.isMobile ? styles.mobileContentWrapper : styles.contentWrapper,
        contentClass
      ]"
      @transitionend="handleContentChanged"
    >
      <div
        :class="styles.menuContent"
        :tabindex="-1"
        @keydown="handleMenuKeyPress"
      >
        <slot
          name="items"
          :select="handleSelect"
          :liStyle="liStyle"
        >
          <button
            v-for="(val, i) in options"
            :key="`Option ${val}`"
            :style="liStyle(i)"
            type="button"
            :tabindex="isOpened ? 0 : -1"
            @click="handleSelect(i);"
          >
            {{
              val
            }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCssModule, watch, ref } from 'vue';
import TheBtn from './TheBtn.vue';
import TheIcon from '../TheIcon.vue';
import { CURRENT_OPTION_WEIGHT } from '@/utils/constants';

const styles = useCssModule();
type Props = {
  isMobile?: boolean,
  options: readonly string[],
  title?: string,
  showValue?: boolean,
  titleClass?: string,
  contentClass?: string,
  /**
   * Letter case for menu items (display name). Default to be title case.
   */
  letterCase?: 'origin' | 'title' | 'all-caps';
}

const props = withDefaults(defineProps<Props>(), {
  showValue: true,
});
const containerRef = ref<HTMLDivElement>();
const contentRef = ref<HTMLDivElement>();

// Open/Closing events
const isOpened = ref(false);
const handleBtnClick = (e: MouseEvent | FocusEvent, newVal?: boolean) => {
  if ( // Avoid closing menu when click child.
    e.type === 'focusout' &&
    // `e.relatedTarget !== null` can not deal the case that click another
    // foucusable element.
    (e.currentTarget as HTMLElement).contains(e.relatedTarget as Element | null)
  ) return;
  const container = containerRef.value as HTMLDivElement;
  const content = contentRef.value as HTMLElement;
  if (e.type === 'click' && !content.contains(e.target as Node)) {
    e.stopPropagation();
  }
  newVal = newVal ?? !isOpened.value;
  const rect = container.getBoundingClientRect();
  content.style.maxHeight = (
    newVal ?
      `${document.body.clientHeight - rect.bottom}px` : // open
      '' // close
  );
  isOpened.value = newVal;
};

const handleContentChanged = () => { // called after transition end.
  const content = contentRef.value as HTMLDivElement;
  if (!content) return;
  const rect = content.getBoundingClientRect();
  const height = isOpened.value ? `${rect.height}px` : '';
  content.style.maxHeight = height;
  content.style.height = height;
};

// Values events
const model = defineModel<string>();
const emit = defineEmits<{
  'select': [idx: number],
  'update:model-value': [val: string]
}>();

const currentVal = ref(
  model.value ?? props.options[0],
);
const currentIdx = ref<number>(props.options.indexOf(currentVal.value));
// Handle prop `value` changed.
watch(
  () => model.value,
  () => {
    if (model.value && model.value !== currentVal.value) {
      currentVal.value = model.value;
      currentIdx.value = props.options.indexOf(model.value);
    }
  }
);

const handleSelect = (idx: number) => {
  const newVal = props.options[idx];
  currentVal.value = newVal;
  currentIdx.value = idx;
  model.value = newVal;
  emit('update:model-value', newVal);
  emit('select', idx);
};

const liStyle = (idx: number) =>
  idx === currentIdx.value ? CURRENT_OPTION_WEIGHT : undefined;

const handleKeyPress = (e: KeyboardEvent) => {
  const key = e.key;
  const menu = contentRef.value?.firstElementChild as HTMLDivElement;
  let target: HTMLButtonElement | null = null;
  switch(key) {
  case 'Tab':
    e.preventDefault();
  // eslint-disable-next-line
  case 'Home':
  case 'ArrowRight':
    target = menu.firstElementChild as HTMLButtonElement;
    break;
  case 'End':
  case 'ArrowLeft':
    target = menu.lastElementChild as HTMLButtonElement;
    break;
  }
  target?.focus();
  e.stopPropagation();
};

const handleMenuKeyPress = (e: KeyboardEvent) => {
  const key = e.key;
  const menu = contentRef.value?.firstElementChild as HTMLDivElement;
  switch(key) {
  case 'Home':
    (menu.firstElementChild as HTMLButtonElement).focus();
    break;
  case 'End':
    (menu.lastElementChild as HTMLButtonElement).focus();
    break;
  case 'ArrowRight':
  case 'ArrowLeft':
    {
      const bias = key.endsWith('Left') ? menu.children.length - 1 : 1;
      // @ts-expect-error
      const nthChildFocused = [...menu.children].indexOf(document.activeElement) as number;
      const sibIdx = (
        (nthChildFocused === -1 ? 0 : nthChildFocused) + bias
      ) % menu.children.length as number;
      (menu.children[sibIdx] as HTMLButtonElement).focus();
    }
    break;
  }
  e.stopPropagation();
};
</script>

<style src="./menu.module.scss" module />
