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
      :class="$style.menuWrapper"
    >
      <menu
        :class="$style.menubar"
      >
        <HeaderBtns
          @show-fav="$emit('show-fav')"
          @show-settings="$emit('show-settings')"
        />
      </menu>
    </div>
    <DropdownMenu
      v-else-if="isSmall"
      :className="$style.menuWrapper"
      :titleClass="$style.menubarTitle"
      :contentClass="$style.menubar"
      iconType="list"
      :isMobile="true"
      icon="list"
      hideTriangle
    >
      <template #items>
        <HeaderBtns
          @show-fav="$emit('show-fav')"
          @show-settings="$emit('show-settings')"
        />
      </template>
    </DropdownMenu>
  </header>
</template>

<script setup lang='ts'>
import { ref, watchEffect, computed, useCssModule } from 'vue';
import DropdownMenu from '../Custom/DropdownMenu.vue';
import { preventDefault } from '@/utils/eventHandler.ts';
// Stores / Contexts
import media from '@/features/useMedia';
// Types
import HeaderBtns from './HeaderBtns.vue';

const $style = useCssModule();

defineEmits<{
  (e: 'show-fav'): void,
  (e: 'show-settings'): void
}>();

const headerRef = ref<HTMLElement>();
const isSmall = computed(() => media.isSmall);

// -Create Events
watchEffect((cleanup) => {
  const menu = headerRef.value;
  if (menu) {
    menu.addEventListener('contextmenu', preventDefault);
    cleanup(() => {
      menu.removeEventListener('contextmenu', preventDefault);
    });
  }
});
</script>
<style lang="scss" src="./TheHeader.module.scss" module />
