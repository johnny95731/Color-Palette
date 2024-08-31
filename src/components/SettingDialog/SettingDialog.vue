<template>
  <OverlayContainer
    role="dialog"
    :eager="true"
    transition="scroll-y-dialog"
    v-model="model"
  >
    <div
      :class="$style.settingDialog"
    >
      <header
        v-once
        :class="$style.header"
      >
        <h2>Settings</h2>
        <TheBtn
          icon="close"
          aria-label="close"
          @click="model = false"
        />
      </header>
      <div
        :class="$style.menubar"
      >
        <TheBtn
          v-for="(opt, i) in tabLabels"
          :key="`setting-${opt}`"
          :ref="el => tabRefs[i] = el as InstanceType<typeof TheBtn>"
          :class="$style.tab"
          :style="tabStyleState[i]"
          :text="opt"
          @click="switchTab(i)"
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
              :model-value="border.show"
              @click="handleSwitchStyle"
            />
            <template v-if="border.show">
              <label
                id="border-width"
              >Width(px)</label>
              <TheSlider
                label="#border-width"
                :max="BORDER_MAX_WIDTH"
                :model-value="border.width"
                @update:model-value="handleWidth($event)"
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
              :max="TRANSITION_MAX_POS"
              :step="50"
              :model-value="transition.pos"
              @update:model-value="handleTransitionChanged($event, 'pos')"
            />
            <label
              id="transition-color"
            >Color(ms)</label>
            <TheSlider
              label="#transition-color"
              :max="TRANSITION_MAX_COLOR"
              :step="50"
              :model-value="transition.color"
              @update:model-value="handleTransitionChanged($event, 'color')"
              @keydown="switchTab(1)"
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
              v-model="contrastArgs.method"
            />
            <label
              id="contrast-coeff-name"
            >{{
              contrastViewData.coeff
            }}</label>
            <TheSlider
              label="#contrast-coeff-name"
              :max="contrastViewData.max"
              :step="0.001"
              :model-value="contrastArgs[contrastArgs.method]"
              @update:model-value="contrastChanged($event)"
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
                @keydown="handleFocusoutDialog"
                @click="contrastBtnEvent('start')"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </OverlayContainer>
</template>

<script setup lang="ts" scoped>
import { computed, ref, reactive, watch, nextTick } from 'vue';
import $style from './SettingDialog.module.scss';
import OverlayContainer from '@/components/Custom/OverlayContainer.vue';
import TheBtn from './../Custom/TheBtn.vue';
import SelectMenu from '../Custom/SelectMenu.vue';
import TheSwitch from '../Custom/TheSwitch.vue';
import TheSlider from '../Custom/TheSlider.vue';
import {
  CURRENT_OPTION_WEIGHT, BORDER_MAX_WIDTH, CONTRAST_METHODS, GAMMA_MAX,
  MULTIPLICATION_MAX, TRANSITION_MAX_COLOR, TRANSITION_MAX_POS, BORDER_COLOR,
} from '@/utils/constants';
import { isTabKey } from '@/utils/eventHandler';
// Stores / Contexts
import usePltStore from 'stores/usePltStore';
import useSettingStore from 'stores/useSettingStore';
// Types
import type { CSSProperties } from 'vue';
import type { TransitionType } from 'types/settingType';
import type { ContrastMethods } from 'types/pltType';

const emit = defineEmits<{
  (e: 'focusoutDialog'): void
}>();

const model = defineModel<boolean>();

const pltState = usePltStore();
const settingsState = useSettingStore();

const tabLabels = ['Card', 'Contrast'] as const;
const tabIdx = ref(0);

const tabRefs = ref<InstanceType<typeof TheBtn>[]>([]);

function handleFocusoutDialog(e: KeyboardEvent) {
  if (isTabKey(e)) {
    e.preventDefault();
    model.value = false;
    emit('focusoutDialog');
  }
}

watch(model, async (newVal) => {
  await nextTick();
  newVal && tabRefs.value[tabIdx.value]?.$el.focus();
  if (newVal && tabIdx.value === 1) {
    // Start adjusting when open dialog and in 2nd tab
    pltState.setIsAdjustingPlt('start');
    pltState.adjustContrast(contrastArgs.method, contrastArgs[contrastArgs.method]);
  }
});

/**
 * When tab be selected
 */
const tabSelectedStyle = {
  ...CURRENT_OPTION_WEIGHT,
  color: $style.color5,
  backgroundColor: $style.color1,
  '--overlay-hover-opacity': 0,
} as CSSProperties;
const tabStyleState = computed<(CSSProperties | undefined)[]>(() =>
  tabLabels.map((_, i) => (
    i === tabIdx.value ? tabSelectedStyle : undefined
  ))
);

const switchTab = (idx: number) => {
  if (idx === 1) { // Switch to tab-1
    pltState.setIsAdjustingPlt('start');
    pltState.adjustContrast(contrastArgs.method, contrastArgs[contrastArgs.method]);
  } else if (tabIdx.value === 1) // From tab-1 switch to another tab.
    pltState.setIsAdjustingPlt('cancel');
  tabIdx.value = idx;
};


// page 0: Card
// -Border states
const border = reactive<{
  show: boolean,
  width: number,
}>({
  show: settingsState.border.show,
  width: settingsState.border.width,
});
// -Transition states
const transition = reactive<{
  pos: number,
  color: number,
}>({
  pos: settingsState.transition.pos,
  color: settingsState.transition.color,
});

const handleSwitchStyle = (isOn: boolean) => {
  border.show = isOn;
  settingsState.setBorder('show', isOn);
};
const handleWidth = (val: number) => {
  border.width = val;
  settingsState.setBorder('width', val);
};
const handleSelectColor = (val: string) => {
  settingsState.setBorder('color', val);
};
const handleTransitionChanged = (
  val: number, attr: keyof TransitionType,
) => {
  if (attr === 'pos') transition.pos = val;
  else transition.color = val;
  settingsState.setTransition(attr, val);
};
// page 1: Contrast
type ContrastArgsType = {
  method: ContrastMethods
} & {
  [key in ContrastMethods]: number;
}
const contrastArgs = reactive<ContrastArgsType>((() => {
  const args = { method: CONTRAST_METHODS[0] } as ContrastArgsType;
  CONTRAST_METHODS.forEach((key) => {
    args[key] = 1;
  });
  return args as ContrastArgsType;
})());
const contrastViewData = computed(() =>
  contrastArgs.method === 'gamma' ? {
    max: GAMMA_MAX,
    coeff: 'gamma'
  } : {
    max:  MULTIPLICATION_MAX,
    coeff: 'scale'
  }
);

function contrastChanged(newVal: number) {
  contrastArgs[contrastArgs.method] = newVal;
  pltState.adjustContrast(contrastArgs.method, contrastArgs[contrastArgs.method]);
}

const contrastBtnEvent = (state: 'start' | 'reset') => {
  pltState.setIsAdjustingPlt(state);
  contrastChanged(1);
};
</script>
