<template>
  <div
    v-bind="labelState"
    :class="[
      'select',
      isOpened && 'select--active'
    ]"
    data-haspopup="true"
    :aria-controls="eager || isOpened ? idForMenu : undefined"
    :aria-expanded="isOpened"
    :title="btnLabel"
  >
    <TheBtn
      ref="activatorRef"
      :class="[
        'select__activator',
        titleClass
      ]"
      :text="btnLabel"
      @click="handleClickBtn"
      @focusout="handleClickBtn($event, false)"
      @keydown="handleKeyDown"
    >
      <template #append>
        <TheIcon
          type="caret-down-fill"
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
        :value="model"
        @focus="activatorRef?.$el.focus();"
      >
    </div>
    <OverlayContainer
      :id="idForMenu"
      class="menu"
      type="menu"
      :content-class="[
        'select__content',
        isMobile && 'select__content--mobile',
        contentClass
      ]"
      :content-style="menuStyle"
      hideScrim
      :eager="eager"
      :esc-event="false"
      v-model="isOpened"
    >
      <div
        ref="containerRef"
        :class="[
          contentClass
        ]"
        aria-live="polite"
        :tabindex="-1"
        @click="handleClickBtn"
        @focusout="handleClickBtn($event, false)"
        @keydown="handleKeyDown"
      >
        <slot
          name="items"
          :props="optionProps"
        >
          <button
            v-memo="[modelIndex === i]"
            v-for="(item, i) in selectItems"
            :key="`Option ${item.val}`"
            v-bind="optionProps[i]"
            type="button"
          >
            {{ item.name }}
          </button>
        </slot>
      </div>
      <OverlayContainer />
    </overlaycontainer>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted, computed, nextTick, shallowRef, unref } from 'vue';
import OverlayContainer from './OverlayContainer.vue';
import TheBtn from './TheBtn.vue';
import TheIcon from './TheIcon.vue';
// utils
import { isNullish, invertBoolean, getLetterCaseConverter } from '@/utils/helpers';
import { getComponentId } from '@/utils/browser';
import { mod } from '@/utils/numeric';
import { noModifierKey, shiftOnly } from '@/utils/browser';
// types
import type { CSSProperties, MaybeRefOrGetter, ModelRef } from 'vue';
import type { VueClass } from 'types/browser';

type SelectItem = {
  val: string,
  name?: string,
}

type Props = {
  isMobile?: boolean,
  eager?: boolean
  items?: readonly (string | {
    name: string,
    val: string,
    hotkey?: string
  })[];
  inputId?: string,
  listboxId?:string,
  label?: string,
  listboxLabel?: string,
  title?: string,
  showValue?: boolean,
  titleClass?: VueClass,
  contentClass?: VueClass,
  /**
   * Letter case for menu items (display name). Default to be start case.
   */
  letterCase?: 'origin' | 'start' | 'all-caps';
}

const props = withDefaults(defineProps<Props>(), {
  showValue: true,
  eager: false,
  letterCase: 'start',
});

const activatorRef = ref<InstanceType<typeof TheBtn>>();
const containerRef = ref<HTMLDivElement>();

