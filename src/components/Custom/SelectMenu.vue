<template>
  <div
    v-bind="labelState"
    :class="[
      'select-menu activator',
      isOpened && 'active'
    ]"
    data-haspopup="true"
    :aria-controls="eager || isOpened ? idForMenu : undefined"
    :aria-expanded="isOpened"
    :title="valueLabel"
  >
    <TheBtn
      ref="activatorRef"
      :class="[
        titleClass
      ]"
      :text="valueLabel"
      @click="handleClickBtn"
      @focusout="handleClickBtn($event, false)"
      @keydown="handleKeyDown"
    >
      <template #append>
        <TheIcon
          type="caretDown"
          class="triangle"
          aria-hidden="true"
        />
      </template>
    </TheBtn>
    <div class="field">
      <label
        v-if="labelState['aria-label']"
        :for="idForInput"
      >{{ labelState['aria-label'] }}</label>
      <input
        v-bind="labelState"
        :id="idForInput"
        type="text"
        inputmode="none"
        tabindex="-1"
        :value="model"
        @focus="activatorRef?.$el.focus();"
      >
    </div>
    <OverlayContainer
      :id="idForMenu"
      hideScrim
      :eager="eager"
      aria-live="polite"
      :esc-event="false"
      v-model="isOpened"
    >
      <div
        ref="containerRef"
        :class="[
          'select-menu menu-container',
          isMobile && 'is-mobile',
          isOpened && 'active',
          contentClass
        ]"
        :style="menuStyle"
        aria-live="polite"
        :tabindex="-1"
        @click="handleClickBtn"
        @focusout="handleClickBtn($event, false)"
        @keydown="handleKeyDown"
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
            @click="handleSelect(i);"
          >
            {{
              val
            }}
          </button>
        </slot>
      </div>
      <OverlayContainer />
    </overlaycontainer>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted, computed, nextTick, shallowRef } from 'vue';
import { toValue } from '@vueuse/core';
import OverlayContainer from './OverlayContainer.vue';
import TheBtn from './TheBtn.vue';
import TheIcon from '../TheIcon.vue';
// utils
import { CURRENT_OPTION_WEIGHT } from '@/constants/browser';
import { isNullish, invertBoolean } from '@/utils/helpers';
import { getComponentId } from '@/utils/browser';
import { mod } from '@/utils/numeric';
import { noModifierKey, shiftOnly } from '@/utils/browser';
// types
import type { CSSProperties, MaybeRefOrGetter, ModelRef } from 'vue';

type Props = {
  isMobile?: boolean,
  eager?: boolean
  options: readonly string[],
  inputId?: string,
  listboxId?:string,
  label?: string,
  listboxLabel?: string,
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
  eager: true
});

const activatorRef = ref<InstanceType<typeof TheBtn>>();
const containerRef = ref<HTMLDivElement>();


/**
 * Index not exceed range of options.
 */
const idxInRange = (idx: number): boolean => idx >= 0 && idx < props.options.length;


// Handle form element
/**
 * Create Id for input
 */
const idForInput = computed<string>(() =>
  props.inputId ?? getComponentId('select')
);
const idForMenu = computed<string>(() =>
  props.listboxId ?? getComponentId('menu')
);
/**
 * Aria label for <input> tag and role="combobox".
 */
const labelState = computed(() => {
  if (!props.label) return {};
  return props.label?.startsWith('#') ? {
    'aria-labelledby': props.label.slice(1)
  } : {
    'aria-label': props.label
  };
});
onMounted(() => {
  if (!props.label?.startsWith('#')) return;
  const element = document.getElementById(props.label.slice(1)) as HTMLLabelElement | null;
  if (element) element.htmlFor = toValue(idForInput);
});
// Update label HTMLFor if it is an ID.
watch(() => [props.label, toValue(idForInput)], (newVal, oldVal) => {
  const isLabelSame = newVal[0] === oldVal[0];
  const isIdSame = newVal[1] === oldVal[1];
  if (!isLabelSame) {
    [oldVal[0], newVal[0]].forEach((label, i) => {
      if (label && label.startsWith('#')) {
        // Old props.label refer to an element. Remove HTMLFor attribute.
        // New props.label refer to an element. Add HTMLFor attribute.
        const element = document.getElementById(label.slice(1)) as HTMLLabelElement | null;
        if (element) {
          i === 0 ? element.removeAttribute('for') : element.htmlFor = newVal[1] as string;
        }
      }
    });
  }
  if (!isIdSame && newVal[0]?.startsWith('#')) {
    // Update HTMLFor for label if props.label refer to an element and input ID changed
    const element = document.getElementById(newVal[0].slice(1)) as HTMLLabelElement | null;
    if (element) element.htmlFor = newVal[1] as string;
  }
});

