<template>
  <TheHeader
    ref="headerRef"
    @show-fav="handleShowFav"
    @show-settings="handleShowSettings"
  />
  <main id="main">
    <ThePalette />
  </main>
  <FavOffcanvas
    v-if="isFirstTimeFav"
    v-model="isFavShowing"
    @click="handleOverlayChanged"
    @focusout-dialog="headerRef?.focusBookmarks()"
  />
  <SettingDialog
    v-if="isFirstTimeSettings"
    v-model="isSettingsShowing"
    @click="handleOverlayChanged"
    @focusout-dialog="headerRef?.focusSettings()"
  />
</template>

<script setup lang='ts'>
import { ref, onMounted, computed, defineAsyncComponent, onUnmounted } from 'vue';
import TheHeader from './components/Header/TheHeader.vue';
import ThePalette from './components/Palette/ThePalette.vue';
// import FavOffcanvas from './components/FavOffcanvas/FavOffcanvas.vue';
// import SettingDialog from './components/SettingDialog/SettingDialog.vue';
const FavOffcanvas = defineAsyncComponent(
  () => import('./components/FavOffcanvas/FavOffcanvas.vue')
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
import { isMenuContainer } from '@/utils/eventHandler.ts';
import { OverlayDiv } from '@/utils/constants';
import { HOT_KEYS, refreshKey, sortingKey } from './utils/hotkeys';
// Store and Context
import usePltStore from './features/stores/usePltStore';

// Show/Hide dialogs
// -start load resource
const isFirstTimeFav = ref(false);
const isFirstTimeSettings = ref(false);
// -open/close state
const isFavShowing = ref(false);
const isSettingsShowing = ref(false);
const isShowOverlay = computed(() =>
  pltState.isEditing || isFavShowing.value || isSettingsShowing.value
);

const headerRef = ref<InstanceType<typeof TheHeader>>();

const pltState = usePltStore();
const isCardPending = computed(() =>
  pltState.isEditing || pltState.isPending
);

const handleOverlayChanged = () => {
  // if (pltState.isEditing) {
  //   pltState.setEditingIdx();
  //   return;
  // }
  pltState.isEditing ?
    pltState.setEditingIdx() :
    pltState.setIsAdjustingPlt('cancel');
};

const handleShowFav = async () => {
  isFirstTimeFav.value && (isFavShowing.value = true);
  isFirstTimeFav.value = true;
};

const handleShowSettings = async () => {
  isFirstTimeSettings.value && (isSettingsShowing.value = true);
  isFirstTimeSettings.value = true;
  // shorter
  // isFirstTimeSettings.value = !isFirstTimeSettings.value || (isSettingsShowing.value = true);
};

// Connect hotkey.
(() => {
  const { [sortingKey]: sortingHotkey, [refreshKey]: refreshHotkey } = HOT_KEYS;
  const keyDownEvent = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === 'escape' && !isCardPending.value && isShowOverlay.value) {
      handleOverlayChanged();
    }
    if (
      // Prevent trigger hotkey when editing or add/remove/move (transition) card.
      isCardPending.value || isShowOverlay.value ||
      // Opening some popup element or focusing their activator.
      OverlayDiv.contains(document.activeElement) || isMenuContainer(document.activeElement)
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
