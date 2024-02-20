<template>
  <header class="header">
    <h1 class="title">
      Color Palette
    </h1>
    <div class="menubar" ref="menuRef"
      @click="isSmall ? showPopupMenu($event) : undefined"
    >
      <TheIcon v-if="isSmall" type="list" />
      <div ref="menuContentRef">
        <!-- Float left -->
        <span class="btn" @click="pltState.refreshCard(-1)">
          <TheIcon type="refresh" />All
        </span>
        <DropupMenu icon="sort" class="btn"
          :contents="SORTING_ACTIONS" :current-val="pltState.sortBy"
          :hotkeys="SORTING_ACTIONS.map((str) => str[0])"
          :item-click="sorting"
        >
          <template #title>Sort</template>
        </DropupMenu>
        <DropupMenu icon="blend" class="btn"
          :contents="BLEND_MODES" :current-val="pltState.blendMode"
          :item-click="setBlendMode"
        >
          <template #title>Blend</template>
        </DropupMenu>
        <DropupMenu icon="edit" class="btn"
          :contents="COLOR_SPACES" :current-val="pltState.colorSpace"
          :item-click="setColorSpace"
          letterCase="all-caps"
        >
        <template #title>Space</template>
        </DropupMenu>
        <span class="btn playBtn" @click="haldleClick">
          <TheIcon :type="pltState.isPlaying ? 'pause' : 'play'" />{{
            pltState.isPlaying ? 'Pause' : 'Play'
        }}</span>

        <div class='empty'></div>
        <!-- Float right -->
        <span class="btn" @click="$emit('show-fav')">
          <TheIcon type="bookmark" />Bookmarks
        </span>
        <span class="btn" @click="$emit('show-settings')">
          <TheIcon type="setting" />Settings
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang='ts'>
import {ref, watch, watchEffect, inject, computed} from 'vue';
import TheIcon from '../TheIcon.vue';
import DropupMenu from '../Custom/DropupMenu.vue';
import {showPopupMenu, preventDefault} from '@/utils/helpers.ts';
// Stores / Contexts
import usePltStore from 'stores/usePltStore.ts';
import useSettingStore from 'stores/useSettingStore.ts';
import {
  COLOR_SPACES, BLEND_MODES, SORTING_ACTIONS,
} from '@/utils/constants';
// Types
import type {Ref} from 'vue';
import type {SortActionType} from 'types/pltType.ts';
import type {BlendingType, ColorSpacesType} from 'types/pltType.ts';
import type {MediaContextType} from 'types/mediaType.ts';

const media = inject('media') as Ref<MediaContextType>;
const pltState = usePltStore();
const settingState = useSettingStore();

const menuRef = ref<HTMLDivElement>();
const menuContentRef = ref<HTMLDivElement>();
const isSmall = computed(() => media.value.isSmall);

// Media Events
watchEffect(() => { // add / remove class.
  const content = menuContentRef.value;
  if (!content) return;
  if (isSmall.value) {
    menuRef.value?.classList.add('popupMenu');
    content.classList.add('mobileMenuContent');
    content.classList.add('menuContentR');
  } else {
    menuRef.value?.classList.remove('popupMenu');
    content.classList.remove('mobileMenuContent');
    content.classList.remove('menuContentR');
  }
});
// Events in menus.
// -Create Events
const sorting = (sortBy: SortActionType) => {
  pltState.sortCards(sortBy);
};
const setBlendMode = (newMode: BlendingType) => {
  pltState.setBlendMode(newMode);
};
const setColorSpace = (newColorSpace: ColorSpacesType) => {
  pltState.setColorSpace(newColorSpace);
};
watchEffect((cleanup) => {
  const menu = menuRef.value;
  if (menu) {
    menu.addEventListener('contextmenu', preventDefault);
    cleanup(() => {
      menu.addEventListener('contextmenu', preventDefault);
    });
  }
});

const isRunning = ref<boolean>(false);
const timeoutId = ref<number | null>(null);

const delay = computed(() => Math.max(settingState.transition.color, 1000));
function play() {
  pltState.refreshCard(-1);
  timeoutId.value = window.setTimeout(() => {
    isRunning.value && play();
  }, delay.value);
}
function haldleClick() {
  if (pltState.isPlaying) {
    isRunning.value = false;
    if (timeoutId.value !== null) window.clearTimeout(timeoutId.value);
    timeoutId.value = null;
  } else {
    isRunning.value = true;
    play();
  }
  pltState.setIsPlaying();
}
watch(
    () => settingState.transition.color,
    () => {
      if (!pltState.isPlaying) return;
      if (timeoutId.value !== null) window.clearTimeout(timeoutId.value);
      timeoutId.value = window.setTimeout(() => {
        isRunning.value && play();
      }, delay.value);
    },
);
</script>

<style src="../Custom/DropupMenu.scss"></style>
<style lang='scss' scoped>
.header {
  display: inline-flex;
  align-items: center;
  // position
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  // shape
  width: 100vw;
  height: var(--header-height);
  padding: 0 30px 0 60px;
  box-sizing: border-box;

  background-color: $color2;
  user-select: none;
  @include small {
    padding: 0 0 0 15px;
    justify-content: space-between;
  }
}

.title {
  font-size: var(--font-heading);
  font-weight: 900;
  color: $color5;
  margin: 0;
}

.menubar {
  flex: 1 0 auto;
  color: $color5;
  margin: auto 0 auto 20px;
  >div {
    display: flex;
    width: 100%;
    @include small {
      display: block;
      width: 100vw;
    }
  }
  .empty {
    flex-grow: 1;
  }
  @include small {
    flex: 0 0 var(--header-height);
    position: relative;
    height: 100%;
    margin: 0;
    float: right;
    background-color: $color1;
  }
}

%btn {
  margin: 0 2px;
  float: left;
  border-radius: $radius-lg;
  box-sizing: border-box;
  background-color: inherit;
  cursor: pointer;
  :deep(.icon) {
    margin-left: 0;
    margin-right: 3px;
    height: 18px;
    vertical-align: bottom;
  }
  &:hover, &:focus {
    background-color: $color1;
  }
  @include small {
    position: relative;
    margin: 0;
    // shape
    min-height: 30px;
    width: 100%;
    padding: 7px 0;
    &:hover, &:focus {
      background-color: $color3;
    }
  }
}
.list {
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.btn {
  @extend %btn;
  padding: 5px 10px 5px 7px;
}

.btnMenu {
  @extend %btn;
  padding: 5px 6px 5px 8px;
}

.playBtn {
  width: 75px;
}
</style>
