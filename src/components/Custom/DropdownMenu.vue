<template>
  <div
    ref="containerRef"
    :class="[
      styles.dropdownMenu,
      isOpened && 'active'
    ]"
    tabindex="-1"
    @click="handleBtnClick"
    @focusout="handleBtnClick($event, false)"
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
        <TheIcon
          v-if="icon"
          :type="icon" 
        />
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <img
        v-if="!hideTriangle"
        :src="TriangleUrl"
        alt="clickable"
        :class="styles.triangle"
      >
    </button>
    <div
      ref="contentRef"
      :class="[
        isMobile ? styles.mobileContentWrapper : styles.contentWrapper,
        contentClass
      ]"
      @transitionend="handleContentChanged"
    >
      <menu
        :class="styles.menuContent"
      >
        <slot name="items">
          <li
            v-for="(item) in menuItems"
            :key="item.val"
            :style="item.style"
            @click="$emit('click-item', item.val)"
          >
            {{ item.name }}
          </li>
        </slot>
      </menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, useCssModule, withDefaults } from 'vue';
import TheIcon from '../TheIcon.vue';
import { capitalize } from '@/utils/helpers.ts';
import TriangleUrl from '@/assets/icons/triangle-down.svg';
// Types
import type { IconType } from '../TheIcon.vue';
import { CURRENT_OPTION_WEIGHT } from '@/utils/constants';

const styles = useCssModule();
type Props = {
  isMobile?: boolean;
  title?: string,
  icon?: IconType;
  contents?: readonly string[] | {
    name: string,
    val: string,
  }[];
  titleClass?: string;
  contentClass?: string;
  currentVal?: string;
  hideTriangle?: boolean;
  /**
   * Letter case for menu items (display name). Default to be title case.
   */
  letterCase?: 'origin' | 'title' | 'all-caps';
}
const props = withDefaults(defineProps<Props>(), {
  letterCase: 'title',
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
  const height = (
    newVal ?
      `${document.body.clientHeight - rect.bottom}px` : // open
      '' // close
  );
  content.style.maxHeight = height;
  (content.lastChild as HTMLElement).style.maxHeight = height;
  if (!newVal) {
    (container.firstChild as HTMLElement).blur();
  }
  isOpened.value = newVal;
};

defineEmits<{
  'click-item': [val: string]
}>();

const handleContentChanged = () => { // called after transition end.
  if (props.isMobile) return;
  const content = contentRef.value as HTMLDivElement;
  if (!content) return;
  const menu = content.lastElementChild as HTMLMenuElement;
  const rect = content.getBoundingClientRect();
  const height = isOpened.value ? `${rect.height}px` : '';
  content.style.maxHeight = height;
  menu.style.height = height;
  menu.style.maxHeight = height;
};


const menuItems = computed(() => {
  /**
   * Convert letter case.
   */
  let converter = (x: string) => x; // origin
  if (props.letterCase === 'all-caps') {
    converter = (str: string) => str.toUpperCase();
  } else if (props.letterCase === 'title') converter = capitalize;

  return props.contents ? 
    typeof props.contents[0] === 'string' ?
      (props.contents as string[]).map((val) => ({
        val,
        name: converter(val),
        style: val === props.currentVal ? CURRENT_OPTION_WEIGHT : undefined,
      })) :
      (props.contents as {name: string; val: string;}[])
        .map(({ name, val }) => ({
          val,
          name,
          style: val === props.currentVal ? CURRENT_OPTION_WEIGHT : undefined,
        })) :
    [];
});
</script>

<style src="./menu.module.scss" module />
