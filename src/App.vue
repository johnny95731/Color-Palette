<template>
  <TheHeader
    @show-fav="showFavOffcanvas"
    @show-settings="showSettings"
  />
  <ThePalette />
  <!-- Mask for  -->
  <div id="mask"
    @click="handleClickMask"
    :style="{
      display: isMasking ? undefined : 'none',
    }"
  />
  <SettingDialog v-if="isSettingsShowing"
    @show-settings="showSettings"
  />
  <FavOffcanvas :style="{
      transform: isFavShowing ? 'translateX(-100%)' : '',
    }"
    @fav-showing="showFavOffcanvas"
  />
</template>

<script setup lang='ts'>
import {provide, ref, watchEffect, computed} from 'vue';
import TheHeader from './components/Header/TheHeader.vue';
import ThePalette from './components/Palette/ThePalette.vue';
import SettingDialog from './components/SettingDialog/SettingDialog.vue';
import FavOffcanvas from './components/FavOffcanvas/FavOffcanvas.vue';
// Store and Context
import usePltStore from './features/stores/usePltStore';
import mediaContent from './features/useMedia.ts';

// Display / Hide fav-offcanvas
const isSettingsShowing = ref(false);
const isFavShowing = ref(false);
const isMasking = ref(false);

const handleClickMask = () => {
  isSettingsShowing.value = false;
  pltState.setPltIsEditing('cancel');
  isFavShowing.value = false;
  isMasking.value = false;
};
const showSettings = () => {
  const newVal = !isSettingsShowing.value;
  isSettingsShowing.value = newVal;
  isMasking.value = newVal;
};
const showFavOffcanvas = () => {
  const newVal = !isFavShowing.value;
  isFavShowing.value = newVal;
  isMasking.value = newVal;
};

provide('media', mediaContent);

// Connect hotkey.
const pltState = usePltStore();
const someCardIsEditing = computed(() => {
  return pltState.cards.some((card) => card.isEditing) || pltState.isPending;
});
watchEffect((cleanup) => {
  const body = document.body;
  const keyDownEvent = (e: KeyboardEvent) => {
    // Prevent trigger hotkey/shortcut when editing card.
    if (someCardIsEditing.value) return;

    switch (e.key.toLowerCase()) {
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
#mask {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: #0005;
  z-index: 1;
}
</style>
