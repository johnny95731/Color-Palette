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
    <SelectMenu
      v-memo="[isSmall, pltState.sortBy_]"
      prepend-icon="sort-down-alt"
      :class="[
        css,
        $style.btn
      ]"
      aria-label="排序"
      :text="isSmall ? '排序' : undefined"
      :tooltip="true"
      :items="sortingMenuItems"
      hide-value
      :fit-activator="false"
      :model-value="pltState.sortBy_"
      @triggered="pltState.sortCards_($event as Sort)"
    />
    <SelectMenu
      v-memo="[isSmall, pltState.mixMode_]"
      prepend-icon="file-earmark-plus"
      :class="[
        css,
        $style.btn
      ]"
      aria-label="混色"
      :text="isSmall ? '混色' : undefined"
      :tooltip="isSmall ? false : true"
      :items="MIXING_MODES.slice(0, MIXING_MODES.length)"
      hide-value
      :fit-activator="false"
      v-model:idx="pltState.mixMode_"
    />
    <SelectMenu
      v-memo="[isSmall]"
      prepend-icon="sliders"
      :class="[
        css,
        $style.btn
      ]"
      aria-label="色彩空間"
      :text="isSmall ? '色彩空間' : undefined"
      :tooltip="isSmall ? false : true"
      letter-case="origin"
      :items="SPACES"
      hide-value
      :fit-activator="false"
      @update:model-value="pltState.setColorSpace_($event!)"
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
      prepend-icon="circle-half"
      aria-label="對比度"
      :text="isSmall ? '對比度' : undefined"
      :tooltip="isSmall ? false : true"
      @click="isOpening.contrast_ = !isOpening.contrast_"
    />
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

    <ContrastDialog
      v-if="inInit.contrast_ || isOpening.contrast_"
      v-model="isOpening.contrast_"
    />
    <PaletteInputter
      v-if="inInit.input_ || isOpening.input_"
      v-model="isOpening.input_"
    />
    <HarmonyGenDialog
      v-if="inInit.harmony_ || isOpening.harmony_"
      v-model="isOpening.harmony_"
    />
    <VBookmarks
      v-if="inInit.fav_ || isOpening.fav_"
      v-model="isOpening.fav_"
    />
    <SettingDialog
      v-if="inInit.setting_ || isOpening.setting_"
      v-model="isOpening.setting_"
    />
  </header>
</template>

<script setup lang='ts'>
import { ref, computed, watch, defineAsyncComponent, reactive, unref } from 'vue';
import { createReusableTemplate } from '@vueuse/core';
import $style from './VHeader.module.scss';
import DropdownMenu from '../Custom/DropdownMenu.vue';
import VBtn from '@/components/Custom/VBtn.vue';
import SelectMenu from '../Custom/SelectMenu.vue';
// utils
import { HOTKEYS } from '@/utils/hotkeys';
import { invertBoolean } from '@/utils/helpers';
// stores
import media from '@/composables/useMedia';
import usePltStore, { SPACES } from '@/stores/usePltStore';
import useSettingStore from '@/stores/useSettingStore';
import { map, MIXING_MODES, SORTING_ACTIONS, type Sort } from '@johnny95731/color-utils';

const ContrastDialog = defineAsyncComponent(
  () => import('@/components/ContrastDialog/ContrastDialog.vue')
    .then(component => {
      inInit.contrast_ = true;
      return component;
    })
);
const PaletteInputter = defineAsyncComponent(
  () => import('@/components/PaletteInputter/PaletteInputter.vue')
    .then(component => {
      inInit.input_ = true;
      return component;
    })
);
const HarmonyGenDialog = defineAsyncComponent(
  () => import('@/components/HarmonyGenerator/HarmonyGenerator.vue')
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
  contrast_: false,
  input_: false,
  harmony_: false,
  fav_: false,
  setting_: false,
});
// -open/close state
const isOpening = reactive({ ...inInit });


defineExpose({
  isSomeDialogOpened_: computed(() => {
    return Object.values(isOpening).some((val) => val);
  })
});


const isSmall = computed(() => media.isSmall_);

const pltState = usePltStore();
const settingState = useSettingStore();

// Slides
const isRunning = ref<boolean>(false);
const intervalId = ref<number | null>(null);

const delay = computed(() => Math.max(settingState.transition.color, 1000));
const slidePlay = () => {
  intervalId.value = window.setInterval(
    () => unref(isRunning) && pltState.refreshCard_(-1),
    unref(delay)
  );
};
const haldleClickSlides = () => {
  if (unref(isRunning)) { // play -> pause
    window.clearInterval(unref(intervalId) as number | undefined);
    intervalId.value = null;
  } else { // pause -> play
    slidePlay();
    pltState.refreshCard_(-1);
  }
  invertBoolean(isRunning);
  pltState.setIsPending_(unref(isRunning));
};
watch(
  () => settingState.transition.color,
  () => {
    if (unref(isRunning)) {
      window.clearInterval(unref(intervalId) as number | undefined);
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
