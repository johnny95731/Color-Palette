<template>
  <li
    v-memo="[hex]"
    :class="$style.colorBlock"
    :style="{
      backgroundColor: props.hex,
    }"
  >
    <TheBtn
      class="ripple"
      :style="iconFilterStyle"
      prepend-icon="copy"
      :text="props.hex"
      :aria-label="`複製HEX碼${props.hex}`"
      variant="flat"
      @click="copyText(props.hex)"
    />
    <span
      :class="$style.delWrapper"
    >
      <button
        type="button"
        aria-label="刪除書籤"
        @click="delFavColor"
      >
        <TheIcon
          type="delete"
        />
      </button>
    </span>
  </li>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { toValue } from '@vueuse/core';
import $style from './TheBookmarks.module.scss';
import TheIcon from '../Custom/TheIcon.vue';
import { hex2rgb, rgb2gray } from '@/utils/colors';
import { copyText } from '@/utils/browser';
import useFavStore from '@/features/stores/useFavStore';
import type { CSSProperties } from 'vue';
import TheBtn from '../Custom/TheBtn.vue';

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
  favState.favColorsChanged(props.hex);
};
</script>
