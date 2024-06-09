<template>
  <div :class="$style.settingDialog">
    <header :class="$style.header">
      <h5>Settings</h5>
      <TheIcon
        type="close"
        @Click="$emit('show-settings')"
      />
    </header>
    <div :class="$style.menubar">
      <div
        v-for="(opt, i) in SETTINGS"
        :key="`setting-${opt}`"
        :style="page === i ? currentPageStyle : undefined"
        @click="pageChanged(i)"
      >
        {{
          opt
        }}
      </div>
    </div>
    <div :class="$style.content">
      <!-- Page 0: Card -->
      <template v-if="page === 0">
        <h6>Border</h6>
        <span>Show</span>
        <TheSwitch
          :defaultValue="showBorder"
          @click="handleSwitchStyle"
        />
        <template v-if="showBorder">
          <span :class="$style.subOption">┠ Width(px)</span>
          <TheSlider
            :min="1"
            :max="BORDER_MAX_WIDTH"
            :step="1"
            :digit="0"
            :value="currentWidth"
            @change="handleWidth($event)"
          />
          <span :class="$style.subOption">┖ Color</span>
          <SelectMenu
            :class="$style.subOption"
            :options="BORDER_COLOR"
            @update:model-value="handleSelectColor($event)"
          />
        </template>
        <h6>Transition</h6>
        <span>Position(ms)</span>
        <TheSlider
          :min="0"
          :max="TRANSITION_MAX_POS"
          :digit="0"
          :step="50"
          :value="posTime"
          @change="handleTransitionChanged($event, 'pos')"
        />
        <span>Color(ms)</span>
        <TheSlider
          :min="0"
          :max="TRANSITION_MAX_COLOR"
          :digit="0"
          :step="50"
          :value="colorTime"
          @change="handleTransitionChanged($event, 'color')"
        />
      </template>
      <!-- Page 1: Contrast -->
      <template v-else-if="page === 1">
        <span>Method</span>
        <SelectMenu
          :options="CONTRAST_METHODS"
          :value="contrastArgs.method"
          @update:model-value="contrastChanged({
            method: $event as ContrastMethods,
          })"
        />
        <span>{{
          contrastArgs.method === "gamma" ? "gamma" : "scale"
        }}</span>
        <TheSlider
          :min="0"
          :max="contrastCoeffMax"
          :value="contrastArgs.coeff"
          @change="contrastChanged({
            coeff: $event
          })"
        />
        <div :class="$style.buttons">
          <button
            type="button"
            :class="$style.applyBtn"
            @click="contrastBtnEvent('start')"
          >
            Apply
          </button>
          <button
            type="button"
            :class="$style.resetBtn"
            @click="contrastBtnEvent('reset')"
          >
            Reset
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" scoped>
import { useCssModule, ref, reactive } from 'vue';
import TheIcon from '../TheIcon.vue';
import SelectMenu from '../Custom/SelectMenu.vue';
import TheSwitch from '../Custom/TheSwitch.vue';
import TheSlider from '../Custom/TheSlider.vue';
import {
  CURRENT_OPTION_WEIGHT, BORDER_MAX_WIDTH, CONTRAST_METHODS, GAMMA_MAX,
  MULTIPLICATION_MAX, TRANSITION_MAX_COLOR, TRANSITION_MAX_POS, BORDER_COLOR,
} from '@/utils/constants';
// Stores / Contexts
import usePltStore from 'stores/usePltStore';
import useSettingStore from 'stores/useSettingStore';
// Types
import type { CSSProperties } from 'vue';
import type { TransitionType } from 'types/settingType';
import type { ContrastMethods } from 'types/pltType';

defineEmits<{
  (e: 'show-settings'): void
}>();

const pltState = usePltStore();
const settingsState = useSettingStore();
const $style = useCssModule();

const SETTINGS = ['Card', 'Contrast'] as const;
const currentPageStyle: CSSProperties = {
  ...CURRENT_OPTION_WEIGHT,
  color: $style.color5,
  backgroundColor: $style.color1,
};

type ContrastArgsType = {
  method: ContrastMethods;
  coeff: number;
}
const contrastArgs = reactive<ContrastArgsType>({
  method: CONTRAST_METHODS[0],
  coeff: 1,
});
function contrastChanged(newObj: Partial<ContrastArgsType>) {
  Object.assign(contrastArgs, newObj);
  pltState.adjustContrast(contrastArgs.method, contrastArgs.coeff);
}

const page = ref(0);
const pageChanged = (i: number) => {
  // Page 1 is contrast.
  if (i === 1) {
    pltState.setIsAdjustingPlt('start');
    contrastChanged(contrastArgs);
  } else if (page.value === 1) pltState.setIsAdjustingPlt('cancel');
  page.value = i;
};


