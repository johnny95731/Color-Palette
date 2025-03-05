<template>
  <li
    v-memo="[hex]"
    :class="$style.colorBlock"
    :style="{
      backgroundColor: props.hex,
    }"
  >
    <TheTooltip
      location="top"
      text="Copied"
      :openOnHover="false"
      openOnClick
      :eager="false"
    >
      <template #activator="{handleClick}">
        <TheBtn
          class="ripple"
          :style="iconFilterStyle"
          prepend-icon="copy"
          :text="props.hex"
          :aria-label="`複製HEX碼${props.hex}`"
          variant="flat"
          @click="copyText(props.hex);handleClick($event)"
        />
      </template>
    </TheTooltip>
    <span
      :class="$style.delWrapper"
    >
      <button
        type="button"
        aria-label="刪除書籤"
        @click="delFavColor"
      >
        <TheIcon
          type="trash3-fill"
        />
      </button>
    </span>
  </li>
</template>

<script lang="ts" setup>
import { computed, toValue } from 'vue';
import $style from './TheBookmarks.module.scss';
import TheBtn from '../Custom/TheBtn.vue';
import TheTooltip from '../Custom/TheTooltip.vue';
import TheIcon from '../Custom/TheIcon.vue';
import { hex2rgb, rgb2gray } from '@/utils/colors';
import { copyText } from '@/utils/browser';
import useFavStore from '@/features/stores/useFavStore';
import type { CSSProperties } from 'vue';

type Props = {
  hex: string;
}
const props = defineProps<Props>();

const isLight = computed(() => {
  return rgb2gray(hex2rgb(props.hex) as number[]) > 127.5;
});
const iconFilterStyle = computed<CSSProperties>(() => (
  { filter: toValue(isLight) ? 'invert(1)' :  undefined }
));

const favState = useFavStore();
const delFavColor = () => {
  favState.favColorsChanged_(props.hex);
};
</script>
