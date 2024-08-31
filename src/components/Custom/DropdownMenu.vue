<template>
  <TheBtn
    ref="activatorRef"
    :class="[
      'dropdown-menu activator',
      isOpened && 'active',
      titleClass
    ]"
    :prepend-icon="icon ? undefined : prependIcon"
    :icon="icon"
    :aria-controls="eager || isOpened ? idForMenu : undefined"
    :data-haspopup="true"
    v-bind="$attrs"
    :text="text"
    @click="handleClickBtn"
    @keydown="handleKeyDown"
  >
    <template
      v-if="!hideTriangle"
      #append
    >
      <TheIcon
        type="caretDown"
        class="triangle"
        aria-hidden="true"
      />
    </template>
  </TheBtn>
  <OverlayContainer
    :id="idForMenu"
    hideScrim
    :eager="eager"
    aria-live="polite"
    v-model="isOpened"
  >
    <div
      ref="containerRef"
      :class="[
        'dropdown-menu menu-container',
        isMobile && 'is-mobile',
        isOpened && 'active',
        contentClass
      ]"
      :tabindex="-1"
      :style="menuContainerStyle"
      @keydown="handleKeyDown"
    >
      <slot
        name="items"
        items="menuItems"
      >
        <button
          v-for="item in menuItems"
          :key="item.val"
          :style="item.val === props.currentVal ? currentStyle : undefined"
          type="button"
          role="menuitem"
          @click="$emit('click-item', item.val)"
        >
          <slot
            :name="`item.${item.val}`"
            :label="item.name"
          >
            {{ item.name }}
          </slot>
        </button>
      </slot>
    </div>
  </OverlayContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch, provide, inject, nextTick } from 'vue';
import OverlayContainer from './OverlayContainer.vue';
import TheBtn from './TheBtn.vue';
import TheIcon from '../TheIcon.vue';
// utils
import { toTitleCase, getComponentId, sleep } from '@/utils/helpers.ts';
import { mod } from '@/utils/numeric';
import { noModifierKey, shiftOnly, hasPopup } from '@/utils/eventHandler.ts';
import { CURRENT_OPTION_WEIGHT, MenuSymbol } from '@/utils/constants';
import { useElementBounding } from '@/utils/composables/useElementBounding';
// Types
import type { CSSProperties } from 'vue';
import type { IconType } from '@/utils/icons';

type Item = {
    val: string,
    name?: string,
    hotkey?: string
  }

type Props = {
  isMobile?: boolean,
  eager?: boolean,
  text?: string,
  /**
   * prepend icon
   */
  prependIcon?: IconType;
  /**
   * Icon only activator
   */
  icon?: IconType;
  contents?: readonly (string | {
    name: string,
    val: string,
    hotkey?: string
  })[];
  activatorId?:string,
  menuId?:string,
  titleClass?: string,
  contentClass?: string,
  currentVal?: string,
  /**
   * Style of currently selected element.
   */
  currentStyle?: CSSProperties,
  hideTriangle?: boolean,
  /**
   * Letter case for menu items (display name). Default to be title case.
   */
  letterCase?: 'origin' | 'title' | 'all-caps';
}
const props = withDefaults(defineProps<Props>(), {
  letterCase: 'title',
  // @ts-expect-error
  currentStyle: CURRENT_OPTION_WEIGHT,
});
const activatorRef = ref<InstanceType<typeof TheBtn>>();
const containerRef = ref<HTMLDivElement>();

const activator = computed<HTMLButtonElement>(() => activatorRef.value?.$el);

/**
 * Target is containing in this instance.
 */
const isContaining = (target?: Element | EventTarget | null): boolean =>
  !!(
    activator.value.contains(target as Node | null) ||
    containerRef.value?.contains(target as Node | null)
  );

/**
 * Return menu content's direct children element that contains target.
 * If target is not in menu
 */
const getDirectChildren = (target?: Element | EventTarget | null) => {
  if (
    !containerRef.value ||
    !containerRef.value.contains(target as Element) ||
    containerRef.value === target
  ) return null;
  let children = target as Element;
  while (children.parentElement !== containerRef.value)
    children = children.parentElement as HTMLElement;
  return children;
};

/**
 * Create Id for menu container
 */
const idForMenu = computed<string>(() =>
  props.menuId ?? getComponentId('menu')
);

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
  } else if (props.letterCase === 'title') converter = toTitleCase;
  return converter;
});

const menuItems = computed(() =>
  props.contents.map((item) => {
    const { val, name, hotkey }: Item = typeof item === 'object' ? item : { val: item };
    return {
      val,
      name: letterConverter.value(name ?? val) + (hotkey ? ` (${hotkey})` : ''),
    };
  })
);

// Open/Closing events
const isOpened = ref(false);
const openedChild = ref(0);