// page 0: Card
// -Border states
const showBorder = ref<boolean>(settingsState.border.show);
const currentWidth = ref<number>(settingsState.border.width);
// -Transition states
const posTime = ref<number>(settingsState.transition.pos);
const colorTime = ref<number>(settingsState.transition.color);

const handleSwitchStyle = (isOn: boolean) => {
  showBorder.value = isOn;
  settingsState.setBorder('show', isOn);
};
const handleWidth = (val: number) => {
  currentWidth.value = val;
  settingsState.setBorder('width', val);
};
const handleSelectColor = (val: string) => {
  settingsState.setBorder('color', val);
};
const handleTransitionChanged = (
  val: number, attr: keyof TransitionType,
) => {
  if (attr === 'pos') posTime.value = val;
  else colorTime.value = val;
  settingsState.setTransition(attr, val);
};
// page 1: Contrast
const contrastBtnEvent = (ev: 'start' | 'reset') => {
  pltState.setIsAdjustingPlt(ev);
  contrastChanged({ coeff: 1 });
};
const contrastCoeffMax = (
  contrastArgs.method === 'gamma' ?
    GAMMA_MAX :
    MULTIPLICATION_MAX
);
</script>

<style lang="scss" scoped module>
.settingDialog {
  // position
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  // shape
  height: 400px;
  width: 320px;
  border-radius: $radius-lg;
  overflow: hidden;
}

$header-height: 34px;
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $header-height;
  width: 100%;
  background-color: $color5;
  >h5 {
    // shape
    padding: 0px 10px 0px;
    margin: 0;
    // color and text
    color: $color2;
    text-align: center;
    font-size: var(--font-subheading);
    font-weight: $bold-weight;

    user-select: none;
  }
  :global(.icon) {
    margin: 6px;
    // shape
    height: 13px;
    padding: 4px;
    border-radius: $radius-lg;

    filter: invert(1);
    &:hover {
      filter: none;
      background-color: $color3;
    }
  }
}

.menubar {
  display: inline-flex;
  flex: 1 1 auto;
  height: 25px;
  width: 100%;

  user-select: none;
  background-color: $color2;
  >div {
    border-radius: $radius-sm $radius-sm 0 0;
    padding: 5px 10px;

    font-size: var(--font-sm);
    cursor: pointer;
    &:hover {
      background-color: $color1;
    }
  }
}

%optionLayout {
  display: grid;
  grid-template-rows: repeat(auto-fill, minmax(25px, 1fr));
  grid-template-columns: 85px 1fr;
  row-gap: 10px;
  column-gap: 5px;
  justify-items: flex-start;
  align-items: center;
}

.content {
  // layout
  @extend %optionLayout;
  overflow-y: auto;
  // position
  grid-row-start: 2;
  grid-row-end: 4;
  grid-column-start: 1;
  grid-column-end: 4;
  // shape
  height: 341px;
  width: 100%;
  padding: 3px 20px 10px;
  box-sizing: border-box;

  background-color: $color1;
  >label, >div, >input {
    max-height: min-content;
    font-size: var(--font-body);
  }
  >h6 {
    grid-column-start: 1;
    grid-column-end: 3;
    margin: 0;
    font-size: var(--font-subheading);
  }
  >label {
    grid-column-start: 1;
    grid-column-end: 2;
  }
  >div { // custom <Select>
    grid-column-start: 2;
    grid-column-end: 3;
  }
  >input {
    grid-column-start: 2;
    grid-column-end: 3;
    border-radius: $radius-sm;
    box-sizing: border-box;
    width: 100%;
  }
}

.subOption {
  // position
  &label {
    grid-column-start: 1;
    grid-column-end: 2;
  }
  &*:not(label) {
    grid-column-start: 2;
    grid-column-end: 3;
  }
  // shape
  height: fit-content;
  width: 100%;

  font-size: var(--font-sm);
}

.buttons {
  // position
  grid-row-end: -1;
  grid-column-start: 1;
  grid-column-end: 3;
  // shape
  height: 100%;
  width: 100%;
  >button {
    display: block;
    margin: 0 0 0 20px;
    float: right;
    // shape
    height: fit-content;
    border: none;
    padding: 3px 12px;
    border-radius: $radius-md;
    box-sizing: border-box;

    font-weight: $normal-weight;
    cursor: pointer;
    user-select: none;
  }
}

.applyBtn {
  color: $color1;
  background-color: $color5;
  &:hover {
    background-color: $color4;
  }
}

.resetBtn {
  color: $color5;
  background-color: $color2;
  &:hover {
    background-color: $color3;
  }
}
</style>
