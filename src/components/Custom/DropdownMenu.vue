<template>
  <TheBtn
    ref="activatorRef"
    :class="[
      'dropdown-menu',
      isOpened && 'active',
      titleClass
    ]"
    type="button"
    :prepend-icon="icon"
    aria-haspopup="menu"
    :aria-controls="idForMenu"
    :aria-expanded="isOpened || undefined"
    :text="title"
    @click="handleBtnClick"
    @focusout="handleBtnClick($event, false)"
    @keydown="handleKeyDown"
  >
    <template
      #append
    >
      <TheIcon
        v-if="!hideTriangle"
        type="caretDown"
        class="triangle"
      />
      <Teleport to="#overlay-container">
        <div
          ref="contentRef"
          :id="idForMenu"
          :class="[
            isMobile ? 'mobile-menu-content-wrapper' : 'menu-content-wrapper',
            isOpened && 'active',
            contentClass
          ]"
          role="menu"
          :aria-expanded="isOpened"
          aria-live="polite"
          :tabindex="-1"
          @click="handleBtnClick"
          @focusout="handleBtnClick($event, false)"
          @keydown="handleKeyDown"
        >
          <slot
            name="items"
            items="menuItems"
          >
            <button
              v-for="(item) in menuItems"
              :key="item.val"
              :style="item.style"
              type="button"
              role="menuitem"
              :tabindex="isOpened ? 0 : -1"
              @click="$emit('click-item', item.val)"
            >
              <slot :name="`item.${item.val}`">
                {{ item.name }}
              </slot>
            </button>
          </slot>
        </div>
      </Teleport>
    </template>
  </TheBtn>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch, onUnmounted } from 'vue';
import TheBtn from './TheBtn.vue';
import TheIcon from '../TheIcon.vue';
import { capitalize, componentUniqueId, removeComponentId } from '@/utils/helpers.ts';
import { CURRENT_OPTION_WEIGHT } from '@/utils/constants';
// Types
import type { IconType } from '@/utils/icons';

type Props = {
  isMobile?: boolean;
  title?: string,
  icon?: IconType;
  contents?: readonly string[] | {
    name: string,
    val: string,
  }[];
  menuId?:string,
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
const activatorRef = ref<InstanceType<typeof TheBtn>>();
const contentRef = ref<HTMLDivElement>();

/**
 * Create Id for menu content
 */
const idForMenu = computed<string>(() =>
  props.menuId ?? componentUniqueId('menu')
);
onUnmounted(() => {
  removeComponentId(idForMenu.value, 'menu');
});


defineEmits<{
  'click-item': [val: string]
}>();

const letterConverter = computed(() => {
  /**
   * Convert letter case.
   */
  let converter = (x: string) => x; // origin
  if (props.letterCase === 'all-caps') {
    converter = (str: string) => str.toUpperCase();
  } else if (props.letterCase === 'title') converter = capitalize;
  return converter;
});

const menuItems = computed(() => {
  return props.contents ?
    typeof props.contents[0] === 'string' ?
      (props.contents as string[]).map((val) => ({
        val,
        name: letterConverter.value(val),
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

// Open/Closing events
const isOpened = ref(false);

onMounted(() => {
  const activator = activatorRef.value as NonNullable<typeof activatorRef.value>;
  const menu = contentRef.value as NonNullable<typeof contentRef.value>;
  menu.style.minWidth = window.getComputedStyle(activator.$el).width;
});

watch(isOpened, (newVal) => {
  if (!newVal) return;
  const activator = activatorRef.value as NonNullable<typeof activatorRef.value>;
  const menu = contentRef.value as NonNullable<typeof contentRef.value>;
  const rect = activator.$el.getBoundingClientRect();
  menu.style.top = `${rect.bottom}px`;
  menu.style.left = `${rect.left}px`;
});

const handleBtnClick = (e: MouseEvent | FocusEvent, newVal?: boolean) => {
  const activator = activatorRef.value as NonNullable<typeof activatorRef.value>;
  const menu = contentRef.value as NonNullable<typeof contentRef.value>;
  if (// Avoid changing `isOpened` twice
    e.type === 'focusout' &&
    ( // Focusout activator when click menu content
      menu.contains(e.relatedTarget as Element | null) ||
      // Foucusout menu content when click activator.
      e.relatedTarget === activator.$el
    )
  ) return;
  isOpened.value = newVal ?? !isOpened.value;
};

const handleKeyDown = (e: KeyboardEvent) => {
  const key = e.key;
  const activator = activatorRef.value as NonNullable<typeof activatorRef.value>;
  const menu = contentRef.value as HTMLDivElement;
  // @ts-expect-error
  const nthChildFocused = [...menu.children].indexOf(document.activeElement) as number;
  console.log(nthChildFocused);
  switch(key) {
  case 'Tab':
    if (nthChildFocused === menu.children.length - 1) {
      activator.$el.focus();
      isOpened.value = false;
    } else if (nthChildFocused === 0 && e.shiftKey) {
      activator.$el.focus();
      isOpened.value = false;
      e.preventDefault();
    } else if (nthChildFocused === -1 && isOpened.value && !e.shiftKey) {
      // focusing activator && openning menu && not shift+tab
      menu.focus(); // with default tab event => focus first menu option.
    }
    break;
  case 'Home':
    (menu.children[0] as HTMLButtonElement).focus();
    break;
  case 'End':
    (menu.lastElementChild as HTMLButtonElement).focus();
    break;
  case 'ArrowRight':
  case 'ArrowLeft':
    if (nthChildFocused === -1) { // focusing activator
      key.endsWith('Left') ?
        (menu.lastElementChild as HTMLButtonElement).focus() :
        (menu.children[0] as HTMLButtonElement).focus();
    } else {
      const bias = key.endsWith('Left') ? menu.children.length - 1 : 1;
      const sibIdx = (nthChildFocused + bias) % menu.children.length as number;
      (menu.children[sibIdx] as HTMLButtonElement).focus();
    }
    break;
  }
  e.stopPropagation();
};
</script>

<style src="./Menus.scss" />
