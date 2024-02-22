<template>
<span :class="containerClass"
  tabIndex="-1"
  @click="showPopupMenu"
  @blur="showPopupMenu"
>
  <div :class="$style.menuTitle">{{
    currentVal
  }}<img :src="TriangleUrl" alt="clickable" :class="$style.triangle" />
  </div>
  <ul :class="$style.menuContent">
    <li v-for="(val) in options" :key="`Option ${val}`"
      @click="handleSelect(val)"
      :style="val === currentVal ? CURRENT_OPTION_WEIGHT : undefined"
    >{{
      val
    }}</li>
  </ul>
</span>
</template>

<script setup lang="ts">
import {useCssModule, watch, ref} from 'vue';
import TriangleUrl from '@/assets/icons/triangle-down.svg';
import {CURRENT_OPTION_WEIGHT} from '@/utils/constants';
import {showPopupMenu} from '@/utils/helpers';

type Props = {
  options: readonly string[];
  defaultValue?: string;
  value?: string;
  contentClass?: string;
  className?: string;
  onSelect?: (val: string) => any;
}

const props = defineProps<Props>();
const $style = useCssModule();

const currentVal = ref(
  props.defaultValue ?
    props.defaultValue :
    (props.value ? props.value : props.options[0]),
);
// Handle prop `value` changed.
watch(() => props.value, () => {
  if (
    props.value &&
    props.value !== currentVal.value &&
    props.options.includes(props.value)
  ) {
    currentVal.value = props.value;
  }
});

const handleSelect = (val: string) => {
  if (props.onSelect) props.onSelect(val);
  currentVal.value = val;
};

const containerClass = (
  props.className ?
    `${props.className} ${$style.selectMenu}` :
    $style.selectMenu
);
</script>

<style src="./DropupMenu.scss" module scoped />
