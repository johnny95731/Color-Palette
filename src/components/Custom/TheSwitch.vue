<template>
  <div
    :class="`${$style.wrapper} ${isOn ? $style.active : ''}`"
    @click="handleClick"
  >
    <div
      :class="$style.circle"
      :style="switchStyle[isOn ? 'on' : 'off']"
    />
    <span v-if="msg">{{ isOn ? msg[0] : msg[1] }}</span>
  </div>
</template>

<script lang="ts">
const switchStyle = {
  on: {
    left: 'calc(100% - 5px)',
    transform: 'translate(-100%, -50%)',
  },
  off: {
    left: '5px',
    transform: 'translateY(-50%)',
  },
};
</script>

<script setup lang="ts">
import { computed, ref, useCssModule, withDefaults } from 'vue';

type Props = {
  onClick?: (isOn: boolean) => void;
  defaultValue?: boolean;
  /**
   * strings [On, Off] for on/off states.
   */
  text?: readonly [string, string];
}

const props = withDefaults(defineProps<Props>(), {
  text: () => ['On', 'Off'],
});
const $style = useCssModule();

const isOn = ref(props.defaultValue);
function handleClick() {
  if (props.onClick) props.onClick(!isOn.value);
  isOn.value = !isOn.value;
}
const msg = computed(() => props.text ? props.text : null);
</script>

<style lang="scss" module>
@import "@/assets/commons.scss";

$transDuration: 300ms;

.wrapper {
  display: inline-block;
  position: relative;
  // shape
  height: 20px;
  width: 40px;
  border-radius: $radius-lg;
  // style
  background-color: $color4;
  transition: background-color $transDuration;
  cursor: pointer;
  >span {
    @extend %verticalCenter;
    left: 100%;
    margin-left: 5px;
    color: $color5;
  }
}

.active {
  background-color: hsl(120, 80%, 50%);
}

.circle {
  display: inline-block;
  // position
  position: absolute;
  top: 50%;
  bottom: auto;
  transition-property: left transform;
  transition-duration: $transDuration;
  transition-timing-function: ease-in-out;
  // shape
  height: 65%;
  aspect-ratio: 1 / 1;
  border-radius: 100%;

  background-color: $color1;
}
</style>

