<template>
  <li class="paletteBlock">
    <div :style="{background: bgGrad}">
      <div class="caretWrapper">
        <TheIcon
          type="caret"
          @click="handleSetPlt()"
        />
      </div>
      <span class="delWrapper">
        <TheIcon
          type="del"
          @click="removeFavPlt()"
        />
      </span>
    </div>
    <div @click="copyHex">
      {{ plt }}
    </div>
  </li>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import TheIcon from '../TheIcon.vue';
import { isValidHex } from '@/utils/colors';
import { copyHex } from '@/utils/eventHandler';
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

<style lang="scss" src="./FavOffcanvas.scss"></style>
