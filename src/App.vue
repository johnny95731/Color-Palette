<template>
  <TheHeader
    @show-fav="isFavShowing = true"
    @show-settings="showSettings"
  />
  <main id="main">
    <ThePalette />
  </main>
  <SettingDialog
    v-if="isAppMounted"
    v-model="isSettingsShowing"
  />
  <FavOffcanvas
    v-if="isAppMounted"
    v-model="isFavShowing"
  />
</template>

<script setup lang='ts'>
import { ref, onMounted, watch, computed, defineAsyncComponent } from 'vue';
import TheHeader from './components/Header/TheHeader.vue';
import ThePalette from './components/Palette/ThePalette.vue';
const SettingDialog = defineAsyncComponent(
  () => import('./components/SettingDialog/SettingDialog.vue')
);
// import SettingDialog from './components/SettingDialog/SettingDialog.vue';
const FavOffcanvas = defineAsyncComponent(
  () => import('./components/FavOffcanvas/FavOffcanvas.vue')
);
// import FavOffcanvas from './components/FavOffcanvas/FavOffcanvas.vue';
import { isMenuContainer } from '@/utils/helpers';
import { OverlayDiv } from '@/utils/constants';
// Store and Context
import usePltStore from './features/stores/usePltStore';

// Display / Hide fav-offcanvas
const isSettingsShowing = ref(false);
const isFavShowing = ref(false);
const isShowOverlay = ref(false);

const pltState = usePltStore();
const isCardPending = computed(() => {
  return pltState.isEditing || pltState.isPending;
});

watch(
  () => pltState.isEditing,
  (newVal) => isShowOverlay.value = newVal
);

const handleOverlayChanged = () => {
  isShowOverlay.value = false;
  if (pltState.isEditing) {
    pltState.setEditingIdx();
    return;
  }
  pltState.setIsAdjustingPlt('cancel');
  isSettingsShowing.value = false;
  isFavShowing.value = false;
};
watch(isSettingsShowing, (newVal) => !newVal && pltState.setIsAdjustingPlt('cancel'));
const showSettings = () => {
  const newVal = !isSettingsShowing.value;
  isSettingsShowing.value = newVal;
  isShowOverlay.value = newVal;
  pltState.setIsAdjustingPlt('cancel');
};

const isAppMounted = ref(false);

// Connect hotkey.
onMounted(() => {
  isAppMounted.value = true;
  const body = document.body;
  // `preload` class for preventing annimation occurs on page load.
  body.classList.remove('preload');

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
    case ' ':
      pltState.refreshCard(-1);
      break;
    case 'g':
      pltState.sortCards('gray');
      break;
    case 'r':
      pltState.sortCards('random');
      break;
    case 'i':
      pltState.sortCards('inversion');
      break;
    }
  };
  body.addEventListener('keydown', keyDownEvent);
});
</script>

<style src="@/assets/transition.scss" />
