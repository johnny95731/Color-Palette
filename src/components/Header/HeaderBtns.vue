<template>
  <!-- Align left -->
  <TheBtn
    :class="$style.btn"
    prepend-icon="refresh"
    aria-label="刷新調色盤"
    text="Refresh"
    @click="pltState.refreshCard(-1)"
  />
  <TheBtn
    v-memo="[isRunning]"
    :class="$style.btn"
    :prepend-icon="isRunning ? 'pause' : 'play'"
    :aria-label="isRunning ? '暫停' : '自動刷新'"
    text="Slides"
    @click="haldleClickSlides"
  />
  <DropdownMenu
    title="Sort"
    icon="sort"
    :class="$style.btnMenu"
    :contents="sortingMenuItems"
    :current-val="pltState.sortBy"
    @click-item="pltState.sortCards($event as SortActionType)"
  />
  <DropdownMenu
    title="Blend"
    icon="blend"
    :class="$style.btnMenu"
    :contents="BLEND_MODES"
    :current-val="pltState.blendMode"
    @click-item="pltState.setBlendMode($event as BlendingType)"
  />
  <DropdownMenu
    title="Space"
    icon="edit"
    :class="$style.btnMenu"
    letterCase="all-caps"
    :contents="COLOR_SPACES"
    :current-val="pltState.colorSpace"
    @click-item="pltState.setColorSpace($event as ColorSpacesType)"
  />
  <div
    v-if="!isSmall"
    class="spacer"
  />
  <!-- Align right -->
  <TheBtn
    :class="$style.btn"
    prepend-icon="bookmarks"
    text="Bookmarks"
    aria-label="書籤"
    aria-haspopup="dialog"
    @click="$emit('show-fav')"
  />
  <TheBtn
    :class="$style.btn"
    prepend-icon="setting"
    text="Settings"
    aria-label="設定"
    aria-haspopup="dialog"
    @click="$emit('show-settings')"
  />
  <!-- Test -->
  <!-- <DropdownMenu
    title="layer1"
    :contents="SORTING_ACTIONS"
  >
    <template #items>
      <button
        v-for="val in SORTING_ACTIONS"
        :key="val"
        type="button"
      >
        {{ val }}
      </button>
      <DropdownMenu
        title="layer2"
        :contents="SORTING_ACTIONS"
      >
        <template #items>
          <button
            v-for="val in SORTING_ACTIONS"
            :key="val"
            type="button"
          >
            {{ val }}
          </button>
          <DropdownMenu
            title="layer3"
            :contents="SORTING_ACTIONS"
          >
            <template #items>
              <button
                v-for="val in SORTING_ACTIONS"
                :key="val"
                type="button"
              >
                {{ val }}
              </button>
              <DropdownMenu
                title="layer4"
                :contents="SORTING_ACTIONS"
              />
              <button
                v-for="val in SORTING_ACTIONS"
                :key="val"
                type="button"
              >
                {{ val }}
              </button>
            </template>
          </DropdownMenu>
        </template>
      </DropdownMenu>
    </template>
  </DropdownMenu> -->
  <!-- Test -->
</template>

<script setup lang='ts'>
import { ref, watch, computed, useCssModule } from 'vue';
import DropdownMenu from '@/components/Custom/DropdownMenu.vue';
import TheBtn from '@/components/Custom/TheBtn.vue';
// Stores / Contexts
import usePltStore from 'stores/usePltStore.ts';
import useSettingStore from 'stores/useSettingStore.ts';
import {
  COLOR_SPACES, BLEND_MODES, SORTING_ACTIONS,
} from '@/utils/constants';
// Types
import type { SortActionType } from 'types/pltType.ts';
import type { BlendingType, ColorSpacesType } from 'types/pltType.ts';

const $style = useCssModule();

type Props = {
  isSmall: boolean,
}
defineProps<Props>();

defineEmits<{
  (e: 'show-fav'): void,
  (e: 'show-settings'): void
}>();
const pltState = usePltStore();
const settingState = useSettingStore();

// Slides
const isRunning = ref<boolean>(false);
const intervalId = ref<number | null>(null);

const delay = computed(() => Math.max(settingState.transition.color, 1000));
function intervalPlay() {
  intervalId.value = window.setInterval(() => {
    isRunning.value && pltState.refreshCard(-1);
  }, delay.value);
}
function haldleClickSlides() {
  if (isRunning.value) {
    if (intervalId.value !== null) window.clearInterval(intervalId.value);
    intervalId.value = null;
  } else {
    intervalPlay();
    pltState.refreshCard(-1);
  }
  isRunning.value = !isRunning.value;
  pltState.setIsPending(isRunning.value);
}
watch(
  () => settingState.transition.color,
  () => {
    if (!isRunning.value) return;
    if (intervalId.value !== null) window.clearInterval(intervalId.value);
    intervalPlay();
  },
);

const sortingMenuItems = SORTING_ACTIONS.map((val) => ({
  val,
  name: `${val} (${val[0]})`
}));
</script>
<style lang="scss" src="./TheHeader.module.scss" module />
