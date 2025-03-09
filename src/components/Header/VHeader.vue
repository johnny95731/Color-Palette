<template>
  <DefineHeaderBtns v-slot="{ css }">
    <!-- Left side -->
    <VBtn
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
    <VBtn
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
    <VBtn
      v-memo="[isSmall]"
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="upload"
      aria-label="輸入調色盤"
      :text="isSmall ? '輸入調色盤' : undefined"
      :tooltip="isSmall ? false : true"
      @click="isOpening.input_ = !isOpening.input_"
    />
    <InputPaletteDialog
      v-if="inInit.input_ || isOpening.input_"
      v-model="isOpening.input_"
    />

    <VBtn
      v-memo="[isSmall]"
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="palette"
      ariaLabel="調和調色盤"
      :text="isSmall ? '調和調色盤' : undefined"
      :tooltip="isSmall ? false : true"
      @click="isOpening.harmony_ = !isOpening.harmony_"
    />
    <HarmonyGenDialog
      v-if="inInit.harmony_ || isOpening.harmony_"
      v-model="isOpening.harmony_"
    />

    <VBtn
      v-memo="[isSmall]"
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="bookmarks"
      aria-label="書籤"
      :text="isSmall ? '書籤' : undefined"
      :tooltip="isSmall ? false : true"
      @click="isOpening.fav_ = !isOpening.fav_"
    />
    <VBookmarks
      v-if="inInit.fav_ || isOpening.fav_"
      v-model="isOpening.fav_"
    />

    <VBtn
      :class="[
        css,
        $style.btn
      ]"
      prepend-icon="gear"
      aria-label="設定"
      :text="isSmall ? '設定' : undefined"
      :tooltip="isSmall ? false : true"
      @click="isOpening.setting_ = !isOpening.setting_"
    />
    <SettingDialog
      v-if="inInit.setting_ || isOpening.setting_"
      v-model="isOpening.setting_"
    />

    <VBtn
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
    <!-- <VBtn
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
import { ref, computed, watch, defineAsyncComponent, reactive } from 'vue';
import { createReusableTemplate, toValue } from '@vueuse/core';
import $style from './VHeader.module.scss';
import DropdownMenu from '../Custom/DropdownMenu.vue';
import VBtn from '@/components/Custom/VBtn.vue';
// Utils
import { HOTKEYS } from '@/constants/hotkeys';
import { invertBoolean, map } from '@/utils/helpers';
// Constants
import { MIXING_MODES } from '@/constants/mixing';
import { COLOR_SPACES, SORTING_ACTIONS } from '@/constants/colors';
// Stores / Contexts
import media from '@/composables/useMedia';
import usePltStore from '@/features/usePltStore';
import useSettingStore from '@/features/useSettingStore';
// Types
import type { ColorSpaces, SortActions } from 'types/colors';
import type { Mixing } from 'types/mixing';


const InputPaletteDialog = defineAsyncComponent(
  () => import('@/components/InputPaletteDialog/InputPaletteDialog.vue')
    .then(component => {
      inInit.input_ = true;
      return component;
    })
);
const HarmonyGenDialog = defineAsyncComponent(
  () => import('@/components/HarmonyGenDialog/HarmonyGenerator.vue')
    .then(component => {
      inInit.harmony_ = true;
      return component;
    })
);
const VBookmarks = defineAsyncComponent(
  () => import('@/components/TheBookmarks/VBookmarks.vue')
    .then(component => {
      inInit.fav_ = true;
      return component;
    })
);
const SettingDialog = defineAsyncComponent(
  () => import('@/components/SettingDialog/SettingDialog.vue')
    .then(component => {
      inInit.setting_ = true;
      return component;
    })
);

const [DefineHeaderBtns, HeaderBtns] = createReusableTemplate<{css?: string}>();


// Show/Hide dialogs
// -Is resource loaded
const inInit = reactive({
  input_: false,
  harmony_: false,
  fav_: false,
  setting_: false
});
// -open/close state
const isOpening = reactive({
  input_: false,
  harmony_: false,
  fav_: false,
  setting_: false
});


const isShowingDialog = computed(() => {
  return Object.values(isOpening).some((val) => val);
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
