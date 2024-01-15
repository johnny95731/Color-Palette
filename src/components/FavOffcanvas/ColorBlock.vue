<template>
<li class="colorBlock"
  :style="{
    backgroundColor: props.hex,
    color: isLight ? '#000' : '#fff',
  }"
>
  <div @click="copyHex">
    <TheIcon type="copy"
      :style="iconFilterStyle"
    />{{
      props.hex
    }}
  </div>
  <span class="delWrapper">
    <TheIcon type="del" @click="delFavColor" />
  </span>
</li>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import TheIcon from '../TheIcon.vue';
import {hex2rgb, rgb2gray} from '@/utils/colors';
import {copyHex} from '@/utils/helpers';
import useFavStore from '@/features/stores/useFavStore';

type Props = {
  hex: string;
}
const props = defineProps<Props>();

const isLight = computed(() => {
  return rgb2gray(hex2rgb(props.hex) as number[]) > 127.5;
});
const iconFilterStyle = computed(() => (
  {filter: isLight.value ? '' : 'invert(1)'} as Partial<CSSStyleValue>
));

const favState = useFavStore();
function delFavColor() {
  favState.favColorsChanged(props.hex);
}
</script>

<style lang="scss" src="./FavOffcanvas.scss"></style>
