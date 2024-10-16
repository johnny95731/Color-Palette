<template>
  <DefineHeaderBtns>
    <!-- Left side -->
    <TheTooltip
      text="刷新"
    >
      <template #activator="{props}">
        <TheBtn
          v-bind="props"
          :class="$style.btn"
          prepend-icon="refresh"
          aria-label="刷新調色盤"
          @click="pltState.refreshCard(-1)"
        />
      </template>
    </TheTooltip>
    <TheTooltip
      :text="isRunning ? '暫停' : '播放'"
    >
      <template #activator="{props}">
        <TheBtn
          v-bind="props"
          :class="$style.btn"
          :prepend-icon="isRunning ? 'pause' : 'play'"
          :aria-label="isRunning ? '暫停' : '播放'"
          :text="isSmall ? 'Slides' : undefined"
          @click="haldleClickSlides"
        />
      </template>
    </TheTooltip>
    <DropdownMenu
      ref="sortingRef"
      prepend-icon="sort"
      :class="$style.btn"
      aria-label="排序"
      :contents="sortingMenuItems"
      :current-val="pltState.sortBy"
      @click-item="pltState.sortCards($event as SortActionType)"
    />
    <TheTooltip
      :activator="sortingRef"
      text="排序調色盤"
    />
    <DropdownMenu
      ref="mixingRef"
      prepend-icon="mix"
      :class="$style.btn"
      aria-label="混色"
      :contents="MIXING_MODES"
      :current-val="pltState.mixMode"
      @click-item="pltState.setBlendMode($event as MixingType)"
    />
    <TheTooltip
      :activator="mixingRef"
      text="設定混色方法"
    />
    <DropdownMenu
      ref="spacegRef"
      prepend-icon="edit"
      :class="$style.btn"
      aria-label="色彩空間"
      letterCase="all-caps"
      :contents="COLOR_SPACES"
      :current-val="pltState.colorSpace"
      @click-item="pltState.setColorSpace($event as ColorSpacesType)"
    />
    <TheTooltip
      :activator="spacegRef"
      text="設定色彩空間"
    />
    <div
      v-if="!isSmall"
      class="spacer"
    />
    <!-- Right side -->
    <TheBtn
      ref="harmonyGenRef"
      :class="$style.btn"
      prepend-icon="palette"
      @click="$emit('show-gen')"
    />
    <TheTooltip
      :activator="harmonyGenRef"
      text="調和調色盤"
    />
    <TheBtn
      ref="bookmarksRef"
      :class="$style.btn"
      prepend-icon="bookmarks"
      aria-label="書籤"
      aria-haspopup="dialog"
      @click="$emit('show-fav')"
    />
    <TheTooltip
      :activator="bookmarksRef"
      text="開啟書籤頁"
    />
    <TheBtn
      ref="settingsRef"
      :class="$style.btn"
      prepend-icon="setting"
      aria-label="設定"
      aria-haspopup="dialog"
      @click="$emit('show-settings')"
    />
    <TheTooltip
      :activator="settingsRef"
      text="開啟設定欄"
    />
    <!-- <TheBtn
      :class="$style.btn"
      prepend-icon="info"
      text="Settings"
      aria-label="額外資訊"
      aria-haspopup="dialog"
    /> -->
    <!-- Test nested Menus -->
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
    <!-- Test nested Menus -->
  </DefineHeaderBtns>

  <header
    ref="headerRef"
    :class="$style.header"
  >
    <h1 :class="$style.title">
      Color Palette
    </h1>
    <div
      v-if="!isSmall"
      :class="$style.menubar"
    >
      <HeaderBtns />
    </div>
    <DropdownMenu
      v-else
      :titleClass="$style.menubarTitle"
      :contentClass="$style.menubar"
      icon="list"
      :isMobile="true"
      hideTriangle
      aria-label="選單"
    >
      <template #items>
        <HeaderBtns />
      </template>
    </DropdownMenu>
  </header>
</template>

<script setup lang='ts'>
import { ref, computed, watch } from 'vue';
import { createReusableTemplate, toValue } from '@vueuse/core';
import $style from './TheHeader.module.scss';
import DropdownMenu from '../Custom/DropdownMenu.vue';
import TheTooltip from '../Custom/TheTooltip.vue';
import TheBtn from '@/components/Custom/TheBtn.vue';
// Utils
import { HOT_KEYS, sortingKey } from '@/utils/hotkeys';
import { invertBoolean } from '@/utils/helpers';
// Constants
import { MIXING_MODES } from '@/constants/mixing';
import { COLOR_SPACES, SORTING_ACTIONS } from '@/constants/colors';
// Stores / Contexts
import media from '@/composables/useMedia';
import usePltStore from '@/features/stores/usePltStore';
import useSettingStore from '@/features/stores/useSettingStore';
// Types
import type { ColorSpacesType, SortActionType } from 'types/colors';
import type { MixingType } from 'types/mixing';

// const btnsRef = ref<InstanceType<typeof HeaderBtns>>();
const [DefineHeaderBtns, HeaderBtns] = createReusableTemplate();

defineEmits<{
  (e: 'show-gen'): void,
  (e: 'show-fav'): void,
  (e: 'show-settings'): void
}>();

// Refs of btns and menus
const sortingRef = ref<InstanceType<typeof DropdownMenu>>();
const mixingRef = ref<InstanceType<typeof DropdownMenu>>();
const spacegRef = ref<InstanceType<typeof DropdownMenu>>();
const harmonyGenRef = ref<InstanceType<typeof TheBtn>>();
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

const isSmall = computed(() => media.isSmall);

const pltState = usePltStore();
const settingState = useSettingStore();

// Slides
const isRunning = ref<boolean>(false);
const intervalId = ref<number | null>(null);

const delay = computed(() => Math.max(settingState.transition.color, 1000));
function slidePlay() {
  intervalId.value = window.setInterval(
    () => toValue(isRunning) && pltState.refreshCard(-1),
    toValue(delay)
  );
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
