<template>
  <li
    v-memo="[hex]"
    :class="styles.colorBlock"
    :style="{
      backgroundColor: props.hex,
    }"
  >
    <TheBtn
      :style="iconFilterStyle"
      prepend-icon="copy"
      :text="props.hex"
      :aria-label="`複製HEX碼${props.hex}`"
      @click="copyText(props.hex)"
    />
    <span
      :class="styles.delWrapper"
    >
      <button
        type="button"
        aria-label="刪除書籤"
      >
        <TheIcon
          type="del"
          @click="delFavColor"
        />
      </button>
    </span>
  </li>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import styles from './FavOffcanvas.module.scss';
import TheIcon from '../TheIcon.vue';
import { hex2rgb, rgb2gray } from '@/utils/colors';
import { copyText } from '@/utils/eventHandler';
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
  { filter: isLight.value ? '' : 'invert(1)' }
));

const favState = useFavStore();
function delFavColor() {
  favState.favColorsChanged(props.hex);
}
</script>