// Values events
const model = defineModel<string>(); // Higher priority than modelIndex.
const modelIndex = defineModel<number>('index');

defineEmits<{
  'update:modelValue': [val: string]
  'update:index': [idx: number],
}>();

// initialize
/**
 * Handle models when they are nullish.
 * @return {boolean} True if any model is nullish else false.
 */
const handleNullishModel = (
  value?: MaybeRefOrGetter<string>,
  index?: MaybeRefOrGetter<number>
) => {
  if (isNullish(value) && isNullish(index)) {
    model.value = props.options[0];
    modelIndex.value = 0;
  } else if (isNullish(value)) {
    model.value = props.options[toValue(index) as number];
  } else if (isNullish(index)) {
    modelIndex.value = props.options.indexOf(toValue(value) as string);
  } else return false;
  return true;
};

watch(
  () => [toValue(model), toValue(modelIndex)],
  (newVal, oldVal) => {
    // @ts-expect-error Initialize or injected models are removed.
    if (handleNullishModel(...newVal)) return;
    else if (newVal[0] !== oldVal![0]) { // model changed
      const idxOfModel = props.options.indexOf(toValue(model) as string);
      modelIndex.value = idxOfModel;
    } else if (idxInRange(newVal[1] as number)) { // modelIndex changed
      model.value = props.options[toValue(modelIndex) as number];
    } else {
      handleNullishModel(newVal[0] as string | undefined);
    }
  }, { immediate: true }
);

const valueLabel = computed(() =>
  props.showValue ? toValue(model) : (props.title ?? 'menu')
);

const handleSelect = (idx: number) => modelIndex.value = idx;

const liStyle = (idx: number) =>
  idx === toValue(modelIndex) ? CURRENT_OPTION_WEIGHT : undefined;

// Open/Closing events
const isOpened = defineModel<boolean>('show') as ModelRef<boolean>;

const menuStyle = shallowRef<CSSProperties>({});
const updateMenuStyle = () => {
  const rect = (toValue(activatorRef)?.$el as HTMLElement).getBoundingClientRect();
  menuStyle.value = {
    width: `${rect.width}px`,
    maxHeight: `${
      Math.min(
        document.documentElement.clientHeight - rect.bottom,
        120
      )
    }px`,
    top: props.isMobile ? 'var(--header-height)' : `${rect.bottom}px`,
    ...(props.isMobile ? {} : { left:`${rect.left}px` }),
  };
};
onMounted(() => {
  updateMenuStyle();
});

watch(isOpened, async (newVal) => {
  if (!newVal) return;
  updateMenuStyle();
  await nextTick(); // Waiting DOM updated.
  const target = toValue(containerRef)!.children[toValue(modelIndex)!];
  target.scrollIntoView(true);
});

const handleClickBtn = (e: MouseEvent | FocusEvent, newVal?: boolean) => {
  const activator = toValue(activatorRef) as NonNullable<typeof activatorRef.value>;
  const menu = toValue(containerRef) as NonNullable<typeof containerRef.value>;
  if (// Avoid changing `isOpened` twice
    e.type === 'focusout' &&
    ( // Focusout activator when click menu content
      menu.contains(e.relatedTarget as Element | null) ||
      // Foucusout menu content when click activator.
      e.relatedTarget === activator.$el
    )
  ) return;
  invertBoolean(isOpened, newVal);
};

const handleKeyDown = async (e: KeyboardEvent) => {
  const key = e.key;
  if (['Enter', ' '].includes(key)) {
    e.stopPropagation();
    e.preventDefault();
    invertBoolean(isOpened);
    await nextTick();
    // Cant get ref before updated (`menu` is undefined).
    (toValue(containerRef)?.children[0] as HTMLButtonElement).focus();
    return;
  }
  if (!toValue(isOpened)) {
    // Only some keys works when menu is not openned.
    if (key.startsWith('Arrow')) {
      invertBoolean(isOpened, true);
      await nextTick();
    } else return;
  }

  const activator = toValue(activatorRef)?.$el as HTMLButtonElement;
  const menu = toValue(containerRef) as typeof containerRef.value;
  // @ts-expect-error
  const nthChildFocused = menu && [...menu.children].indexOf(document.activeElement);
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
      target = activator;
    } else if (nthChildFocused === 0 && shiftOnly_) {
      // Focusing first menu option and Shift + Tab => close menu and focus
      // activator.
      invertBoolean(isOpened);
      target = activator;
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
    invertBoolean(isOpened, false);
    target = activator;
    break;
  }
  target?.focus();
};
</script>

<style src="./Menus.scss" />
