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
        :value="current.val"
        @focus="activatorRef?.$el.focus();"
      >
    </div>
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
import { watch, ref, onMounted, computed, nextTick, shallowRef, shallowReactive } from 'vue';
import OverlayContainer from './OverlayContainer.vue';
import TheBtn from './TheBtn.vue';
import TheIcon from '../TheIcon.vue';
// utils
import { CURRENT_OPTION_WEIGHT } from '@/utils/constants';
import { getComponentId } from '@/utils/helpers';
import { mod } from '@/utils/numeric';
import { noModifierKey, shiftOnly } from '@/utils/eventHandler.ts';
// types
import type { CSSProperties } from 'vue';

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
const model = defineModel<string>(); // Higher priority than modelIndex.
const modelIndex = defineModel<number>('index');

defineEmits<{
  'update:modelValue': [val: string]
  'update:index': [idx: number],
}>();

/**
 * Index not exceed range of options.
 */
const idxInRange = (idx: number): boolean => idx >= 0 && idx < props.options.length;

const current = shallowReactive<{
  val: string,
  idx: number,
}>((() => {
  // @ts-expect-error
  const idxOfModel = props.options.indexOf(model.value);
  const modelIndexInRange = modelIndex.value && idxInRange(modelIndex.value);
  const output =
    idxOfModel !== -1 ? { // model.value is a option value
      val: model.value as string,
      idx: idxOfModel,
    } :
      modelIndexInRange ?
        {
          val: props.options[modelIndex.value as number],
          idx: modelIndex.value as number,
        } :
        { // default
          val: props.options[0],
          idx: 0,
        };
  model.value = output.val;
  modelIndex.value = output.idx;
  return output;
})());
const valueLabel = computed(() =>
  props.showValue ? current.val : (props.title ?? 'menu')
);
// Handle prop `value` changed.
watch(
  () => [model.value, modelIndex.value],
  (newVal, oldVal) => {
    if (newVal.every((val, i) => val === oldVal[i])) return;
    if (model.value && model.value !== current.val) { // model changed
      const idxOfModel = props.options.indexOf(model.value);
      Object.assign(current, {
        val: model.value,
        idx: idxOfModel,
      });
      modelIndex.value = idxOfModel;
    } else if ( // modelIndex changed
      modelIndex.value && modelIndex.value !== current.idx &&
      idxInRange(modelIndex.value)
    ) {
      Object.assign(current, {
        val: props.options[modelIndex.value],
        idx: modelIndex.value,
      });
      model.value = props.options[modelIndex.value];
    }
  }
);

const handleSelect = (idx: number) => {
  const newVal = props.options[idx];
  Object.assign(current, {
    val: newVal,
    idx: idx,
  });
  model.value = newVal;
  modelIndex.value = idx;
};

const liStyle = (idx: number) =>
  idx === current.idx ? CURRENT_OPTION_WEIGHT : undefined;

// Open/Closing events
const isOpened = ref(false);

const menuStyle = shallowRef<CSSProperties>({});
const updateMenuStyle = () => {
  const rect = (activatorRef.value?.$el as HTMLElement).getBoundingClientRect();
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

watch(isOpened, (newVal) => {
  if (!newVal) return;
  updateMenuStyle();
});

const handleClickBtn = (e: MouseEvent | FocusEvent, newVal?: boolean) => {
  const activator = activatorRef.value as NonNullable<typeof activatorRef.value>;
  const menu = containerRef.value as NonNullable<typeof containerRef.value>;
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

const handleKeyDown = async (e: KeyboardEvent) => {
  const key = e.key;
  if (['Enter', ' '].includes(key)) {
    e.stopPropagation();
    e.preventDefault();
    isOpened.value = !isOpened.value;
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

  const activator = activatorRef.value?.$el as HTMLButtonElement;
  const menu = containerRef.value as typeof containerRef.value;
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
      isOpened.value = !isOpened.value;
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
    isOpened.value = false;
    target = activator;
    break;
  }
  target?.focus();
};
</script>

<style src="./Menus.scss" />
