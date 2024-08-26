<template>
  <div
    class="switch-wrapper"
  >
    <input
      ref="inputRef"
      v-bind="labelState"
      :id="idForInput"
      type="checkbox"
      :value="value"
      :checked="isOn"
      v-model="isOn"
      @focus="switchRef?.focus();"
    >
    <div
      ref="switchRef"
      v-bind="labelState"
      class="switch-slider"
      tabindex="0"
      role="switch"
      :aria-checked="isOn"
      :value="value"
      @click="handleClick"
      @keydown="handleKeyDown"
    />
    <label
      v-if="labelState['aria-label']"
      :class="{
        'hide-label': hideLabel
      }"
      :for="idForInput"
      @click.prevent="handleClick();switchRef?.focus()"
    >{{ labelState['aria-label'] }}</label>
  </div>
</template>

<script setup lang="ts">
import {
  computed, onMounted, ref, watch,
} from 'vue';
import { getComponentId } from '@/utils/helpers';

type Props = {
  inputId?: string,
  label?: string,
  hideLabel?: boolean;

  value?: string;
}

const props = withDefaults(defineProps<Props>(), {
});

const inputRef = ref<HTMLInputElement>();
const switchRef = ref<HTMLDivElement>();


// Handle form element
/**
 * Create Id for input
 */
const idForInput = computed<string>(() =>
  props.inputId ?? getComponentId('slider')
);
/**
 * Aria label for <input /> and role="slider" tag.
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


// Handle values
const model = defineModel<boolean>();
const emit = defineEmits<{
  'click': [isOn: boolean]
}>();

const isOn = ref(model.value ?? false);
watch(
  () => model.value,
  () => {
    if (model.value && model.value !== isOn.value) {
      isOn.value = model.value;
    }
  }
);
function handleClick() {
  isOn.value = !isOn.value;
  emit('click', isOn.value);
}
function handleKeyDown(e: KeyboardEvent) {
  const key = e.key.toLowerCase();
  if (key === ' ') {
    isOn.value = !isOn.value;
    emit('click', isOn.value);
  }
}

</script>

<style src="./TheSwitch.scss" />
