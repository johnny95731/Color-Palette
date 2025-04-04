<template>
  <li
    v-memo="[hex]"
    :class="$style.colorBlock"
    :style="{
      backgroundColor: props.hex,
    }"
  >
    <VTooltip
      location="top"
      text="Copied"
      :openOnHover="false"
      openOnClick
      :eager="false"
    >
      <template #activator="{handleClick}">
        <VBtn
          class="ripple"
          :style="iconFilterStyle"
          prepend-icon="copy"
          :text="props.hex"
          :aria-label="`複製HEX碼${props.hex}`"
          variant="flat"
          @click="copyText(props.hex);handleClick($event)"
        />
      </template>
    </VTooltip>
    <span
      :class="$style.delWrapper"
    >
      <button
        type="button"
        aria-label="刪除書籤"
        @click="delFavColor"
      >
        <VIcon
          type="trash3-fill"
        />
      </button>
    </span>
  </li>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import $style from './VBookmarks.module.scss';
import VBtn from '../Custom/VBtn.vue';
import VTooltip from '../Custom/VTooltip.vue';
import VIcon from '../Custom/VIcon.vue';
// utils
import { rgb2gray } from '@/utils/colors';
import { copyText } from '@/utils/browser';
import { hex2rgb } from '@/utils/colorModels/hex';
// stores
import useFavStore from '@/stores/useFavStore';
// types
import type { CSSProperties } from 'vue';

type Props = {
  hex: string;
}
const props = defineProps<Props>();

const iconFilterStyle = computed<CSSProperties>(() => {
  const isLight = rgb2gray(hex2rgb(props.hex)) > 127.5;
  return { filter: isLight ? 'invert(1)' :  undefined };
});

const favState = useFavStore();
const delFavColor = () => {
  favState.favColorsChanged_(props.hex);
};
</script>
