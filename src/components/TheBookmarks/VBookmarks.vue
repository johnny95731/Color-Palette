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
        :prepend-icon="state.icon"
        :text="state.text"
        @keydown="handleFocusoutDialog"
        @click="favPltChanged"
      />
    </template>
  </VDialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, toValue, unref } from 'vue';
import $style from './VBookmarks.module.scss';
import VBtn from '../Custom/VBtn.vue';
import ColorBlock from './ColorBlock.vue';
import PaletteBlock from './PaletteBlock.vue';
// Utils
import { isTabKey } from '@/utils/browser';
import { map } from '@/utils/helpers';
// Store
import usePltStore from '@/features/usePltStore';
import useFavStore from '@/features/useFavStore';
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

function handleFocusoutDialog(e: KeyboardEvent) {
  if (isTabKey(e)) {
    e.preventDefault();
    if (toValue(tabIdx) !== TabLabels.length - 1) {// switch to next tab page.
      unref(dialogRef)?.tabRefs[++tabIdx.value]?.$el.focus();
    } else {
      isOpened.value = false;
    }
  }
}

const pltState = usePltStore();
const favState = useFavStore();
const pltStrings = computed(() => (
  map(pltState.cards_, ({ hex_ }) => hex_.slice(1)).join('-')
));
const state = computed<{
  icon: string,
  text: string,
}>(() => {
  const isFavPlt = favState.plts_.includes(toValue(pltStrings));
  if (isFavPlt) {
    return {
      icon: 'bookmark-dash',
      text: 'Remove Pallete',
    } as const;
  } else {
    return {
      icon: 'bookmark-plus',
      text: 'Append Pallete',
    } as const;
  }
});

function favPltChanged() {
  favState.favPltsChanged_(toValue(pltStrings));
  tabIdx.value = 1;
}
</script>
