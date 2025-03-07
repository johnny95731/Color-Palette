<template>
  <DefineHeaderBtns v-slot="{ css }">
    <!-- Left side -->
    <TheBtn
      v-memo="[isSmall]"
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="arrow-clockwise"
      aria-label="刷新調色盤"
      :text="isSmall ? '刷新' : undefined"
      :tooltip="isSmall ? false : true"
      @click="pltState.refreshCard_(-1)"
    />
    <TheBtn
      v-memo="[isSmall, isRunning]"
      :class="[
        css,
        $style.btn
      ]"
      :prepend-icon="isRunning ? 'pause-fill' : 'play'"
      :aria-label="isRunning ? '暫停' : '播放'"
      :text="isSmall ? isRunning ? '暫停' : '播放' : undefined"
      :tooltip="isSmall ? false : true"
      @click="haldleClickSlides"
    />
    <DropdownMenu
      v-memo="[isSmall, pltState.sortBy_]"
      prepend-icon="sort-down"
      :class="[
        css,
        $style.btn
      ]"
      aria-label="排序"
      :text="isSmall ? '排序' : undefined"
      :tooltip="true"
      :items="sortingMenuItems"
      :current-val="pltState.sortBy_"
      @click-item="pltState.sortCards_($event as SortActions)"
    />
    <DropdownMenu
      v-memo="[isSmall, pltState.mixMode_]"
      prepend-icon="file-earmark-plus"
      :class="[
        css,
        $style.btn
      ]"
      aria-label="混色"
      :text="isSmall ? '混色' : undefined"
      :tooltip="isSmall ? false : true"
      :items="MIXING_MODES"
      :current-val="pltState.mixMode_"
      @click-item="pltState.setBlendMode_($event as Mixing)"
    />
    <DropdownMenu
      v-memo="[isSmall, pltState.colorSpace_]"
      prepend-icon="sliders"
      :class="[
        css,
        $style.btn
      ]"
      aria-label="色彩空間"
      :text="isSmall ? '色彩空間' : undefined"
      :tooltip="isSmall ? false : true"
      letter-case="all-caps"
      :items="COLOR_SPACES"
      :current-val="pltState.colorSpace_"
      @click-item="pltState.setColorSpace_($event as ColorSpaces)"
    />
    <div
      v-if="!isSmall"
      class="spacer"
    />
    <!-- Right side -->
    <TheBtn
      v-memo="[isSmall]"
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="upload"
      aria-label=""
      :text="isSmall ? '調和調色盤' : undefined"
      :tooltip="isSmall ? false : true"
    />

    <TheBtn
      v-memo="[isSmall]"
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="palette"
      aria-label="調和調色盤"
      :text="isSmall ? '調和調色盤' : undefined"
      :tooltip="isSmall ? false : true"
      @click="handleShowGen"
    />
    <HarmonyGenDialog
      v-if="isInitGen || isGenShowing"
      v-model="isGenShowing"
    />

    <TheBtn
      v-memo="[isSmall]"
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="bookmarks"
      aria-label="書籤"
      :text="isSmall ? '書籤' : undefined"
      :tooltip="isSmall ? false : true"
      @click="handleShowFav"
    />
    <TheBookmarks
      v-if="isInitFav || isFavShowing"
      v-model="isFavShowing"
    />

    <TheBtn
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="gear"
      aria-label="設定"
      :text="isSmall ? '設定' : undefined"
      :tooltip="isSmall ? false : true"
      @click="handleShowSetting"
    />
    <SettingDialog
      v-if="isInitSetting || isSettingShowing"
      v-model="isSettingShowing"
    />

    <TheBtn
      ref="githubRef"
      :class="[
        css,
        $style.btn
      ]"
      href="https://github.com/johnny95731/Color-Palette"
      prepend-icon="github"
      aria-label="GitHub連結"
      :text="isSmall ? 'GitHub連結' : undefined"
      :tooltip="isSmall ? false : true"
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
import { ref, computed, watch, defineAsyncComponent } from 'vue';
import { createReusableTemplate, toValue } from '@vueuse/core';
import $style from './TheHeader.module.scss';
import DropdownMenu from '../Custom/DropdownMenu.vue';
import TheBtn from '@/components/Custom/TheBtn.vue';
// Utils
import { HOTKEYS } from '@/constants/hotkeys';
import { invertBoolean, map } from '@/utils/helpers';
// Constants
import { MIXING_MODES } from '@/constants/mixing';
import { COLOR_SPACES, SORTING_ACTIONS } from '@/constants/colors';
// Stores / Contexts
import media from '@/composables/useMedia';
import usePltStore from '@/features/stores/usePltStore';
import useSettingStore from '@/features/stores/useSettingStore';
// Types
import type { ColorSpaces, SortActions } from 'types/colors';
import type { Mixing } from 'types/mixing';


const HarmonyGenDialog = defineAsyncComponent(
  () => import('@/components/HarmonyGenDialog/HarmonyGenDialog.vue')
    .then(component => {
      invertBoolean(isInitGen, true);
      return component;
    })
);
const TheBookmarks = defineAsyncComponent(
  () => import('@/components/TheBookmarks/TheBookmarks.vue')
    .then(component => {
      invertBoolean(isInitFav, true);
      return component;
    })
);
const SettingDialog = defineAsyncComponent(
  () => import('@/components/SettingDialog/SettingDialog.vue')
    .then(component => {
      invertBoolean(isInitSetting, true);
      return component;
    })
);

const [DefineHeaderBtns, HeaderBtns] = createReusableTemplate<{css?: string}>();


// Show/Hide dialogs
// -start load resource
const isInitGen = ref(false);
const isInitFav = ref(false);
const isInitSetting = ref(false);
// -open/close state
const isGenShowing = ref(false);
const isFavShowing = ref(false);
const isSettingShowing = ref(false);

const handleShowGen = () => {
  invertBoolean(isGenShowing);
};
const handleShowFav = () => {
  invertBoolean(isFavShowing);
};
const handleShowSetting = () => {
  invertBoolean(isSettingShowing);
};

const isShowingDialog = computed(() => {
  return isGenShowing.value || isFavShowing.value || isSettingShowing.value;
});

defineExpose({
  isShowingDialog
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
    () => toValue(isRunning) && pltState.refreshCard_(-1),
    toValue(delay)
  );
}
function haldleClickSlides() {
  if (toValue(isRunning)) { // play -> pause
    window.clearInterval(toValue(intervalId) as number | undefined);
    intervalId.value = null;
  } else { // pause -> play
    slidePlay();
    pltState.refreshCard_(-1);
  }
  invertBoolean(isRunning);
  pltState.setIsPending_(toValue(isRunning));
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

const sortingMenuItems = map(
  SORTING_ACTIONS,
  (name) => ({
    name,
    val: name,
    // @ts-expect-error
    hotkey: HOTKEYS.sorting_[name],
  })
);
</script>
