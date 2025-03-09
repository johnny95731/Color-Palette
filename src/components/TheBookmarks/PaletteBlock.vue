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
            type="caret-left-fill"
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
            type="trash3-fill"
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
          class="ripple"
          aria-label="複製調色盤HEX碼"
          @click="copyText(plt);handleClick($event)"
        >
          {{ plt }}
        </button>
      </template>
    </VTooltip>
  </li>
</template>

<script lang="ts" setup>
import { computed, toValue } from 'vue';
import $style from './VBookmarks.module.scss';
import VIcon from '../Custom/VIcon.vue';
import VTooltip from '../Custom/VTooltip.vue';
import { map, forLoop } from '@/utils/helpers';
import { toPercent } from '@/utils/numeric';
import { isValidHex } from '@/utils/colors';
import { copyText } from '@/utils/browser';
import useFavStore from 'stores/useFavStore';
import usePltStore from 'stores/usePltStore';

type Props = {
  plt: string;
}
const props = defineProps<Props>();
const pltColors = map(props.plt.split('-'), (hex) => `#${hex}`);
const diff = computed(() => toPercent(1 / pltColors.length, 2));
const bgGrad = computed(() => {
  const midPoint = forLoop(
    pltColors,
    (acc, hex, i) => {
      acc += `${hex} ${i * toValue(diff)}%,${hex} ${(i+1) * toValue(diff)}%,`;
      return acc;
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
