<template>
  <li :class="$style.paletteBlock">
    <div :style="{background: bgGrad}">
      <div :class="$style.caretWrapper">
        <button
          type="button"
          aria-label="開啟書籤"
          @click="handleSetPlt"
        >
          <VIcon
            icon="caret-left-fill"
          />
        </button>
      </div>
      <span :class="$style.delWrapper">
        <button
          type="button"
          aria-label="刪除書籤"
          @click="removeFavPlt"
        >
          <VIcon
            icon="trash3-fill"
          />
        </button>
      </span>
    </div>

    <VTooltip
      location="top"
      text="Copied"
      :openOnHover="false"
      openOnClick
      :eager="false"
    >
      <template #activator="{handleClick}">
        <button
          type="button"
          class="btn ripple"
          aria-label="複製調色盤HEX碼"
          @click="copyText(plt);handleClick($event)"
        >
          <div class="btn__overlay" />
          {{ plt }}
        </button>
      </template>
    </VTooltip>
  </li>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import $style from './VBookmarks.module.scss';
import VIcon from '../Custom/VIcon.vue';
import VTooltip from '../Custom/VTooltip.vue';
// utils
import { isValidHex, map } from '@johnny95731/color-utils';
import { reduce } from '@/utils/helpers';
import { toPercent } from '@/utils/numeric';
import { copyText } from '@/utils/browser';
// stores
import useFavStore from '@/stores/useFavStore';
import usePltStore from '@/stores/usePltStore';

type Props = {
  plt: string;
}
const props = defineProps<Props>();
const pltColors = map(props.plt.split('-'), (hex) => `#${hex}`);

const bgGrad = computed(() => {
  const d = toPercent(1 / pltColors.length, 2);
  const midPoint = reduce(
    pltColors,
    (acc, hex, i) => {
      return acc + `${hex} ${i * d}%,${hex} ${(i+1) * d}%,`;
    },
    ''
  )
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
  pltState.setPlt_(pltColors);
};

const removeFavPlt = () => favState.favPltsChanged_(props.plt);
</script>
