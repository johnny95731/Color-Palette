<template>
  <VBtn
    ref="activatorRef"
    :class="[
      'select',
      isOpened && 'select--active',
    ]"
    :prepend-icon="prependIcon"
    :tooltip="tooltip"
    :aria-label="fieldState.ariaLabel_"
    :aria-labelledby="fieldState.ariaLabelledby_"
    :aria-controls="eager || isOpened ? menuId : undefined"
    :aria-expanded="isOpened"
    data-haspopup="true"
    @click="handleClickBtn"
    @focusout="handleClickBtn($event, false)"
    @keydown="handleKeyDown"
  >
    <template #default>
      {{ btnLabel }}
      <div class="field">
        <label
          v-if="fieldState.ariaLabel_"
          :for="fieldState.id_"
        >{{ fieldState.ariaLabel_ }}</label>
        <input
          :id="fieldState.id_"
          :aria-label="fieldState.ariaLabel_"
          :aria-labelledby="fieldState.ariaLabelledby_"
          type="text"
          inputmode="none"
          tabindex="-1"
          :value="model"
          @focus="activatorRef?.$el.focus();"
        >
      </div>
      <OverlayContainer
        :id="menuId"
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
      </OverlayContainer>
    </template>
    <template
      v-if="!hideTriangle"
      #append
    >
      <VIcon
        icon="caret-down-fill"
        class="triangle"
      />
    </template>
  </VBtn>
</template>

<script setup lang="ts">
import { watch, ref, onMounted, computed, nextTick, shallowRef, unref, onUnmounted } from 'vue';
import OverlayContainer from './OverlayContainer.vue';
import VBtn from './VBtn.vue';
import VIcon from './VIcon.vue';
// utils
import useInputField from '@/composables/useInputField';
import { isNullish, invertBoolean, getLetterCaseConverter } from '@/utils/helpers';
import { getComponentId } from '@/utils/browser';
import { mod } from '@/utils/numeric';
import { noModifierKey, shiftOnly } from '@/utils/browser';
// types
import type { CSSProperties, MaybeRefOrGetter, ModelRef } from 'vue';
import type { Props as VBtnProps } from './VBtn.vue';
import type { VueClass } from '@/utils/browser';
import { map } from '@johnny95731/color-utils';

type SelectItem = {
  val: string,
  name?: string,
  hotkey?: string
}

type Props = {
  isMobile?: boolean,
  eager?: boolean
  items?: readonly (string | SelectItem)[];
  inputId?: string,
  label?: string,
  text?: string,
  prependIcon?: string;
  tooltip?: VBtnProps['tooltip']
  hideTriangle?: boolean,
  hideValue?: boolean,
  contentClass?: VueClass,
  /**
   * Letter case for menu items (display name). Default to be start case.
   */
  letterCase?: 'origin' | 'start' | 'all-caps';
  fitActivator?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  eager: false,
  letterCase: 'start',
  fitActivator: true,
});

const emits = defineEmits<{
  /**
   * Only trigger when click items. Will not emit when `model-value` is changed
   * from other place.
   */
  triggered: [val: SelectItem['val']]
}>();

const activatorRef = ref<InstanceType<typeof VBtn>>();
const containerRef = ref<HTMLDivElement>();

const activator = computed<Element>(() => unref(activatorRef)?.$el);


// Handle form element
const { state_: fieldState, cleanup } = useInputField(props.label, 'select');
onUnmounted(cleanup);

const menuId = computed<string>(() => getComponentId('menu'));


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
const modelIndex = defineModel<number>('idx');

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

const handleSelect = (idx: number) => {
  modelIndex.value = idx;
  emits('triggered', unref(selectItems)[idx].val);
};
const btnLabel = computed<string | undefined>(() =>
  props.hideValue ?
    props.text :
    unref(selectItems)[unref(modelIndex)!].name
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
  onClick: () => void,
    }[]>([]);
watch(() => unref(selectItems).length, () => {
  optionProps.value = map(unref(selectItems), (_, i) => {
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
    width: props.fitActivator ? rect.width + 'px' : undefined,
    maxHeight: `${
      Math.min(
        document.documentElement.clientHeight - rect.bottom,
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
  const menu = unref(containerRef) as NonNullable<typeof containerRef.value>;
  if (// Avoid closing menu before triggering click event of options.
    e.type === 'focusout' &&
    // Focusout activator when click menu content
    menu?.contains(e.relatedTarget as Element | null)
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
