<template>
  <TheHeader
    @show-fav="showFavOffcanvas"
    @show-settings="showSettings"
  />
  <ThePalette />
  <!-- Mask for  -->
  <div
    id="overlay"
    :style="{
      display: isShowOverlay ? undefined : 'none',
      backgroundColor: pltState.isEditing ? 'transparent' : undefined,
    }"
    @click="$event.currentTarget === $event.target && handleOverlayChanged()"
  >
    <SettingDialog
      v-if="isSettingsShowing"
      @show-settings="showSettings"
    />
    <FavOffcanvas
      :style="{
        transform: isFavShowing ? 'translateX(-100%)' : '',
      }"
      @fav-showing="showFavOffcanvas"
    />
  </div>
</template>

<script setup lang='ts'>
import { provide, ref, watchEffect, computed } from 'vue';
import TheHeader from './components/Header/TheHeader.vue';
import ThePalette from './components/Palette/ThePalette.vue';
import SettingDialog from './components/SettingDialog/SettingDialog.vue';
import FavOffcanvas from './components/FavOffcanvas/FavOffcanvas.vue';
// Store and Context
import usePltStore from './features/stores/usePltStore';
import media from './features/useMedia.ts';

// Display / Hide fav-offcanvas
const isSettingsShowing = ref(false);
const isFavShowing = ref(false);
const isShowOverlay = ref(false);

const pltState = usePltStore();
const isCardPending = computed(() => {
  return pltState.isEditing || pltState.isPending;
});

watchEffect(() => {
  isShowOverlay.value = pltState.isEditing;
});

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
const showSettings = () => {
  const newVal = !isSettingsShowing.value;
  isSettingsShowing.value = newVal;
  isShowOverlay.value = newVal;
  pltState.setIsAdjustingPlt('cancel');
};
const showFavOffcanvas = () => {
  const newVal = !isFavShowing.value;
  isFavShowing.value = newVal;
  isShowOverlay.value = newVal;
};

provide('media', media);

// Connect hotkey.
watchEffect((cleanup) => {
  const body = document.body;
  const keyDownEvent = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === 'escape' && !isCardPending.value && isShowOverlay.value) {
      handleOverlayChanged();
    }
    // Prevent trigger hotkey when editing or add/remove/move (transition) card.
    if (isCardPending.value || isShowOverlay.value) return;
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
  cleanup(() => body.removeEventListener('keydown', keyDownEvent));
});
</script>

<style lang='scss'>
#overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: #0005;
  z-index: 1;
}
</style>
