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
          :contents="sortAction" :current-val="sortBy"
          :hotkeys="sortAction.map((str) => str[0])"
          :item-click="sorting"
        >
          <template #title>Sort</template>
        </DropupMenu>
        <DropupMenu icon="blend" class="btn"
          :contents="BlendModeList" :current-val="blendMode"
          :item-click="setBlendMode"
        >
          <template #title>Blend</template>
        </DropupMenu>
        <DropupMenu icon="edit" class="btn"
          :contents="ColorSpacesList" :current-val="colorSpace"
          :item-click="setColorSpace"
          letterCase="all-caps"
        >
          <template #title>Space</template>
        </DropupMenu>
        <!-- Float right -->
        <span class="btn btnR" @click="$emit('fav-showing')">
          <TheIcon type="bookmark" />Bookmarks
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang='ts'>
import {ref, watchEffect, inject, computed} from 'vue';
import type {Ref} from 'vue';
import TheIcon from '../TheIcon.vue';
import DropupMenu from './DropupMenu.vue';
import {showPopupMenu, preventDefault} from '@/utils/helpers.ts';
// Stores / Contexts
import usePltStore from '@/features/stores/usePltStore.ts';
import useOptionsStore from '@/features/stores/useOptionsStore.ts';
import {sortAction} from '@/features/types/pltType.ts';
import {ColorSpacesList, BlendModeList} from '@/features/types/optionsType.ts';
// Types
import type {SortActionType} from '@/features/types/pltType.ts';
import type {
  BlendingType, ColorSpacesType,
} from '@/features/types/optionsType.ts';
import type {MediaContextType} from '@/features/types/mediaType.ts';

// Media Events
const menuRef = ref<HTMLDivElement>();
const menuContentRef = ref<HTMLDivElement>();
const media = inject('media') as Ref<MediaContextType>;
const isSmall = computed(() => media.value.isSmall);

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
// Menu Events
const pltState = usePltStore();
const optionsState = useOptionsStore();
// -Get Values
const sortBy = computed(() => pltState.sortBy);
const blendMode = computed(() => optionsState.blendMode);
const colorSpace = computed(() => optionsState.colorSpace);
// -Create Events
const sorting = (sortBy: SortActionType) => {
  pltState.sortCards(sortBy);
};
const setBlendMode = (newMode: BlendingType) => {
  optionsState.setBlendMode(newMode);
};
const setColorSpace = (newColorSpace: ColorSpacesType) => {
  optionsState.setColorSpace(newColorSpace);
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
</script>

<style src="./DropupMenu.scss"></style>
<style lang='scss'>
@import '@/assets/commons.scss';

.header {
  display: inline-flex;
  align-items: center;
  width: 100%;
  height: var(--headerHeight);
  padding: 0 30px 0 60px;
  box-sizing: border-box;
  background-color: $color2;
  user-select: none;
  @include small {
    padding: 0 0 0 15px;
    justify-content: space-between;
  }
}

$titleFontSize: 24px;
.title {
  font-size: $titleFontSize;
  font-weight: 900;
  color: $color5;
  margin: 0;
  @include small {
    font-size: 20px;
  }
}

.menubar {
  flex: 1 0 auto;
  display: table;
  color: $color5;
  margin: auto 0 auto 20px;

  @include small {
    flex: 0 0 var(--headerHeight);
    position: relative;
    height: 100%;
    margin: 0;
    float: right;
    background-color: $color3;
  }
}

.btn {
  float: left;
  padding: 5px 8px;
  border-radius: 8px;
  background-color: inherit;
  cursor: pointer;
  .icon {
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
    min-height: 30px;
    width: 100%;
    padding: 7px 0;
    box-sizing: border-box;
    &:hover, &:focus {
      background-color: $color3;
    }
  }
}

.btnR {
  float: right;
  margin: 0;
}
</style>
