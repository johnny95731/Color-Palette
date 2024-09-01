<template>
  <!-- Left side -->
  <TheBtn
    :class="$style.btn"
    prepend-icon="refresh"
    aria-label="刷新調色盤"
    text="Refresh"
    @click="pltState.refreshCard(-1)"
  />
  <TheBtn
    v-memo="[isRunning]"
    :class="$style.btn"
    :prepend-icon="isRunning ? 'pause' : 'play'"
    :aria-label="isRunning ? '暫停' : '自動刷新'"
    text="Slides"
    @click="haldleClickSlides"
  />
  <DropdownMenu
    text="Sort"
    prepend-icon="sort"
    :class="$style.btn"
    :contents="sortingMenuItems"
    :current-val="pltState.sortBy"
    @click-item="pltState.sortCards($event as SortActionType)"
  />
  <DropdownMenu
    text="Blend"
    prepend-icon="blend"
    :class="$style.btn"
    :contents="BLEND_MODES"
    :current-val="pltState.blendMode"
    @click-item="pltState.setBlendMode($event as BlendingType)"
  />
  <DropdownMenu
    text="Space"
    prepend-icon="edit"
    :class="$style.btn"
    letterCase="all-caps"
    :contents="COLOR_SPACES"
    :current-val="pltState.colorSpace"
    @click-item="pltState.setColorSpace($event as ColorSpacesType)"
  />
  <div
    v-if="!isSmall"
    class="spacer"
  />
  <!-- Right side -->
  <TheBtn
    ref="bookmarksRef"
    :class="$style.btn"
    prepend-icon="bookmarks"
    text="Bookmarks"
    aria-label="書籤"
    aria-haspopup="dialog"
    @click="$emit('show-fav')"
  />
  <TheBtn
    ref="settingsRef"
    :class="$style.btn"
    prepend-icon="setting"
    text="Settings"
    aria-label="設定"
    aria-haspopup="dialog"
    @click="$emit('show-settings')"
  />
  <!-- <TheBtn
    :class="$style.btn"
    prepend-icon="info"
    text="Settings"
    aria-label="額外資訊"
    aria-haspopup="dialog"
  /> -->
  <!-- Test -->
  <!-- <DropdownMenu
    title="layer1"
    :contents="SORTING_ACTIONS"
  >
    <template #items>
      <button
        v-for="val in SORTING_ACTIONS"
        :key="val"
        type="button"
      >
        {{ val }}
      </button>
      <DropdownMenu
        title="layer2"
        :contents="SORTING_ACTIONS"
      >
        <template #items>
          <button
            v-for="val in SORTING_ACTIONS"
            :key="val"
            type="button"
          >
            {{ val }}
          </button>
          <DropdownMenu
            title="layer3"
            :contents="SORTING_ACTIONS"
          >
            <template #items>
              <button
                v-for="val in SORTING_ACTIONS"
                :key="val"
                type="button"
              >
                {{ val }}
              </button>
              <DropdownMenu
                title="layer4"
                :contents="SORTING_ACTIONS"
              />
              <button
                v-for="val in SORTING_ACTIONS"
                :key="val"
                type="button"
              >
                {{ val }}
              </button>
            </template>
          </DropdownMenu>
        </template>
      </DropdownMenu>
    </template>
  </DropdownMenu> -->
  <!-- Test -->
</template>

<script setup lang='ts'>
import { ref, watch, computed } from 'vue';
import { toValue } from '@vueuse/core';
import $style from './TheHeader.module.scss';
import DropdownMenu from '@/components/Custom/DropdownMenu.vue';
import TheBtn from '@/components/Custom/TheBtn.vue';
import { HOT_KEYS, sortingKey } from '@/utils/hotkeys';
import { invertBoolean } from '@/utils/helpers';
import {
  COLOR_SPACES, BLEND_MODES, SORTING_ACTIONS,
} from '@/utils/constants';
// Stores / Contexts
import usePltStore from 'stores/usePltStore.ts';
import useSettingStore from 'stores/useSettingStore.ts';
// Types
import type { SortActionType } from 'types/pltType.ts';
import type { BlendingType, ColorSpacesType } from 'types/pltType.ts';

const bookmarksRef = ref<InstanceType<typeof TheBtn>>();
const settingsRef = ref<InstanceType<typeof TheBtn>>();
defineExpose({
  focusBookmarks() {
    toValue(bookmarksRef)?.$el.focus();
  },
  focusSettings() {
    toValue(settingsRef)?.$el.focus();
  }
});

type Props = {
  isSmall: boolean,
}
defineProps<Props>();

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
function slidePlay() {
  intervalId.value = window.setInterval(
    () => toValue(isRunning) && pltState.refreshCard(-1),
    toValue(delay));
}
function haldleClickSlides() {
  if (toValue(isRunning)) { // play -> pause
    window.clearInterval(toValue(intervalId) as number | undefined);
    intervalId.value = null;
  } else { // pause -> play
    slidePlay();
    pltState.refreshCard(-1);
  }
  invertBoolean(isRunning);
  pltState.setIsPending(toValue(isRunning));
}
watch(
  () => settingState.transition.color,
  () => {
    if (toValue(isRunning)) {
      window.clearInterval(toValue(intervalId) as number | undefined);
      slidePlay();
    }
  },
);

const sortingMenuItems = SORTING_ACTIONS.map(val => ({
  val,
  name: val,
  hotkey: HOT_KEYS[sortingKey][val],
}));
</script>
