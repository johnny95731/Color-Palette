<template>
  <OverlayContainer
    role="dialog"
    :eager="true"
    v-model="isActive"
  >
    <Transition name="scroll-y-dialog">
      <div
        v-show="model"
        :class="$style.settingDialog"
        @animationstart="isTransition = true"
        @animationend="isTransition = false"
      >
        <header
          v-once
          :class="$style.header"
        >
          <h2>Settings</h2>
          <TheBtn
            icon="close"
            aria-label="close"
            @click="isActive = false"
          />
        </header>
        <div
          :class="$style.menubar"
          role="tablist"
        >
          <TheBtn
            v-for="(opt, i) in tabTitles"
            :key="`setting-${opt}`"
            :class="$style.tab"
            role="tab"
            :style="tabStyleState[i]"
            :text="opt"
            @click="handleTabStyle($event, i)"
          />
        </div>
        <div :class="$style.content">
          <!-- Page 0: Card -->
          <template v-if="tabIdx === 0">
            <div
              :class="$style.region"
              aria-labelledby="title-Border"
            >
              <h3 id="title-Border">
                Border
              </h3>
              <span>Show</span>
              <TheSwitch
                label="show border"
                hide-label
                :model-value="showBorder"
                @click="handleSwitchStyle"
              />
              <template v-if="showBorder">
                <label
                  id="border-width"
                >Width(px)</label>
                <TheSlider
                  label="#border-width"
                  :min="1"
                  :max="BORDER_MAX_WIDTH"
                  :step="1"
                  :digit="0"
                  :model-value="currentWidth"
                  @change="handleWidth($event)"
                />
                <label
                  id="border-color"
                  :class="$style.subOption"
                >Color</label>
                <SelectMenu
                  :class="$style.subOption"
                  label="#border-color"
                  :options="BORDER_COLOR"
                  :model-value="settingsState.border.color"
                  @update:model-value="handleSelectColor($event)"
                />
              </template>
            </div>
            <div :class="$style.region">
              <h3>Transition</h3>
              <label
                id="transition-position"
              >Position1(ms)</label>
              <TheSlider
                label="#transition-position"
                :min="0"
                :max="TRANSITION_MAX_POS"
                :digit="0"
                :step="50"
                :model-value="posTime"
                @change="handleTransitionChanged($event, 'pos')"
              />
              <label
                id="transition-color"
              >Color(ms)</label>
              <TheSlider
                label="#transition-color"
                :min="0"
                :max="TRANSITION_MAX_COLOR"
                :digit="0"
                :step="50"
                :model-value="colorTime"
                @change="handleTransitionChanged($event, 'color')"
              />
            </div>
          </template>
          <!-- Page 1: Contrast -->
          <template v-else-if="tabIdx === 1">
            <div :class="$style.region">
              <label
                v-once
                id="contrast-method"
              >Method</label>
              <SelectMenu
                label="#contrast-method"
                :options="CONTRAST_METHODS"
                :value="contrastArgs.method"
                @update:model-value="contrastChanged({
                  method: $event as ContrastMethods,
                })"
              />
              <label
                id="contrast-coeff-name"
              >{{
                contrastArgs.method === "gamma" ? "gamma" : "scale"
              }}</label>
              <TheSlider
                label="#contrast-coeff-name"
                :min="0"
                :max="contrastCoeffMax"
                :model-value="contrastArgs.coeff"
                @change="contrastChanged({
                  coeff: $event
                })"
              />
              <div
                v-once
                :class="$style.buttons"
              >
                <TheBtn
                  text="Reset"
                  :class="$style.resetBtn"
                  @click="contrastBtnEvent('reset')"
                />
                <TheBtn
                  text="Apply"
                  :class="$style.applyBtn"
                  @click="contrastBtnEvent('start')"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </OverlayContainer>
</template>

<script setup lang="ts" scoped>
import { computed, useCssModule, ref, reactive } from 'vue';
import OverlayContainer from '@/components/Custom/OverlayContainer.vue';
import TheBtn from './../Custom/TheBtn.vue';
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

const model = defineModel<boolean>();
const isTransition = ref(false);
const isActive = computed({
  get() {
    return model.value || isTransition.value;
  },
  set(newVal) {
    isTransition.value = !newVal;
    model.value = newVal;
    if (!model.value && isTransition.value) isTransition.value = false;
  }
});

const pltState = usePltStore();
const settingsState = useSettingStore();
const $style = useCssModule();

const tabTitles = ['Card', 'Contrast'] as const;
const tabIdx = ref(0);

/**
 * When tab be selected
 */
const tabSelectedStyle = {
  ...CURRENT_OPTION_WEIGHT,
  color: $style.color5,
  backgroundColor: $style.color1,
  '--overlay-hover-opacity': 0,
} as CSSProperties;
const tabStyleState: (CSSProperties | undefined)[] = reactive(
  tabTitles.map((_, i) => (
    i === tabIdx.value ? tabSelectedStyle : undefined
  ))
);

const handleTabStyle = (e: MouseEvent, idx: number) => {
  // Remove style from previous tab and update current tab style.
  tabStyleState[tabIdx.value] = undefined;
  tabStyleState[idx] = tabSelectedStyle;
  if (idx === 1) { //
    pltState.setIsAdjustingPlt('start');
    contrastChanged(contrastArgs);
  } else if (tabIdx.value === 1) pltState.setIsAdjustingPlt('cancel');
  tabIdx.value = idx;
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

<style src="./SettingDialog.module.scss" module />
