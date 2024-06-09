<template>
  <div class="favOffcanvas">
    <nav class="menuBar">
      <span
        v-for="(label, i) in pageLabels"
        :key="`page ${label}`"
        :class="i === page ? 'focusButton' : undefined"
        @click="setPage(i)"
      >{{
        label
      }}
      </span>
      <TheIcon
        type="close"
        @click="$emit('fav-showing')"
      />
    </nav>
    <!-- Page content -->
    <ul class="pageContent">
      <template v-if="page === 0">
        <ColorBlock
          v-for="(hex) in favState.colors"
          :key="`favColor ${hex}`"
          :hex="hex"
        />
      </template>
      <template v-else-if="page === 1">
        <PaletteBlock
          v-for="(plt) in favState.plts"
          :key="`favPlt ${plt}`"
          :plt="plt"
          hex=""
        />
      </template>
    </ul>
    <div
      class="appendPlt"
      @click="favPltChanged"
    >
      <TheIcon :type="state.icon" />{{ state.text }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import TheIcon from '../TheIcon.vue';
import ColorBlock from './ColorBlock.vue';
import PaletteBlock from './PaletteBlock.vue';
import usePltStore from '@/features/stores/usePltStore';
import useFavStore from '@/features/stores/useFavStore';

defineEmits<{
  (e: 'fav-showing'): void,
}>();

const pageLabels: string[] = ['Colors', 'Palettes'];
const page = ref<number>(0);
function setPage(i: number) {
  page.value = i;
}

const pltState = usePltStore();
const favState = useFavStore();
const pltStrings = computed(() => (
  pltState.cards.map((state) => state.hex.slice(1)).join('-')
));
const state = computed(() => {
  const isFavPlt = favState.plts.includes(pltStrings.value);
  if (isFavPlt) {
    return {
      icon: 'unfavorPallete',
      text: 'Remove Pallete',
    } as const;
  } else {
    return {
      icon: 'favorPallete',
      text: 'Append Pallete',
    } as const;
  }
});

function favPltChanged() {
  favState.favPltsChanged(pltStrings.value);
  setPage(1);
}

</script>

<style src="./FavOffcanvas.scss"></style>