const activator = computed<Element>(() => unref(activatorRef)?.$el);


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
  if (element) element.htmlFor = unref(idForInput);
});
// Update label HTMLFor if it is an ID.
watch(() => [props.label, unref(idForInput)] as const, (newVal, oldVal) => {
  const isLabelSame = newVal[0] === oldVal[0];
  const isIdSame = newVal[1] === oldVal[1];
  if (!isLabelSame) {
    [oldVal[0], newVal[0]].forEach((label, i) => {
      if (label && label.startsWith('#')) {
        // Old props.label refer to an element. Remove HTMLFor attribute.
        // New props.label refer to an element. Add HTMLFor attribute.
        const element = document.getElementById(label.slice(1)) as HTMLLabelElement | null;
        if (element) {
          if (element) {
            if (i === 0)
              element.removeAttribute('for');
            else
              element.setAttribute('for', newVal[1]);
          }
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


const selectItems = computed(() => {
  const letterConverter = getLetterCaseConverter(props.letterCase);
  return props.items?.map((item) => {
    const { val, name }: SelectItem = typeof item === 'object' ? item : { val: item };
    return {
      val,
      name: letterConverter(name ?? val),
    };
  }) ?? [];
});

/**
 * Index not exceed range of options.
 */
const idxInRange = (idx: number): boolean =>
  idx >= 0 && idx < unref(selectItems).length;

// Values events
const model = defineModel<string>(); // Higher priority than modelIndex.
const modelIndex = defineModel<number>('index');

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
    model.value = unref(selectItems)[0].val;
    modelIndex.value = 0;
  } else if (isNullish(value)) {
    model.value = unref(selectItems)[unref(index) as number].val;
  } else if (isNullish(index)) {
    modelIndex.value = unref(selectItems).findIndex(
      ({ val }) => val === unref(value) as string
    );
  } else return false;
  return true;
};

const handleSelect = (idx: number) => modelIndex.value = idx;
const btnLabel = computed<string>(() =>
  props.showValue ?
    unref(selectItems)[unref(modelIndex)!].name :
    (props.title ?? 'select')
);

watch(
  () => [unref(model), unref(modelIndex)],
  (newVal, oldVal) => {
    // @ts-expect-error Initialize or injected models are removed.
    if (handleNullishModel(...newVal)) return;
    else if (newVal[0] !== oldVal![0]) { // model changed
      const idxOfModel = unref(selectItems).findIndex(
        ({ val }) => val === unref(newVal[0]) as string
      );
      modelIndex.value = idxOfModel;
    } else if (idxInRange(newVal[1] as number)) { // modelIndex changed
      model.value = unref(selectItems)[unref(modelIndex) as number].val;
    } else {
      handleNullishModel(newVal[0] as string | undefined);
    }
  }, { immediate: true }
);

// Option props
const optionProps = ref<{
  class: (string | false)[],
  onClick: () => number,
    }[]>([]);
watch(() => unref(selectItems).length, () => {
  optionProps.value = unref(selectItems).map((_, i) => {
    return {
      class: ['select__option', i === unref(modelIndex) && 'select__option--selected'],
      onClick: () => handleSelect(i)
    };
  });
}, { immediate: true });
watch(modelIndex, (newIdx, oldIdx) => {
  optionProps.value[oldIdx!].class = ['select__option'];
  optionProps.value[newIdx!].class = ['select__option', 'select__option--selected'];
});

// Open/Closing events
const isOpened = defineModel<boolean>('show') as ModelRef<boolean>;

const menuStyle = shallowRef<CSSProperties>({});
const updateMenuStyle = () => {
  const rect = (unref(activatorRef)?.$el as HTMLElement).getBoundingClientRect();
  menuStyle.value = {
    width: rect.width + 'px',
    maxHeight: `${
      Math.min(
        document.documentElement.clientHeight - rect.bottom,
        120
      )
    }px`,
    top: props.isMobile ? 'var(--header-height)' : rect.bottom + 'px',
    ...(props.isMobile ? {} : { left: rect.left + 'px' }),
  };
};
onMounted(() => {
  updateMenuStyle();
});

watch(isOpened, async (newVal) => {
  if (!newVal) return;
  updateMenuStyle();
  await nextTick(); // Waiting DOM updated.
  const target = unref(containerRef)!.children[unref(modelIndex)!];
  target.scrollIntoView(true);
});

const handleClickBtn = (e: MouseEvent | FocusEvent, newVal?: boolean) => {
  const activator = unref(activatorRef) as NonNullable<typeof activatorRef.value>;
  const menu = unref(containerRef) as NonNullable<typeof containerRef.value>;
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
  let target: Element | null | undefined = null;
  if (!unref(isOpened)) {
    // Only some keys works when menu is not openned.
    if (key.startsWith('Arrow') || key === 'Enter' || key === ' ') {
      e.stopPropagation();
      e.preventDefault();
      invertBoolean(isOpened);
      await nextTick();
      // Cant get ref before updated (`menu` is undefined).
      target = unref(containerRef)?.children[0];
    }
    else return;
  }
  // `undefined` is handled.
  const menu = unref(containerRef)!;
  // @ts-expect-error null still work (index -1)
  const nthChildFocused = [...menu.children].indexOf(document.activeElement);
  const focusingActivator = nthChildFocused === -1; // event triggered from activator.
  const noModifiers = noModifierKey(e);
  const shiftOnly_ = shiftOnly(e);

  switch(key) {
  case 'Tab':
    {
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
        target = unref(activator);
      }
      // (Shift+Tab)-event
      else if (shiftOnly_ && focusingActivator) {
        invertBoolean(isOpened);
      } else if (shiftOnly_ && !nthChildFocused) { // Focussing first option
        invertBoolean(isOpened);
        target = unref(activator);
        e.preventDefault();
      }
    }
    break;
  case 'Home':
    target = menu.children[0];
    break;
  case 'End':
    target = menu.lastElementChild;
    break;
  case 'ArrowLeft':
  case 'ArrowUp':
  case 'ArrowRight':
  case 'ArrowDown':
    if (focusingActivator) { // focusing activator
      target = ['U', 'L'].includes(key[5]) ? menu.lastElementChild : menu.firstElementChild;
    }
    else {
      const bias = ['U', 'L'].includes(key[5]) ? -1 : 1;
      target = menu.children[mod(nthChildFocused + bias, menu.children.length)];
    }
    break;
  case 'Escape':
    invertBoolean(isOpened, false);
    target = unref(activator);
    break;
  }
  if (target instanceof HTMLElement)
    target.focus();
};
</script>

<style src="./Menus.scss" />
