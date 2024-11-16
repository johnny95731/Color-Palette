<template>
  <DefineHeaderBtns v-slot="{ css }">
    <!-- Left side -->
    <TheTooltip
      text="刷新"
    >
      <template #activator="{props}">
        <TheBtn
          v-bind="props"
          :class="[
            css,
            $style.btn
          ]"
          prepend-icon="arrow-clockwise"
          aria-label="刷新調色盤"
          :text="isSmall ? '刷新' : undefined"
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
          :class="[
            css,
            $style.btn
          ]"
          :prepend-icon="isRunning ? 'pause-fill' : 'play'"
          :aria-label="isRunning ? '暫停' : '播放'"
          :text="isSmall ? isRunning ? '暫停' : '播放' : undefined"
          @click="haldleClickSlides"
        />
      </template>
    </TheTooltip>
    <DropdownMenu
      ref="sortingRef"
      prepend-icon="sort-down"
      :class="[
        css,
        $style.btn
      ]"
      aria-label="排序"
      :text="isSmall ? '排序' : undefined"
      :items="sortingMenuItems"
      :current-val="pltState.sortBy"
      @click-item="pltState.sortCards($event as SortActionType)"
    />
    <TheTooltip
      :activator="sortingRef"
      text="排序"
    />
    <DropdownMenu
      ref="mixingRef"
      prepend-icon="file-earmark-plus"
      :class="[
        css,
        $style.btn
      ]"
      aria-label="混色"
      :text="isSmall ? '混色' : undefined"
      :items="MIXING_MODES"
      :current-val="pltState.mixMode"
      @click-item="pltState.setBlendMode($event as MixingType)"
    />
    <TheTooltip
      :activator="mixingRef"
      text="混色方法"
    />
    <DropdownMenu
      ref="spacegRef"
      prepend-icon="sliders"
      :class="[
        css,
        $style.btn
      ]"
      aria-label="色彩空間"
      :text="isSmall ? '色彩空間' : undefined"
      letter-case="all-caps"
      :items="COLOR_SPACES"
      :current-val="pltState.colorSpace"
      @click-item="pltState.setColorSpace($event as ColorSpacesType)"
    />
    <TheTooltip
      :activator="spacegRef"
      text="色彩空間"
    />
    <div
      v-if="!isSmall"
      class="spacer"
    />
    <!-- Right side -->
    <TheBtn
      ref="harmonyGenRef"
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="palette"
      aria-label="調和調色盤"
      :text="isSmall ? '調和調色盤' : undefined"
      @click="$emit('show-gen')"
    />
    <TheTooltip
      :activator="harmonyGenRef"
      text="調和調色盤"
    />
    <TheBtn
      ref="bookmarksRef"
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="bookmarks"
      aria-label="書籤"
      :text="isSmall ? '書籤' : undefined"
      aria-haspopup="dialog"
      @click="$emit('show-fav')"
    />
    <TheTooltip
      :activator="bookmarksRef"
      text="書籤頁"
    />
    <TheBtn
      ref="settingsRef"
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="gear"
      aria-label="設定"
      :text="isSmall ? '設定' : undefined"
      aria-haspopup="dialog"
      @click="$emit('show-settings')"
    />
    <TheTooltip
      :activator="settingsRef"
      text="設定欄"
    />
    <!-- <TheBtn
      :class="$style.btn"
      prepend-icon="info-circle"
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
      :class="$style.menubarTitle"
      :contentClass="$style.menubar"
      icon="list"
      :isMobile="true"
      hideTriangle
      aria-label="選單"
    >
      <template #items>
        <HeaderBtns css="dropdown-menu__option" />
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
import { HOT_KEYS } from '@/constants/hotkeys';
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
const [DefineHeaderBtns, HeaderBtns] = createReusableTemplate<{css?: string}>();

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
  hotkey: HOT_KEYS.sorting_[val],
}));
</script>
