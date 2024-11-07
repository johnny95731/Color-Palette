<template>
  <TheBtn
    ref="activatorRef"
    :class="[
      'dropdown-menu',
      isOpened && 'dropdown-menu--active'
    ]"
    :prepend-icon="icon ? undefined : prependIcon"
    :aria-controls="eager || isOpened ? idForMenu : undefined"
    :data-haspopup="true"
    @click="handleClickBtn"
    @keydown="handleKeyDown"
  >
    <template #default>
      <TheIcon
        v-if="icon"
        :type="icon"
        class="triangle"
        aria-hidden="true"
      />
      <template v-else>
        {{ text }}
      </template>
      <OverlayContainer
        :id="idForMenu"
        class="menu"
        type="menu"
        :content-class="[
          'dropdown-menu__content',
          isMobile && 'dropdown-menu__content--mobile',
          contentClass
        ]"
        :content-style="menuContainerStyle"
        hide-scrim
        :eager="eager"
        transition="slide-y"
        :esc-event="false"
        v-model="isOpened"
        @resize="nestedClosing"
      >
        <div
          ref="contentRef"
          :tabindex="-1"
          @keydown="handleKeyDown"
        >
          <slot
            name="items"
          >
            <button
              v-for="item in menuItems"
              :key="item.val"
              :class="[
                'dropdown-menu__option',
                item.val === props.currentVal && 'dropdown-menu__option--selected'
              ]"
              type="button"
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
</template>

<script lang="ts" setup>
import { computed, ref, watch, provide, inject, nextTick, unref } from 'vue';
import OverlayContainer from './OverlayContainer.vue';
import TheBtn from './TheBtn.vue';
import TheIcon from './TheIcon.vue';
// utils
import { sleep, invertBoolean, getLetterCaseConverter } from '@/utils/helpers';
import { getComponentId } from '@/utils/browser';
import { mod } from '@/utils/numeric';
import { noModifierKey, shiftOnly, hasPopup } from '@/utils/browser';
import { useElementBounding } from '@/composables/useElementBounding';
// constants
import { menuSymbol } from '@/constants/browser';
// Types
import type { CSSProperties, ModelRef } from 'vue';
import type { IconType } from '@/utils/icons';
import type { VueClass } from 'types/browser';