type MenuProvided = {
  /**
   * The most top activator that is not the last element of a menu.
   */
  topActivator: () => HTMLElement,
  /**
   * The most top activator that is not the last element of a menu.
   */
  topNonLastActivator: () => HTMLElement,
  /**
   * Check target is the last option of menu.
   */
  isLast: (target: Element) => boolean | undefined,
  /**
   * A submenu is opened.
   */
  register: () => void,
  /**
   * A submenu is closed.
   */
  unregister: () => void,
  nestedClosing: (target?: Element | EventTarget | null) => void,
}
const parent = inject<MenuProvided | null>(MenuSymbol, null);
provide<MenuProvided>(MenuSymbol, {
  topActivator() {
    return parent?.topActivator() ?? activator.value as HTMLButtonElement;
  },
  topNonLastActivator,
  isLast(target: Element | null) {
    const menu = containerRef.value as NonNullable<typeof containerRef.value>;
    return menu.children[menu.children.length-1] === target;
  },
  register() {
    openedChild.value++;
  },
  unregister() {
    openedChild.value--;
  },
  nestedClosing
});

/**
 * The topmost layer activator that is not the last element of a menu.
 */
function topNonLastActivator() {
  return !parent || !parent.isLast(activator.value) ?
    activator.value :
    parent.topNonLastActivator();
}

/**
 * Closing nested menus until `target` in this menu.
 */
async function nestedClosing (target?: Element | EventTarget | null) {
  // `handleClick` may be trigger from multi-layers. Make sure that
  // menu is closing from bottommost layer.
  if (openedChild.value) return;
  if (
    !target ||
    // @ts-expect-error Function only be called when menu is openned.
    !containerRef.value.contains(target as Element) //
  ) {
    isOpened.value = false;
    await sleep(100);
    await nextTick();
    parent?.nestedClosing(target);
  } else
    !hasPopup(getDirectChildren(target)) && nestedClosing();

}

const { rect: activatorRect } = useElementBounding(activator);
const menuContainerStyle = computed<CSSProperties>(() => {
  return {
    minWidth: `${activatorRect.width}px`,
    ...(
      props.isMobile ?
        { top: 'var(--header-height)' } :
        { top: `${activatorRect.bottom}px`, left: `${activatorRect.left}px` }
    ),
  };
});

watch(isOpened, (newVal) => {
  if (!newVal) {
    parent?.unregister();
    document.removeEventListener('click', handleClick);
  } else {
    parent?.register();
    document.addEventListener('click', handleClick);
  }
});

const handleClick = (e: MouseEvent) => {
  // Click outside
  if (!isContaining(e.target)) nestedClosing(e.target);
  // Click submenu activator
  else if (
    // @ts-expect-error
    containerRef.value?.contains(e.target) && !hasPopup(getDirectChildren(e.target))
  ) handleClickBtn();
};

const handleClickBtn = () =>
  // when submenu is openned, the event will handle by `handleClick`
  !openedChild.value && (isOpened.value = !isOpened.value);

const handleKeyDown = async (e: KeyboardEvent) => {
  // Ignore supermenu keydown event when submenu is opening.
  if (openedChild.value) return;
  const key = e.key;
  if (['Enter', ' '].includes(key)) {
    e.stopPropagation();
    e.preventDefault();
    handleClickBtn();
    await nextTick();
    // Cant get ref before updated (`menu` is undefined).
    (containerRef.value?.children[0] as HTMLButtonElement).focus();
    return;
  }
  if (!isOpened.value) {
    // Only some keys works when menu is not openned.
    if (key.startsWith('Arrow')) {
      isOpened.value = true;
      await nextTick();
    } else return;
  }

  const menu = containerRef.value as typeof containerRef.value;
  // @ts-expect-error
  const nthChildFocused = [...menu.children].indexOf(document.activeElement);
  const noModifiers = noModifierKey(e);
  const shiftOnly_ = shiftOnly(e);

  let target: HTMLElement | null = null;
  switch(key) {
  case 'Tab':
    if (
      !menu  || nthChildFocused === -1 // Focusing activator
    ) {
      if (noModifiers) { // Tab
        // @ts-expect-error
        target = menu.children[0];
        e.preventDefault();
      } else if (shiftOnly_) // Shift + Tab
        isOpened.value = false;
    } else if (nthChildFocused === menu.children.length - 1 && noModifiers) {
      // Focusing last menu option and Tab => close menu and focus next
      // focusable element of activator.
      target = topNonLastActivator() ?? activator.value;
      nestedClosing(target);
    } else if (nthChildFocused === 0 && shiftOnly_) {
      // Focusing first menu option and Shift + Tab => close menu and focus
      // activator.
      handleClickBtn();
      target = activator.value;
      e.preventDefault();
    }
    break;
  case 'Home':
    // @ts-expect-error
    target = menu.children[0];
    break;
  case 'End':
    // @ts-expect-error
    target = menu.lastElementChild;
    break;
  case 'ArrowLeft':
  case 'ArrowUp':
  case 'ArrowRight':
  case 'ArrowDown':
    e.preventDefault();
    if (nthChildFocused === -1) { // focusing activator
      // @ts-expect-error
      target = ['U', 'L'].includes(key[5]) ? menu.lastElementChild : menu.children[0];
    }
    else {
      const bias = ['U', 'L'].includes(key[5]) ? -1 : 1;
      // @ts-expect-error
      target = menu.children[mod(nthChildFocused + bias, menu.children.length)];
    }
    break;
  case 'Escape':
    isOpened.value = false;
    target = activator.value;
    break;
  }
  target?.focus();
};
</script>

<style src="./Menus.scss" />
