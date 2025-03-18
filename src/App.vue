<template>
  <VHeader
    ref="headerRef"
  />
  <main id="main">
    <VPalette />
  </main>
</template>

<script setup lang='ts'>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { toValue } from '@vueuse/core';
import VHeader from './components/Header/VHeader.vue';
import VPalette from './components/Palette/VPalette.vue';
import { HOTKEYS } from './utils/hotkeys';
// Store and Context
import usePltStore from './stores/usePltStore';
// types
import type { SortActions } from './utils/manipulate/sorting';


const headerRef = ref<InstanceType<typeof VHeader>>();

const pltState = usePltStore();
const isOverlayOpened = computed(() =>
  pltState.isEditing_ || headerRef.value?.isSomeDialogOpened_
);
const isCardPending = computed(() => pltState.isEditing_ || pltState.isPending_);

// Connect hotkey.
(() => {
  const { sorting_: sortingHotkey, refresh_: refreshHotkey } = HOTKEYS;
  const keyDownEvent = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (
      // Prevent trigger hotkey when editing or add/remove/move (transition) card.
      toValue(isCardPending) || toValue(isOverlayOpened)
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
