<template>
  <div
    v-bind="labelState"
    :class="[
      'select-menu',
      isOpened && 'active'
    ]"
    role="combobox"
    aria-haspopup="listbox"
    :aria-controls="idForMenu"
    :aria-expanded="isOpened"
  >
    <TheBtn
      ref="activatorRef"
      :class="[
        titleClass
      ]"
      type="button"
      :text="showValue ? (modelValue ?? currentVal) : (title ?? 'menu')"
      @click="handleBtnClick"
      @focusout="handleBtnClick($event, false)"
      @keydown="handleKeyDown"
    >
      <template #append>
        <TheIcon
          type="caretDown"
          class="triangle"
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
        :value="currentVal"
        @focus="activatorRef?.$el.focus();"
      >
    </div>
    <Teleport to="#overlay-container">
      <div
        v-if="eager || isOpened"
        v-bind="listboxLabelState"
        ref="contentRef"
        :id="idForMenu"
        :class="[
          isMobile ? 'mobile-menu-content-wrapper' : 'menu-content-wrapper',
          isOpened && 'active',
          contentClass
        ]"
        role="listbox"
        :aria-expanded="isOpened"
        aria-live="polite"
        :tabindex="-1"
        @click="handleBtnClick"
        @focusout="handleBtnClick($event, false)"
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
            role="option"
            :tabindex="isOpened ? 0 : -1"
            @click="handleSelect(i);"
          >
            {{
              val
            }}
          </button>
        </slot>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted, onUnmounted, computed } from 'vue';
import TheBtn from './TheBtn.vue';
import TheIcon from '../TheIcon.vue';
import { CURRENT_OPTION_WEIGHT } from '@/utils/constants';
import { componentUniqueId, removeComponentId } from '@/utils/helpers';

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
const contentRef = ref<HTMLDivElement>();

// Handle form element
/**
 * Create Id for input
 */
const idForInput = computed<string>(() =>
  props.inputId ?? componentUniqueId('select')
);
const idForMenu = computed<string>(() =>
  props.listboxId ?? componentUniqueId('menu')
);
onUnmounted(() => {
  removeComponentId(idForInput.value, 'select');
  removeComponentId(idForMenu.value, 'menu');
});
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
/**
 * Aria label for role="listbox" tag.
 */
const listboxLabelState = computed(() => {
  return props.listboxLabel ?
    props.listboxLabel?.startsWith('#') ?
      { 'aria-labelledby': props.listboxLabel.slice(1) } :
      { 'aria-label': props.listboxLabel } :
    labelState.value;
});
onMounted(() => {
  if (!props.label?.startsWith('#')) return;
  const element = document.getElementById(props.label.slice(1)) as HTMLLabelElement | null;
  if (element) element.htmlFor = idForInput.value;
});
// Update label HTMLFor if it is an ID.
watch(() => [props.label, idForInput.value], (newVal, oldVal) => {
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
  if (!isIdSame && newVal[0] && newVal[0].startsWith('#')) {
    // Update HTMLFor for label if props.label refer to an element and input ID changed
    const element = document.getElementById(newVal[0].slice(1)) as HTMLLabelElement | null;
    if (element) element.htmlFor = newVal[1] as string;
  }
});

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
  menu.style.maxHeight = '160px';
  // menu.style.height = `${100}px`;
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
  const menu = contentRef.value as NonNullable<typeof contentRef.value>;
  // @ts-expect-error
  const nthChildFocused = [...menu.children].indexOf(document.activeElement) as number;
  switch(key) {
  case 'Tab':
    if (nthChildFocused > 0) {
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
