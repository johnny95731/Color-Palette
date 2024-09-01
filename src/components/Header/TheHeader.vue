<template>
  <header
    ref="headerRef"
    :class="$style.header"
  >
    <h1 :class="$style.title">
      Color Palette
    </h1>
    <div
      v-if="!isSmall"
      :class="$style.menubar"
    >
      <HeaderBtns
        ref="btnsRef"
        :isSmall="isSmall"
        @show-fav="$emit('show-fav')"
        @show-settings="$emit('show-settings')"
      />
    </div>
    <DropdownMenu
      v-else
      :titleClass="$style.menubarTitle"
      :contentClass="$style.menubar"
      icon="list"
      :isMobile="true"
      hideTriangle
    >
      <template #items>
        <HeaderBtns
          ref="btnsRef"
          :isSmall="isSmall"
          @show-fav="$emit('show-fav')"
          @show-settings="$emit('show-settings')"
        />
      </template>
    </DropdownMenu>
  </header>
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue';
import { toValue } from '@vueuse/core';
import $style from './TheHeader.module.scss';
import DropdownMenu from '../Custom/DropdownMenu.vue';
import HeaderBtns from './HeaderBtns.vue';
// Stores / Contexts
import media from '@/features/useMedia';

const btnsRef = ref<InstanceType<typeof HeaderBtns>>();
defineExpose({
  focusBookmarks() {
    toValue(btnsRef)?.focusBookmarks();
  },
  focusSettings() {
    toValue(btnsRef)?.focusSettings();
  }
});

defineEmits<{
  (e: 'show-fav'): void,
  (e: 'show-settings'): void
}>();

const isSmall = computed(() => media.isSmall);
</script>
