<template>
  <TheHeader @fav-showing="favShowingChanged" />
  <ThePalette />
  <!-- Mask for  -->
  <div id="mask"
    @click="favShowingChanged"
    :style="{
      display: isFavShowing ? undefined : 'none',
    }"
  />
  <FavOffcanvas :style="{
      transform: isFavShowing ? 'translateX(-100%)' : '',
    }"
    @fav-showing="favShowingChanged"
  />
</template>

<script setup lang='ts'>
import {provide, ref, watchEffect, computed} from 'vue';
import TheHeader from './components/Header/TheHeader.vue';
import ThePalette from './components/Palette/ThePalette.vue';
import FavOffcanvas from './components/FavOffcanvas/FavOffcanvas.vue';
// Store and Context
import usePltStore from './features/stores/usePltStore';
import mediaContent from './features/useMedia.ts';

// Display / Hide fav-offcanvas
const isFavShowing = ref(false);
function favShowingChanged() {
  isFavShowing.value = !isFavShowing.value;
}

provide('media', mediaContent);

// Connect hotkey.
const pltState = usePltStore();
const someCardIsEditing = computed(() => {
  return pltState.cards.some((card) => card.isEditing);
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
@import '@/assets/commons.scss';

.main {
  position: absolute;
  display: flex;
  width: 100%;
  height: calc(100% - 60px);
  overflow: hidden;

  @include small {
    flex-direction: column;
    height: calc(100% - 40px);
  }
}

.insertWrapper {
  position: absolute;
  height: 100%;
  width: 70px;
  transform: translateX(-50%);
  user-select: none;
  >div {
    @extend %center;
    display: none;
    height: 25px;
    border-radius: 15px;
    padding: 10px;
    background-color: #ffffffd0;
    cursor: pointer;
  }
  :global(.icon) {
    height: 100%;
  }
  &:hover >div {
    display: block;
  }

  @include small {
    height: 35px;
    width: 100%;
    transform: translateY(-50%);
    >div {
      display: block;
      height: 13px;
      padding: 7px;
      border-radius: 10px;
      background-color: #fff;
      opacity: 0.6;
      :global(.icon) {
        transform: rotate(90deg);
      }
    }
    &:focus >div {
      opacity: 1;
    }
  }
  @include mobile {
    height: 30px;
    >div {
      padding: 7px;
      .icon {
        transform: rotate(90deg);
      }
    }
  }
}

.dragging {
  position: relative;
  box-shadow: 0px 0px 20px black;
  border-width: 0px 1px;
  border-style: solid;
  border-color: #fff;
  transform: translateX(-50%);
  pointer-events: none;
  overscroll-behavior: none;
  z-index: 1;

  @include small {
    border-width: 1px 0px;
    transform: translateY(-50%);
  }
}

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
