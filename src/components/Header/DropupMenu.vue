<template>
  <span :class="className"
    tabindex="-1"
    @click="showPopupMenu($event)"
    @blur="showPopupMenu($event)"
  >
    <div class="menuTitle">
      <TheIcon :type="icon" />
        <slot name="title" />
      <img :src="TriangleUrl" alt="clickable" class="triangle" />
    </div>
    <div class="menuContent">
      <div v-for="item in menuItems" :key="item.val"
        :style="item.style"
        @click="itemClick ? itemClick(item.val) : undefined"
      >
        {{ item.name }}
      </div>
    </div>
  </span>
</template>

<script lang="ts" setup>
import {computed, toRef, withDefaults, defineProps} from 'vue';
import TheIcon from '../TheIcon.vue';
import {showPopupMenu, capitalize} from '@/utils/helpers.ts';
import TriangleUrl from '@/assets/icons/triangle-down.svg';
// Types
import type {IconType} from '../TheIcon.vue';

type Props = {
  icon: IconType;
  contents: readonly string[];
  currentVal: string;
  class?: string;
  hotkeys?: string[];
  itemClick?: (val: any) => any;
  /**
   * Letter case for menu items (display name). Default to be title case.
   */
  letterCase?: 'origin' | 'title' | 'all-caps';
}

const props = withDefaults(defineProps<Props>(), {
  letterCase: 'title',
});
const {icon, contents, class: class_, letterCase} = props;
const currentVal = toRef(props, 'currentVal');

const menuItems = computed(() => {
  /**
   * Convert letter case.
   */
  let converter = (x: string) => x; // origin
  if (letterCase === 'all-caps') {
    converter = (str: string) => str.toUpperCase();
  } else if (letterCase === 'title') converter = capitalize;
  return Array.from(contents, (val) => ({
    val,
    name: converter(val),
    style: val === currentVal.value ? {fontWeight: '800'}: undefined,
  }));
});
const className = computed(
    () => `${class_ ? class_ : ''} popupMenu`,
);

</script>

<style src="./DropupMenu.scss"></style>
