<template>
  <li :class="$style.paletteBlock">
    <div :style="{background: bgGrad}">
      <div :class="$style.caretWrapper">
        <button
          type="button"
          aria-label="開啟書籤"
          @click="handleSetPlt"
        >
          <TheIcon
            type="caretLeft"
          />
        </button>
      </div>
      <span :class="$style.delWrapper">
        <button
          type="button"
          aria-label="刪除書籤"
          @click="removeFavPlt"
        >
          <TheIcon
            type="delete"
          />
        </button>
      </span>
    </div>
    <button
      type="button"
      class="ripple"
      aria-label="複製調色盤HEX碼"
      @click="copyInnerHex"
    >
      {{ plt }}
    </button>
  </li>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import $style from './FavOffcanvas.module.scss';
import TheIcon from '../TheIcon.vue';
import { isValidHex } from '@/utils/colors';
import { copyInnerHex } from '@/utils/eventHandler';
import useFavStore from '@/features/stores/useFavStore';
import usePltStore from '@/features/stores/usePltStore';

type Props = {
  plt: string;
}
const props = defineProps<Props>();
const pltColors = props.plt.split('-').map((hex) => `#${hex}`);
const diff = computed(() => {
  // Round to 2nd decimal place. Reprecent in percentage.
  return Math.round(10000 / pltColors.length) / 100;
});
const bgGrad = computed(() => {
  const midPoint = pltColors.reduce((acc, hex, i) => {
    acc += `${hex} ${i * diff.value}%,${hex} ${(i+1) * diff.value}%,`;
    return acc;
  }, '')
    .slice(0, -1);
  return `linear-gradient(90deg, ${midPoint})`;
});

// Events
const pltState = usePltStore();
const favState = useFavStore();
const handleSetPlt = () => {
  for (const hex of pltColors) {
    if (!isValidHex(hex)) return;
  }
  pltState.setPlt(pltColors);
};

function removeFavPlt() {
  favState.favPltsChanged(props.plt);
}
</script>
