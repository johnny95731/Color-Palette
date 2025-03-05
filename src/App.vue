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
    v-if="isInitGen || isGenShowing"
    v-model="isGenShowing"
  />
  <TheBookmarks
    v-if="isInitFav || isFavShowing"
    v-model="isFavShowing"
    @focusout-dialog="headerRef?.focusBookmarks()"
  />
  <SettingDialog
    v-if="isInitSettings || isSettingsShowing"
    v-model="isSettingsShowing"
    @focusout-dialog="headerRef?.focusSettings()"
  />
</template>

<script setup lang='ts'>
import { ref, onMounted, computed, defineAsyncComponent, onUnmounted } from 'vue';
import { toValue } from '@vueuse/core';
import TheHeader from './components/Header/TheHeader.vue';
import ThePalette from './components/Palette/ThePalette.vue';
import { HOTKEYS } from './constants/hotkeys';
import { invertBoolean } from './utils/helpers';
// Store and Context
import usePltStore from './features/stores/usePltStore';
import { SortActions } from './types/colors';


const HarmonyGenDialog = defineAsyncComponent(
  () => import('./components/HarmonyGenDialog/HarmonyGenDialog.vue')
    .then(component => {
      invertBoolean(isInitGen, true);
      return component;
    })
);
const TheBookmarks = defineAsyncComponent(
  () => import('./components/TheBookmarks/TheBookmarks.vue')
    .then(component => {
      invertBoolean(isInitFav, true);
      return component;
    })
);
const SettingDialog = defineAsyncComponent(
  () => import('./components/SettingDialog/SettingDialog.vue')
    .then(component => {
      invertBoolean(isInitSettings, true);
      return component;
    })
);


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

const handleShowGen = () => {
  invertBoolean(isGenShowing);
};
const handleShowFav = () => {
  invertBoolean(isFavShowing);
};

const handleShowSettings = () => {
  invertBoolean(isSettingsShowing);
};

const pltState = usePltStore();
const isShowingOverlay = computed(() =>
  pltState.isEditing_ || toValue(isFavShowing) || toValue(isSettingsShowing)
);
const isCardPending = computed(() => pltState.isEditing_ || pltState.isPending_);

// Connect hotkey.
(() => {
  const { sorting_: sortingHotkey, refresh_: refreshHotkey } = HOTKEYS;
  const keyDownEvent = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (
      // Prevent trigger hotkey when editing or add/remove/move (transition) card.
      toValue(isCardPending) || toValue(isShowingOverlay)
    ) return;
    if (key === refreshHotkey) {
      pltState.refreshCard_(-1);
      return;
    }
    for (const [sortBy, hotkey] of Object.entries(sortingHotkey)) {
      if (key === hotkey) {
        pltState.sortCards_(sortBy as SortActions);
        return;
      }
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
