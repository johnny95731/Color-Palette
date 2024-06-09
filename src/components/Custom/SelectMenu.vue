<template>
  <div
    ref="containerRef"
    :class="styles.selectMenu"
    tabIndex="-1"
    @click="handleBtnClick"
    @blur="handleBtnClick($event, false)"
  >
    <button
      :class="[
        styles.menuTitle, titleClass
      ]"
      type="button"
      aria-haspopup="menu"
      :aria-expanded="isOpened || undefined"
    >
      <div>
        {{ modelValue ?? currentVal }}
      </div>
      <img
        :src="TriangleUrl"
        alt="clickable"
        :class="styles.triangle"
      >
    </button>
    <div
      ref="contentRef"
      :class="[
        props.isMobile ? styles.mobileContentWrapper : styles.contentWrapper,
        contentClass
      ]"
      @transitionend="handleContentChanged"
    >
      <menu :class="styles.menuContent">
        <slot
          name="items"
          :select="handleSelect"
          :liStyle="liStyle"
        >
          <li
            v-for="(val, i) in options"
            :key="`Option ${val}`"
            :style="liStyle(i)"
            @click="handleSelect(i);"
          >
            {{
              val
            }}
          </li>
        </slot>
      </menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCssModule, watch, ref, getCurrentInstance } from 'vue';
import TriangleUrl from '@/assets/icons/triangle-down.svg';
import { CURRENT_OPTION_WEIGHT } from '@/utils/constants';

const styles = useCssModule();
type Props = {
  isMobile?: boolean
  options: readonly string[];
  titleClass?: string;
  contentClass?: string;
}

const props = defineProps<Props>();
const thisInstance = getCurrentInstance();
const containerRef = ref<HTMLDivElement>();
const contentRef = ref<HTMLDivElement>();

// Open/Closing events
const isOpened = ref(false);
const handleBtnClick = (e: MouseEvent | FocusEvent, newVal?: boolean) => {
  if ( // Avoid closing menu when click child.
    e?.type === 'blur' &&
    // `e.relatedTarget !== null` can not deal the case that click another
    // foucusable element.
    (e.currentTarget as HTMLElement).contains(e.relatedTarget as Element | null)
  ) return;
  const container = containerRef.value as HTMLDivElement;
  const content = contentRef.value as HTMLElement;
  if (e?.type === 'click' && !content.contains(e.target as Node)) {
    e.stopPropagation();
  }
  newVal = newVal ?? !isOpened.value;
  const rect = container.getBoundingClientRect();
  content.style.maxHeight = (
    newVal ?
      `${document.body.clientHeight - rect.bottom}px` :
      '' // open => close
  );
  if (!newVal) {
    container.blur();
    (container.firstChild as HTMLElement).blur();
  }
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
  if (thisInstance?.vnode?.props?.select) emit('select', idx);
};

const liStyle = (idx: number) =>
  idx === currentIdx.value ? CURRENT_OPTION_WEIGHT : undefined;
</script>

<style src="./menu.module.scss" module />