type MenuItem = {
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
  items?: readonly (string | {
    name: string,
    val: string,
    hotkey?: string
  })[];
  activatorId?:string,
  menuId?:string,
  contentClass?: VueClass,
  currentVal?: string,
  hideTriangle?: boolean,
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

const activator = computed(() => unref(activatorRef)?.$el!);

/**
 * Target is containing in this instance.
 */
const isContaining = (target?: Element | EventTarget | null): boolean =>
  !!(
    unref(activator).contains(target as Node | null) ||
    unref(contentRef)?.contains(target as Node | null)
  );

/**
 * Return menu content's direct children element that contains target.
 * If target is not in menu
 */
const getDirectChildren = (target?: Element | EventTarget | null) => {
  if (
    !unref(contentRef) ||
    !unref(contentRef)!.contains(target as Element) ||
    unref(contentRef) === target
  ) return null;
  let children = target as Element;
  while (children.parentElement !== unref(contentRef))
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

const menuItems = computed(() => {
  const letterConverter = getLetterCaseConverter(props.letterCase);
  return props.items?.map((item) => {
    const { val, name, hotkey }: MenuItem = typeof item === 'object' ? item : { val: item };
    return {
      val,
      name: letterConverter(name ?? val) + (hotkey ? ` (${hotkey})` : ''),
    };
  }) ?? [];
});

// Open/Closing events
const isOpened = defineModel<boolean>('show') as ModelRef<boolean>;
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
const parent = inject<MenuProvided | null>(menuSymbol, null);
provide<MenuProvided>(menuSymbol, {
  topActivator() {
    return parent?.topActivator() ?? unref(activator) as HTMLButtonElement;
  },
  topNonLastActivator,
  isLast(target: Element | null) {
    const menu = unref(contentRef)!;
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
  return !parent || !parent.isLast(unref(activator)) ?
    unref(activator) :
    parent.topNonLastActivator();
}

/**
 * Closing nested menus until `target` in this menu.
 */
async function nestedClosing (target?: Element | EventTarget | null) {
  // `handleClick` may be trigger from multi-layers. Make sure that
  // menu is closing from innermost layer.
  if (
    !unref(openedChild) &&
    (
      !target ||
      (
        unref(contentRef) &&
        !unref(contentRef)!.contains(target as Element)
      )
    )
  ) {
    invertBoolean(isOpened, false);
    await sleep(250);
    await nextTick();
    parent?.nestedClosing(target);
  }
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

const resizeCallback = () => nestedClosing();
watch(isOpened, (newVal) => {
  if (!newVal) {
    parent?.unregister();
    removeEventListener('click', handleClickWindow, true);
    removeEventListener('resize', resizeCallback, true);
  } else {
    parent?.register();
    addEventListener('click', handleClickWindow, true);
    removeEventListener('resize', resizeCallback, true);
  }
});

const handleClickWindow = (e: MouseEvent) => {
  // Click outside
  if (!isContaining(e.target)) nestedClosing(e.target);
  // Click content that is not a activator of submenu.
  else if (
    unref(contentRef) !== e.target && // not content itself
    unref(contentRef)?.contains(e.target as Node | null) &&
    !hasPopup(getDirectChildren(e.target))
  ) {
    nestedClosing();
  }
  // return false;
};

// When menu is nested, the parent should not close before submenu is closing.
const handleClickBtn = () => {
  !unref(openedChild) && invertBoolean(isOpened);
};


const handleKeyDown = async (e: KeyboardEvent) => {
  // Ignore supermenu keydown event when submenu is opening.
  if (unref(openedChild)) return;
  const key = e.key;
  let target: Element | null = null;
  if (!unref(isOpened)) {
    // Only some keys works when menu is not openned.
    if (key.startsWith('Arrow') || key === 'Enter' || key === ' ') {
      e.stopPropagation();
      e.preventDefault();
      handleClickBtn();
      await nextTick();
      // Cant get ref before updated (`menu` is undefined).
      target = unref(contentRef)?.children[0]!;
    }
    else return;
  }
  // `undefined` is handled.
  const menu = unref(contentRef)!;
  // @ts-expect-error null still work (index -1)
  const nthChildFocused = [...menu.children].indexOf(document.activeElement);
  const focusingActivator = nthChildFocused === -1; // event triggered from activator.
  const noModifiers = noModifierKey(e);
  const shiftOnly_ = shiftOnly(e);

  switch(key) {
  case 'Tab':
    // const focusingActivator = unref(activator).contains(document.activeElement);
    // Tab-event
    if (noModifiers && focusingActivator) {
      target = menu.children[0];
      e.preventDefault();
    } else if (
      noModifiers &&
        nthChildFocused + 1 === menu?.children.length // Focussing last option
    ) {
      // Set focus to activator and default Tab-event =>
      // focus next focusable element of activator.
      target = topNonLastActivator();
      nestedClosing(target);
    }
    // (Shift+Tab)-event
    else if (shiftOnly_ && focusingActivator) {
      handleClickBtn();
    } else if (shiftOnly_ && !nthChildFocused) { // Focussing first option
      handleClickBtn();
      target = unref(activator);
      e.preventDefault();
    }
    break;
  case 'Home':
    target = menu.firstElementChild;
    break;
  case 'End':
    target = menu.lastElementChild;
    break;
  case 'ArrowLeft':
  case 'ArrowUp':
  case 'ArrowRight':
  case 'ArrowDown':
    if (focusingActivator) {
      target = ['U', 'L'].includes(key[5]) ? menu.lastElementChild : menu.firstElementChild;
    }
    else {
      const bias = ['U', 'L'].includes(key[5]) ? -1 : 1;
      target = menu.children[mod(nthChildFocused + bias, menu.children.length)];
    }
    break;
  case 'Escape':
    target = unref(activator);
    nestedClosing(target);
    e.stopPropagation();
    break;
  }
  // @ts-expect-error Check is instanceof HTMLElement
  target?.focus && target.focus();
};
</script>

<style src="./Menus.scss" />
