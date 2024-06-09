<template>
  <!-- Float left -->
  <li>
    <button
      :class="$style.btn"
      type="button"
      @click="pltState.refreshCard(-1)"
    >
      <TheIcon type="refresh" />All
    </button>
  </li>
  <li>
    <DropdownMenu
      title="Sort"
      icon="sort"
      :class="$style.btnMenu"
      :contents="SORTING_ACTIONS"
      :current-val="pltState.sortBy"
      :hotkeys="SORTING_ACTIONS.map((str) => str[0])"
      @click-item="pltState.sortCards($event as SortActionType)"
    />
  </li>
  <li>
    <DropdownMenu
      title="Blend"
      icon="blend"
      :class="$style.btnMenu"
      :contents="BLEND_MODES"
      :current-val="pltState.blendMode"
      @click-item="pltState.setBlendMode($event as BlendingType)"
    />
  </li>
  <li>
    <DropdownMenu
      title="Space"
      icon="edit"
      :class="$style.btnMenu"
      letterCase="all-caps"
      :contents="COLOR_SPACES"
      :current-val="pltState.colorSpace"
      @click-item="pltState.setColorSpace($event as ColorSpacesType)"
    />
  </li>
  <li>
    <button
      :class="$style.btn"
      type="button"
      @click="haldleClickSlides"
    >
      <TheIcon :type="isRunning ? 'pause' : 'play'" />Slides
    </button>
  </li>

  <div class="spacer" />
  <!-- Float right -->
  <li>
    <button
      :class="$style.btn"
      type="button"
      @click="$emit('show-fav')"
    >
      <TheIcon type="bookmark" />Bookmarks
    </button>
  </li>
  <li>
    <button
      :class="$style.btn"
      type="button"
      @click="$emit('show-settings')"
    >
      <TheIcon type="setting" />Settings
    </button>
  </li>
</template>

<script setup lang='ts'>
import { ref, watch, computed, useCssModule } from 'vue';
import TheIcon from '../TheIcon.vue';
import DropdownMenu from '../Custom/DropdownMenu.vue';
// Stores / Contexts
import usePltStore from 'stores/usePltStore.ts';
import useSettingStore from 'stores/useSettingStore.ts';
import {
  COLOR_SPACES, BLEND_MODES, SORTING_ACTIONS,
} from '@/utils/constants';
// Types
import type { SortActionType } from 'types/pltType.ts';
import type { BlendingType, ColorSpacesType } from 'types/pltType.ts';

const $style = useCssModule();

defineEmits<{
  (e: 'show-fav'): void,
  (e: 'show-settings'): void
}>();
const pltState = usePltStore();
const settingState = useSettingStore();

// Slides
const isRunning = ref<boolean>(false);
const intervalId = ref<number | null>(null);

const delay = computed(() => Math.max(settingState.transition.color, 1000));
function intervalPlay() {
  intervalId.value = window.setInterval(() => {
    isRunning.value && pltState.refreshCard(-1);
  }, delay.value);
}
function haldleClickSlides() {
  if (isRunning.value) {
    if (intervalId.value !== null) window.clearInterval(intervalId.value);
    intervalId.value = null;
  } else {
    intervalPlay();
    pltState.refreshCard(-1);
  }
  isRunning.value = !isRunning.value;
  pltState.setIsPending(isRunning.value);
}
watch(
  () => settingState.transition.color,
  () => {
    if (!isRunning.value) return;
    if (intervalId.value !== null) window.clearInterval(intervalId.value);
    intervalPlay();
  },
);
</script>
<style lang="scss" src="./header.module.scss" module />
