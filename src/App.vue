<template>
  <VHeader
    ref="headerRef"
  />
  <VPalette />
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue';
import VHeader from './components/Header/VHeader.vue';
import VPalette from './components/Palette/VPalette.vue';
import { HOTKEYS } from './utils/hotkeys';
// Store and Context
import usePltStore from './stores/usePltStore';
// types
import type { Sort } from '@johnny95731/color-utils';

const headerRef = ref<InstanceType<typeof VHeader>>();

const pltState = usePltStore();

// Connect hotkey.
const { sorting_: sortingHotkey, refresh_: refreshHotkey } = HOTKEYS;
const keyDownEvent = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  if (
    // Prevent trigger hotkey when editing or add/remove/move (transition) card.
    pltState.isEditing_ || pltState.isPending_ ||
    headerRef.value?.isSomeDialogOpened_
  ) return;
  if (key === refreshHotkey) {
    pltState.refreshCard_(-1);
    return;
  }
  for (const [sortBy, hotkey] of Object.entries(sortingHotkey)) {
    if (key === hotkey) {
      pltState.sortCards_(sortBy as Sort);
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
</script>
