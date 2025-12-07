<template>
  <VDialog
    ref="dialogRef"
    :overlayProps="{
      contentClass: $style.bookmarkers
    }"
    title="書籤"
    :tabs="TabLabels"
    :transparent="false"
    transition="slide-x"
    v-model="isOpened"
    v-model:tab-idx="tabIdx"
  >
    <ul
      :class="$style.pageContent"
    >
      <template
        v-if="tabIdx === 0"
      >
        <ColorBlock
          v-for="(hex) in favState.colors_"
          :key="`favColor ${hex}`"
          :hex="hex"
        />
      </template>
      <template v-else-if="tabIdx === 1">
        <PaletteBlock
          v-for="(plt) in favState.plts_"
          :key="`favPlt ${plt}`"
          :plt="plt"
        />
      </template>
    </ul>
    <template #actions>
      <VBtn
        :class="$style.appendPlt"
        :prepend-icon="btnState.icon_"
        :text="btnState.text_"
        @keydown="handleFocusoutDialog"
        @click="favPltChanged"
      />
    </template>
  </VDialog>
</template>

<script lang="ts" setup>
import { map } from '@johnny95731/color-utils';
import { ref, computed, watch, nextTick, unref } from 'vue';

import useFavStore from '@/stores/useFavStore';
import usePltStore from '@/stores/usePltStore';
import { isTabKey } from '@/utils/browser';

import ColorBlock from './ColorBlock.vue';
import PaletteBlock from './PaletteBlock.vue';
import $style from './VBookmarks.module.scss';
import VBtn from '../Custom/VBtn.vue';
import VDialog from '../Custom/VDialog.vue';


const isOpened = defineModel<boolean>();

const dialogRef = ref<InstanceType<typeof VDialog>>();

const TabLabels: string[] = ['Colors', 'Palettes'];
const tabIdx = ref<number>(0);

watch(isOpened, async (newVal) => { // focus dialog when open it.
  await nextTick();
  if (newVal) unref(dialogRef)?.tabRefs[unref(tabIdx)]?.$el.focus();
  else pltState.setEditingIdx_();
});

const handleFocusoutDialog = (e: KeyboardEvent) => {
  if (isTabKey(e)) {
    e.preventDefault();
    if (unref(tabIdx) !== TabLabels.length - 1) { // switch to next tab page.
      unref(dialogRef)?.tabRefs[++tabIdx.value]?.$el.focus();
    }
    else {
      isOpened.value = false;
    }
  }
};

const pltState = usePltStore();
const favState = useFavStore();
const pltStrings = computed(() => (
  map(pltState.cards_, ({ hex_ }) => hex_.slice(1)).join('-')
));
const btnState = computed<{
  icon_: string
  text_: string
}>(() => {
  const isFavPlt = favState.isFavPlt_(unref(pltStrings));
  return {
    icon_: `bookmark-${isFavPlt ? 'dash' : 'plus'}`,
    text_: `${isFavPlt ? 'Remove' : 'Append'} Pallete`,
  } as const;
});

const favPltChanged = () => {
  favState.favPltsChanged_(unref(pltStrings));
  tabIdx.value = 1;
};
</script>
