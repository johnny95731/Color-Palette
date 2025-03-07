<template>
  <OverlayContainer
    :content-class="$style.settingDialog"
    role="dialog"
    :eager="true"
    transition="slide-y"
    transparent
    v-model="model"
  >
    <header
      v-once
      :class="$style.header"
    >
      <h2>設定</h2>
      <TheBtn
        icon="x-lg"
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
        :class="[
          $style.tab,
          i === tabIdx && $style.selected
        ]"
        :text="opt"
        @click="switchTab(i)"
      />
    </div>
    <div :class="$style.content">
      <!-- Page 0: Card -->
      <template v-if="tabIdx === 0">
        <div
          :class="$style.region"
          aria-labelledby="title-border"
        >
          <h3 id="title-border">
            Border
          </h3>
          <span>Show</span>
          <TheSwitch
            label="show border"
            hide-label
            :model-value="settingsState.border.show"
            @update:model-value="settingsState.setBorder_('show', $event)"
          />
          <template v-if="settingsState.border.show">
            <label
              id="border-width"
            >Width(px)</label>
            <TheSlider
              label="#border-width"
              :max="BORDER_MAX_WIDTH"
              :model-value="settingsState.border.width"
              @update:model-value="settingsState.setBorder_('width', $event)"
            />
            <label
              id="border-color"
            >Color</label>
            <SelectMenu
              label="#border-color"
              :items="BORDER_COLOR"
              letter-case="start"
              :model-value="settingsState.border.color"
              @update:model-value="settingsState.setBorder_('color', $event)"
            />
          </template>
        </div>
        <div
          :class="$style.region"
          aria-labelledby="title-transition"
        >
          <h3 id="title-transition">
            Transition
          </h3>
          <label
            id="transition-position"
          >Position(ms)</label>
          <TheSlider
            label="#transition-position"
            :max="TRANSITION_MAX_POS"
            step="50"
            :model-value="settingsState.transition.pos"
            @update:model-value="handleTransitionChanged($event, 'pos')"
          />
          <label
            id="transition-color"
          >Color(ms)</label>
          <TheSlider
            label="#transition-color"
            :max="TRANSITION_MAX_COLOR"
            step="50"
            :model-value="transition.color"
            @update:model-value="handleTransitionChanged($event, 'color')"
            @keydown.tab="switchTab(1)"
          />
        </div>
        <div
          :class="$style.region"
          aria-labelledby="title-Transition"
        >
          <h3 id="title-others">
            Others
          </h3>
          <label id="color-notation">Color Notation</label>
          <SelectMenu
            v-model="settingsState.colorNotation_"
            label="#color-notation"
            :items="COLOR_FUNCTIONS"
            letter-case="start"
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
            :items="CONTRAST_METHODS"
            :index="contrastArgs.method"
            @update:index="handleMethodChanged($event)"
          />
          <template v-if="contrastArgs.method !== 2">
            <label
              id="contrast-coeff-name"
            >Coeff.</label>
            <TheSlider
              label="#contrast-coeff-name"
              :max="contrastCoeffMax"
              step="0.001"
              :model-value="contrastArgs[contrastArgs.method]"
              @update:model-value="
                contrastArgs[contrastArgs.method] = $event;
                updateContrastDisplay();
              "
            />
          </template>
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
  </OverlayContainer>
</template>

<script setup lang="ts" scoped>
import { computed, ref, reactive, watch, nextTick, unref } from 'vue';
import $style from './SettingDialog.module.scss';
import OverlayContainer from '@/components/Custom/OverlayContainer.vue';
import TheBtn from './../Custom/TheBtn.vue';
import SelectMenu from '../Custom/SelectMenu.vue';
import TheSwitch from '../Custom/TheSwitch.vue';
import TheSlider from '../Custom/TheSlider.vue';
import { forLoop } from '@/utils/helpers';
import { isTabKey } from '@/utils/browser';
// constants
import { CONTRAST_METHODS, GAMMA_MAX, MULTIPLICATION_MAX } from '@/constants/colors';
import {
  BORDER_MAX_WIDTH, TRANSITION_MAX_COLOR, TRANSITION_MAX_POS, BORDER_COLOR,
  COLOR_FUNCTIONS,
} from '@/constants/settingStore';
// Stores / Contexts
import usePltStore from 'stores/usePltStore';
import useSettingStore from 'stores/useSettingStore';
// Types
import type { TransitionStyle } from 'stores/useSettingStore';

const emit = defineEmits<{
  (e: 'focusoutDialog'): void
}>();

const model = defineModel<boolean>(); // Show/Hide

const pltState = usePltStore();
const settingsState = useSettingStore();

const tabLabels = [
  'Card',
  'Contrast',
] as const;
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
  if (newVal && tabIdx.value === 1) {
    // Start adjusting when open dialog and in 2nd tab
    pltState.setIsAdjustingPlt_('start');
    updateContrastDisplay();
  } else if (!newVal && pltState.isAdjustingPlt_)
    pltState.setIsAdjustingPlt_('cancel');
  unref(tabRefs)[unref(tabIdx)]?.$el.focus();
});

const switchTab = (idx: number) => {
  if (idx === 1) { // Switch to tab-1
    pltState.setIsAdjustingPlt_('start');
    updateContrastDisplay();
  } else if (tabIdx.value === 1) // From tab-1 switch to another tab.
    pltState.setIsAdjustingPlt_('cancel');
  tabIdx.value = idx;
};


// page 0: Card
// -Transition states
const transition = reactive<{
  pos: number,
  color: number,
}>({
  pos: settingsState.transition.pos,
  color: settingsState.transition.color,
});

const handleTransitionChanged = (
  val: number, attr: keyof TransitionStyle,
) => {
  if (attr === 'pos') transition.pos = val;
  else transition.color = val;
  settingsState.setTransition_(attr, val);
};
// page 1: Contrast
type ContrastArgs = {
  method: number
} & {
  [key in number]: number;
}
const contrastArgs = reactive<ContrastArgs>(
  forLoop(
    CONTRAST_METHODS,
    (prev, _, i) => ((prev[i] = 1), prev),
    { method: 0 } as ContrastArgs
  ));
const contrastCoeffMax = computed(() => {
  return contrastArgs.method ? GAMMA_MAX : MULTIPLICATION_MAX;
});

const handleMethodChanged = (idx: number) => {
  contrastArgs.method = idx!;
  pltState.setIsAdjustingPlt_('reset');
  updateContrastDisplay();
};

function updateContrastDisplay() {
  pltState.adjustContrast_(
    contrastArgs.method,
    contrastArgs[contrastArgs.method]
  );
}

const contrastBtnEvent = (state: 'start' | 'reset') => {
  pltState.setIsAdjustingPlt_(state);
  contrastArgs[contrastArgs.method] = 1;
  updateContrastDisplay();
};
</script>
