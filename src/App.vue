<template>
  <TheHeader
    ref="headerRef"
    @show-gen="handleShowGen"
    @show-fav="handleShowFav"
    @show-settings="handleShowSettings"
  />
  <main id="main">
    <ThePalette />
  </main>
  <HarmonyGenDialog
    v-if="isInitGen"
    v-model="isGenShowing"
  />
  <TheBookmarks
    v-if="isInitFav"
    v-model="isFavShowing"
    @focusout-dialog="headerRef?.focusBookmarks()"
  />
  <SettingDialog
    v-if="isInitSettings"
    v-model="isSettingsShowing"
    @focusout-dialog="headerRef?.focusSettings()"
  />
</template>

<script setup lang='ts'>
import { ref, onMounted, computed, defineAsyncComponent, onUnmounted } from 'vue';
import { toValue } from '@vueuse/core';
import TheHeader from './components/Header/TheHeader.vue';
import ThePalette from './components/Palette/ThePalette.vue';
const HarmonyGenDialog = defineAsyncComponent(
  () => import('./components/HarmonyGenDialog/HarmonyGenDialog.vue')
    .then(component => {
      setTimeout(() => handleShowGen(), 50);
      return component;
    })
);
const TheBookmarks = defineAsyncComponent(
  () => import('./components/TheBookmarks/TheBookmarks.vue')
    .then(component => {
      setTimeout(() => handleShowFav(), 50);
      return component;
    })
);
const SettingDialog = defineAsyncComponent(
  () => import('./components/SettingDialog/SettingDialog.vue')
    .then(component => {
      setTimeout(() => handleShowSettings(), 50);
      return component;
    })
);
import { OverlayDiv } from '@/constants/browser';
import { HOT_KEYS, refreshKey, sortingKey } from './utils/hotkeys';
import { invertBoolean } from './utils/helpers';
// Store and Context
import usePltStore from './features/stores/usePltStore';

const headerRef = ref<InstanceType<typeof TheHeader>>();
// Show/Hide dialogs
// -start load resource
const isInitGen = ref(false);
const isInitFav = ref(false);
const isInitSettings = ref(false);
// -open/close state
const isGenShowing = ref(false);
const isFavShowing = ref(false);
const isSettingsShowing = ref(false);

const handleShowGen = async () => {
  toValue(isInitGen) && invertBoolean(isGenShowing);
  invertBoolean(isInitGen, true);
};
const handleShowFav = async () => {
  toValue(isInitFav) && invertBoolean(isFavShowing);
  invertBoolean(isInitFav, true);
};

const handleShowSettings = async () => {
  toValue(isInitSettings) && invertBoolean(isSettingsShowing);
  invertBoolean(isInitSettings, true);
};

const pltState = usePltStore();
const isShowingOverlay = computed(() =>
  pltState.isEditing || toValue(isFavShowing) || toValue(isSettingsShowing)
);
const isCardPending = computed(() => pltState.isEditing || pltState.isPending);

// Connect hotkey.
(() => {
  const { [sortingKey]: sortingHotkey, [refreshKey]: refreshHotkey } = HOT_KEYS;
  const keyDownEvent = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (
      // Prevent trigger hotkey when editing or add/remove/move (transition) card.
      toValue(isCardPending) || toValue(isShowingOverlay) ||
      // Opening some popup element or focusing their activator.
      OverlayDiv.contains(document.activeElement)
    ) return;
    switch (key) {
    case refreshHotkey:
      pltState.refreshCard(-1);
      break;
    case sortingHotkey.gray:
      pltState.sortCards('gray');
      break;
    case sortingHotkey.random:
      pltState.sortCards('random');
      break;
    case sortingHotkey.inversion:
      pltState.sortCards('inversion');
      break;
    }
  };

  const body = document.body;
  onMounted(() => {
    // `preload` class for preventing annimation occurs on page load.
    body.classList.remove('preload');
    body.addEventListener('keydown', keyDownEvent);
  });
  onUnmounted(() => body.removeEventListener('keydown', keyDownEvent));
})();
</script>
