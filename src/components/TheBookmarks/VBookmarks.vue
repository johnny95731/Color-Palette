<template>
  <OverlayContainer
    :content-class="$style.container"
    role="dialog"
    type="offcanvas"
    :eager="true"
    transition="slide-x"
    v-model="model"
  >
    <header
      :class="$style.header"
    >
      <h2>書籤</h2>
      <VBtn
        icon="x-lg"
        aria-label="關閉"
        @click="model = false"
      />
    </header>
    <div
      :class="$style.menuBar"
    >
      <VBtn
        v-for="(label, i) in TabLabels"
        :key="`page ${label}`"
        :ref="(el) => tabRefs[i] = el as InstanceType<typeof VBtn>"
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
    <VBtn
      :prepend-icon="state.icon"
      :class="$style.appendPlt"
      @keydown="handleFocusoutDialog"
      @click="favPltChanged"
    >
      {{ state.text }}
    </VBtn>
  </OverlayContainer>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, toValue } from 'vue';
import $style from './VBookmarks.module.scss';
import VBtn from '../Custom/VBtn.vue';
import OverlayContainer from '@/components/Custom/OverlayContainer.vue';
import ColorBlock from './ColorBlock.vue';
import PaletteBlock from './PaletteBlock.vue';
// Utils
import { isTabKey } from '@/utils/browser';
// Store
import usePltStore from 'stores/usePltStore';
import useFavStore from 'stores/useFavStore';
import { map } from '@/utils/helpers';


const emit = defineEmits<{
  (e: 'focusoutDialog'): void
}>();

const model = defineModel<boolean>();

const TabLabels: string[] = ['Colors', 'Palettes'];
const tabIdx = ref<number>(0);

const tabRefs = ref<InstanceType<typeof VBtn>[]>([]);
watch(model, async (newVal) => { // focus dialog when open it.
  await nextTick();
  if (newVal) toValue(tabRefs)[toValue(tabIdx)]?.$el.focus();
  else pltState.setEditingIdx_();
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
