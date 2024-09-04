<template>
  <OverlayContainer
    role="dialog"
    :eager="true"
    transition="slide-x"
    v-model="model"
  >
    <div
      :class="$style.favOffcanvas"
    >
      <header
        :class="$style.header"
      >
        <h2>Bookmarks</h2>
        <TheBtn
          icon="close"
          aria-label="關閉"
          @click="model = false"
        />
      </header>
      <div
        :class="$style.menuBar"
      >
        <TheBtn
          v-for="(label, i) in TabLabels"
          :key="`page ${label}`"
          :ref="(el) => tabRefs[i] = el as InstanceType<typeof TheBtn>"
          :text="label"
          :class="i === tabIdx ? $style.selected : undefined"
          @click="tabIdx = i"
        />
      </div>
      <!-- Page content -->
      <ul
        :class="$style.pageContent"
      >
        <template
          v-if="tabIdx === 0"
        >
          <ColorBlock
            v-for="(hex) in favState.colors"
            :key="`favColor ${hex}`"
            :hex="hex"
          />
        </template>
        <template v-else-if="tabIdx === 1">
          <PaletteBlock
            v-for="(plt) in favState.plts"
            :key="`favPlt ${plt}`"
            :plt="plt"
          />
        </template>
      </ul>
      <TheBtn
        :prepend-icon="state.icon"
        :class="$style.appendPlt"
        @keydown="handleFocusoutDialog"
        @click="favPltChanged"
      >
        {{ state.text }}
      </TheBtn>
    </div>
  </OverlayContainer>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue';
import $style from './FavOffcanvas.module.scss';
import TheBtn from '../Custom/TheBtn.vue';
import OverlayContainer from '@/components/Custom/OverlayContainer.vue';
import ColorBlock from './ColorBlock.vue';
import PaletteBlock from './PaletteBlock.vue';
import { isTabKey } from '@/utils/browser';
import usePltStore from '@/features/stores/usePltStore';
import useFavStore from '@/features/stores/useFavStore';
import type { IconType } from '@/utils/icons';
import { toValue } from '@vueuse/core';


const emit = defineEmits<{
  (e: 'focusoutDialog'): void
}>();

const model = defineModel<boolean>();

const TabLabels: string[] = ['Colors', 'Palettes'];
const tabIdx = ref<number>(0);

const tabRefs = ref<InstanceType<typeof TheBtn>[]>([]);
watch(model, async (newVal) => { // focus dialog when open it.
  await nextTick();
  newVal && toValue(tabRefs)[toValue(tabIdx)]?.$el.focus();
});

function handleFocusoutDialog(e: KeyboardEvent) {
  if (isTabKey(e)) {
    e.preventDefault();
    if (toValue(tabIdx) !== TabLabels.length - 1)  // switch to next tab page.
      toValue(tabRefs)[++tabIdx.value]?.$el.focus();
    else {
      model.value = false;
      emit('focusoutDialog');
    }
  }
}

const pltState = usePltStore();
const favState = useFavStore();
const pltStrings = computed(() => (
  pltState.cards.map((state) => state.hex.slice(1)).join('-')
));
const state = computed<{
  icon: IconType,
  text: string,
}>(() => {
  const isFavPlt = favState.plts.includes(toValue(pltStrings));
  if (isFavPlt) {
    return {
      icon: 'unfavPallete',
      text: 'Remove Pallete',
    } as const;
  } else {
    return {
      icon: 'favPallete',
      text: 'Append Pallete',
    } as const;
  }
});

function favPltChanged() {
  favState.favPltsChanged(toValue(pltStrings));
  tabIdx.value = 1;
}
</script>
